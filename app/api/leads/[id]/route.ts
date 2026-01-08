import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateLeadSchema = z.object({
    status: z.string().optional(),
    assigneeId: z.number().optional().nullable(),
    financeUserId: z.number().optional(),
    opsUserId: z.number().optional(),
    remark: z.string().optional(),
    notes: z.string().optional(),
    baseTotal: z.number().optional()
})

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { status, assigneeId, financeUserId, opsUserId, remark, notes, baseTotal } = updateLeadSchema.parse(body)

        // Verify lead exists
        const lead = await db.lead.findUnique({
            where: { id: Number(params.id) }
        })

        if (!lead) {
            return new NextResponse("Lead not found", { status: 404 })
        }

        // Prepare update data
        let updateData: any = {}
        let logAction = "UPDATE"
        let logDetails = ""

        // 0. Base Total Update
        if (baseTotal !== undefined && baseTotal !== Number(lead.baseTotal)) {
            updateData.baseTotal = baseTotal
            // Recalculate final total if discount exists
            if (lead.discountPercentApplied) {
                const discountAmount = (baseTotal * lead.discountPercentApplied) / 100
                updateData.discountAmount = discountAmount
                updateData.finalTotal = baseTotal - discountAmount
                logDetails += `Base Price updated to ${baseTotal}. Discount recalculated. `
            } else {
                updateData.finalTotal = baseTotal
                logDetails += `Base Price updated to ${baseTotal}. `
            }
        }

        // 1. Status Change
        if (status && status !== lead.status) {
            updateData.status = status
            logAction = "STATUS_CHANGE"
            logDetails += `Status changed from ${lead.status} to ${status}. `
        }

        // 2. Assignee Change (Generic)
        if (assigneeId !== undefined) {
            updateData.assigneeId = assigneeId
            // If manual reassignment
            if (assigneeId !== lead.assigneeId) {
                logDetails += `Reassigned to User #${assigneeId}. `
            }
        }

        // 3. Finance Handoff (Sales -> Finance)
        if (financeUserId) {
            updateData.financeUserId = financeUserId
            updateData.assigneeId = financeUserId // Assign to Finance Rep
            updateData.status = "IN_PROGRESS" // Force status if not provided
            logAction = "HANDOFF_FINANCE"
            logDetails += `Handed off to Finance User #${financeUserId}. `
        }

        // 4. Ops Handoff (Finance -> Ops)
        if (opsUserId) {
            updateData.opsUserId = opsUserId
            updateData.assigneeId = opsUserId // Assign to Ops Rep
            updateData.status = "HANDOFF_TO_OPS" // Update Status
            logAction = "HANDOFF_OPS"
            logDetails += `Handed off to Ops User #${opsUserId}. `
        }

        // 5. Remark (Just a note)
        if (remark) {
            logDetails += `Remark: ${remark} `
            if (logAction === "UPDATE") logAction = "NOTE"
        }

        // 6. Notes Update (Main Notes Field)
        if (notes !== undefined && notes !== lead.notes) {
            updateData.notes = notes
            const preview = notes.length > 50 ? notes.substring(0, 50) + "..." : notes
            logDetails += `Notes updated: "${preview}" `
            // If only notes changed, we might want to log the specific change or just say "Notes updated"
            if (logAction === "UPDATE") logAction = "NOTE_UPDATE"
        }

        // SAFEGUARD: Ensure salesUserId is preserved/set before handoff
        if ((financeUserId || opsUserId) && !lead.salesUserId) {
            // If we are handing off but salesUserId is missing, assume the CURRENT assignee (before update) was the sales rep
            // This handles legacy cases or flow gaps
            // We need to fetch the current assignee's role if not validated, but typically we can trust the current assignment if valid
            // Since we didn't fetch assignee role in the initial query, let's trust valid IDs.
            if (lead.assigneeId) {
                updateData.salesUserId = lead.assigneeId
                // We don't log this explicitly to avoid noise, but it persists the sales rep
            }
        }

        // Perform Update
        await db.lead.update({
            where: { id: Number(params.id) },
            data: updateData
        })

        // Create Log Entry
        if (logDetails || remark) {
            await db.leadLog.create({
                data: {
                    leadId: lead.id,
                    userId: Number(session.user.id),
                    action: logAction,
                    details: logDetails || (remark || "Updated lead details")
                }
            })
        }

        // Fetch fresh data to return (including the new log)
        const finalLead = await db.lead.findUnique({
            where: { id: Number(params.id) },
            include: {
                assignee: { select: { name: true } },
                salesUser: { select: { name: true } },
                financeUser: { select: { name: true } },
                opsUser: { select: { name: true } },
                logs: {
                    orderBy: { createdAt: 'desc' },
                    include: { user: { select: { name: true, role: true } } }
                }
            }
        })

        return NextResponse.json(finalLead)
    } catch (error) {
        console.error("LEAD_PATCH", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const leadId = Number(params.id)

        // Use transaction to ensure complete cleanup
        await db.$transaction(async (tx) => {
            // 1. Clean up Payment module related data if exists
            const leadPayment = await tx.leadPayment.findUnique({
                where: { leadId }
            })

            if (leadPayment) {
                await tx.paymentTransaction.deleteMany({ where: { leadPaymentId: leadPayment.id } })
                await tx.paymentReminderLog.deleteMany({ where: { leadPaymentId: leadPayment.id } })
                await tx.paymentFollowupNote.deleteMany({ where: { leadPaymentId: leadPayment.id } })
                await tx.leadPayment.delete({ where: { id: leadPayment.id } })
            }

            // 2. Clean up other direct relations
            await tx.discountRequest.deleteMany({ where: { leadId } })
            await tx.leadCampaignItem.deleteMany({ where: { leadId } })
            await tx.leadLog.deleteMany({ where: { leadId } })

            // 3. Delete the Lead itself
            await tx.lead.delete({ where: { id: leadId } })
        })

        return new NextResponse("Deleted", { status: 200 })
    } catch (error) {
        console.error("LEAD_DELETE", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
