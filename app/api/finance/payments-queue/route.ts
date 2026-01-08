import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET /api/finance/payments-queue
 * Get all payments with filters for Finance dashboard
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (
            !["FINANCE", "ADMIN", "SUPER_ADMIN"].includes(session.user.role)
        ) {
            return new NextResponse("Forbidden: Finance access required", {
                status: 403,
            });
        }

        const { searchParams } = new URL(req.url);
        const filter = searchParams.get("filter"); // due_today, this_week, overdue, promised, broken_promise
        const status = searchParams.get("status");
        const search = searchParams.get("search");

        // Build where clause
        const where: any = {
            status: {
                not: "NOT_RAISED",
            },
        };

        if (status) {
            where.status = status;
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(today);
        endOfToday.setDate(endOfToday.getDate() + 1);

        const endOfWeek = new Date(today);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        if (filter === "due_today") {
            where.dueDate = {
                gte: today,
                lt: endOfToday,
            };
            where.status = {
                in: ["PENDING", "PARTIAL"],
            };
        } else if (filter === "this_week") {
            where.dueDate = {
                gte: today,
                lt: endOfWeek,
            };
            where.status = {
                in: ["PENDING", "PARTIAL"],
            };
        } else if (filter === "overdue") {
            where.status = "OVERDUE";
        } else if (filter === "promised") {
            where.status = "PROMISED";
        } else if (filter === "broken_promise") {
            where.status = "BROKEN_PROMISE";
        }

        if (search) {
            where.OR = [
                {
                    lead: {
                        customerName: {
                            contains: search,
                        },
                    },
                },
                {
                    lead: {
                        phone: {
                            contains: search,
                        },
                    },
                },
                {
                    invoiceNo: {
                        contains: search,
                    },
                },
            ];
        }

        // Get payments
        const payments = await db.leadPayment.findMany({
            where,
            include: {
                lead: {
                    include: {
                        salesUser: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                        financeUser: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                reminderLogs: {
                    orderBy: { sentAt: "desc" },
                    take: 1,
                },
            },
            orderBy: [
                { status: "asc" },
                { dueDate: "asc" },
            ],
        });

        // Format response
        const formattedPayments = payments.map((payment) => ({
            id: payment.id,
            leadId: payment.leadId,
            leadName: payment.lead.customerName,
            leadPhone: payment.lead.phone,
            leadEmail: payment.lead.email,
            invoiceNo: payment.invoiceNo,
            totalAmount: Number(payment.totalAmount),
            paidAmount: Number(payment.paidAmount),
            pendingAmount: Number(payment.pendingAmount),
            dueDate: payment.dueDate,
            clientCommitmentDate: payment.clientCommitmentDate,
            commitmentChannel: payment.commitmentChannel,
            status: payment.status,
            salesRep: payment.lead.salesUser,
            financeUser: payment.lead.financeUser,
            lastFollowupAt: payment.lastFollowupAt,
            lastFollowupNote: payment.lastFollowupNote,
            lastReminderSent: payment.reminderLogs[0]?.sentAt || null,
            nextReminderAt: payment.nextReminderAt,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
        }));

        return NextResponse.json({
            success: true,
            payments: formattedPayments,
            total: formattedPayments.length,
        });
    } catch (error) {
        console.error("GET_PAYMENTS_QUEUE_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
