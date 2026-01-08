import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { calculateNextReminder, isPromiseBroken } from "@/lib/discount-utils";
import { createAuditLog } from "@/lib/audit";

/**
 * POST /api/leads/[id]/payment/mark-paid
 * Mark payment as fully or partially paid
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

        if (!["FINANCE", "ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
            return new NextResponse("Forbidden: Finance access required", {
                status: 403,
            });
        }

        const leadId = parseInt(params.id);
        const body = await req.json();
        const { amount, mode, transactionRef, proofUrl, notes } = body;

        if (!amount || amount <= 0) {
            return new NextResponse("Valid amount is required", { status: 400 });
        }

        if (!mode) {
            return new NextResponse("Payment mode is required", { status: 400 });
        }

        // Get payment
        const payment = await db.leadPayment.findUnique({
            where: { leadId },
        });

        if (!payment) {
            return new NextResponse("Payment not found", { status: 404 });
        }

        const currentPaid = Number(payment.paidAmount);
        const total = Number(payment.totalAmount);
        const newPaidAmount = currentPaid + amount;
        const newPendingAmount = total - newPaidAmount;

        if (newPaidAmount > total) {
            return new NextResponse("Payment amount exceeds total", { status: 400 });
        }

        // Determine new status
        let newStatus = payment.status;
        if (newPendingAmount === 0) {
            newStatus = "PAID";
        } else if (newPaidAmount > 0) {
            newStatus = "PARTIAL";
        }

        // Create transaction record
        const transaction = await db.paymentTransaction.create({
            data: {
                leadPaymentId: payment.id,
                amount,
                mode,
                transactionRef,
                proofUrl,
                notes,
            },
        });

        // Update payment
        const updatedPayment = await db.leadPayment.update({
            where: { leadId },
            data: {
                paidAmount: newPaidAmount,
                pendingAmount: newPendingAmount,
                status: newStatus,
                nextReminderAt: newStatus === "PAID" ? null : payment.nextReminderAt,
            },
        });

        // Audit log
        await createAuditLog(
            Number(session.user.id),
            "PAYMENT_RECORDED",
            "LeadPayment",
            payment.id.toString(),
            {
                leadId,
                amount,
                mode,
                transactionRef,
                newStatus,
                newPaidAmount,
                newPendingAmount,
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
            transaction: {
                ...transaction,
                amount: Number(transaction.amount),
            },
        });
    } catch (error) {
        console.error("MARK_PAID_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
