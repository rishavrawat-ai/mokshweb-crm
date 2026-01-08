import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { calculateNextReminder, isPromiseBroken } from "@/lib/discount-utils";
import { createAuditLog } from "@/lib/audit";

/**
 * POST /api/leads/[id]/payment/add-commitment
 * Add client commitment date (promise to pay)
 */
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (
            !["SALES", "FINANCE", "ADMIN", "SUPER_ADMIN"].includes(
                session.user.role
            )
        ) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const leadId = parseInt(params.id);
        const body = await req.json();
        const { commitmentDate, channel, note } = body;

        if (!commitmentDate || !channel || !note) {
            return new NextResponse(
                "Commitment date, channel, and note are required",
                { status: 400 }
            );
        }

        // Get payment
        const payment = await db.leadPayment.findUnique({
            where: { leadId },
        });

        if (!payment) {
            return new NextResponse("Payment not found", { status: 404 });
        }

        // Check if current promise is broken
        const promiseBroken = isPromiseBroken(
            payment.status,
            payment.clientCommitmentDate
        );

        // Calculate next reminder based on promise
        const nextReminder = calculateNextReminder(
            "PROMISED",
            payment.dueDate,
            new Date(commitmentDate)
        );

        // Update payment
        const updatedPayment = await db.leadPayment.update({
            where: { leadId },
            data: {
                clientCommitmentDate: new Date(commitmentDate),
                commitmentChannel: channel,
                commitmentNote: note,
                status: promiseBroken ? "BROKEN_PROMISE" : "PROMISED",
                lastFollowupAt: new Date(),
                lastFollowupNote: `Client committed to pay by ${new Date(
                    commitmentDate
                ).toLocaleDateString("en-IN")} via ${channel}. Note: ${note}`,
                nextReminderAt: nextReminder,
            },
        });

        // Add followup note
        await db.paymentFollowupNote.create({
            data: {
                leadPaymentId: payment.id,
                note: `Client committed to pay by ${new Date(
                    commitmentDate
                ).toLocaleDateString("en-IN")} via ${channel}. ${note}`,
                createdBy: Number(session.user.id),
            },
        });

        // Audit log
        await createAuditLog(
            Number(session.user.id),
            "PAYMENT_COMMITMENT_ADDED",
            "LeadPayment",
            payment.id.toString(),
            {
                leadId,
                commitmentDate,
                channel,
                note,
                promiseBroken,
            }
        );

        return NextResponse.json({
            success: true,
            payment: {
                ...updatedPayment,
                totalAmount: Number(updatedPayment.totalAmount),
                paidAmount: Number(updatedPayment.paidAmount),
                pendingAmount: Number(updatedPayment.pendingAmount),
            },
        });
    } catch (error) {
        console.error("ADD_COMMITMENT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
