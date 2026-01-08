import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { calculateNextReminder, isPaymentOverdue } from "@/lib/discount-utils";
import { createAuditLog } from "@/lib/audit";

/**
 * GET /api/leads/[id]/payment
 * Get payment details for a lead
 */
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const leadId = parseInt(params.id);
        if (isNaN(leadId)) {
            return new NextResponse("Invalid lead ID", { status: 400 });
        }

        // Get payment with all relations
        const payment = await db.leadPayment.findUnique({
            where: { leadId },
            include: {
                transactions: {
                    orderBy: { paidAt: "desc" },
                },
                followupNotes: {
                    orderBy: { createdAt: "desc" },
                },
                reminderLogs: {
                    orderBy: { sentAt: "desc" },
                    take: 20,
                },
            },
        });

        if (!payment) {
            // Return empty payment structure
            return NextResponse.json({
                success: true,
                payment: null,
            });
        }

        return NextResponse.json({
            success: true,
            payment: {
                ...payment,
                totalAmount: Number(payment.totalAmount),
                paidAmount: Number(payment.paidAmount),
                pendingAmount: Number(payment.pendingAmount),
                transactions: payment.transactions.map((t) => ({
                    ...t,
                    amount: Number(t.amount),
                })),
            },
        });
    } catch (error) {
        console.error("GET_PAYMENT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

/**
 * POST /api/leads/[id]/payment
 * Create or update payment for a lead
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

        // Only FINANCE, ADMIN, SUPER_ADMIN can manage payments
        if (
            !["FINANCE", "ADMIN", "SUPER_ADMIN"].includes(session.user.role)
        ) {
            return new NextResponse("Forbidden: Finance access required", {
                status: 403,
            });
        }

        const leadId = parseInt(params.id);
        if (isNaN(leadId)) {
            return new NextResponse("Invalid lead ID", { status: 400 });
        }

        const body = await req.json();
        const {
            invoiceNo,
            totalAmount,
            dueDate,
            status = "PENDING",
        } = body;

        if (!totalAmount || totalAmount <= 0) {
            return new NextResponse("Valid total amount is required", {
                status: 400,
            });
        }

        // Check if lead exists
        const lead = await db.lead.findUnique({
            where: { id: leadId },
        });

        if (!lead) {
            return new NextResponse("Lead not found", { status: 404 });
        }

        // Calculate next reminder
        const nextReminder = dueDate
            ? calculateNextReminder(status, new Date(dueDate), null)
            : null;

        // Create or update payment
        const payment = await db.leadPayment.upsert({
            where: { leadId },
            create: {
                leadId,
                invoiceNo,
                totalAmount,
                paidAmount: 0,
                pendingAmount: totalAmount,
                dueDate: dueDate ? new Date(dueDate) : null,
                status,
                nextReminderAt: nextReminder,
            },
            update: {
                invoiceNo,
                totalAmount,
                pendingAmount: totalAmount,
                dueDate: dueDate ? new Date(dueDate) : null,
                status,
                nextReminderAt: nextReminder,
            },
        });

        // Audit log
        await createAuditLog(
            Number(session.user.id),
            "PAYMENT_CREATED_OR_UPDATED",
            "LeadPayment",
            payment.id.toString(),
            {
                leadId,
                invoiceNo,
                totalAmount,
                dueDate,
            }
        );

        return NextResponse.json({
            success: true,
            payment: {
                ...payment,
                totalAmount: Number(payment.totalAmount),
                paidAmount: Number(payment.paidAmount),
                pendingAmount: Number(payment.pendingAmount),
            },
        });
    } catch (error) {
        console.error("CREATE_PAYMENT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
