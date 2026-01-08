
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const leadId = parseInt(params.id)
        if (isNaN(leadId)) {
            return new NextResponse("Invalid lead ID", { status: 400 })
        }

        const body = await req.json()
        const { assigneeId } = body

        if (!assigneeId) {
            return new NextResponse("Assignee ID required", { status: 400 })
        }

        // Verify assignee exists
        const assignee = await db.user.findUnique({
            where: { id: parseInt(assigneeId) }
        })

        if (!assignee) {
            return new NextResponse("User not found", { status: 404 })
        }

        // Update lead
        // Logic: Always update assigneeId
        // If the new assignee is SALES role, or if salesUserId is currently null, we set salesUserId as well to keep track of the sales rep.

        const updateData: any = {
            assigneeId: parseInt(assigneeId)
        }

        if (assignee.role === "SALES" || assignee.role === "ADMIN" || assignee.role === "SUPER_ADMIN") {
            // We can optimistically set this as the sales user if they are from sales team
            // OR we can fetch the lead first to check if salesUserId is null, but a simpler approach is:
            // If we are assigning to a sales rep, they become the salesUser.
            updateData.salesUserId = parseInt(assigneeId)
        }

        const lead = await db.lead.update({
            where: { id: leadId },
            data: updateData
        })

        // Log the assignment
        await db.leadLog.create({
            data: {
                leadId: leadId,
                userId: parseInt(session.user.id),
                action: "ASSIGNMENT",
                details: `Assigned lead to ${assignee.name}`
            }
        })

        return NextResponse.json(lead)

    } catch (error) {
        console.error("LEAD_ASSIGN_PUT", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
