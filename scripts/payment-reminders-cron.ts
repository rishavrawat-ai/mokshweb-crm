import { db } from "../lib/db";
import { sendEmail } from "../lib/email";
import {
    getClientPaymentReminderTemplate,
    getInternalPaymentReminderTemplate,
} from "../lib/email-templates";
import {
    calculateNextReminder,
    isPaymentOverdue,
    isPromiseBroken,
} from "../lib/discount-utils";

/**
 * Payment Reminders Cron Job
 * Run hourly to send payment reminders to clients, sales reps, and finance team
 * Sending window: 9am-7pm Asia/Kolkata
 */
export async function runPaymentReminders() {
    console.log("[Payment Reminders] Starting cron job...");

    const now = new Date();
    const hour = now.getHours();

    // Only run between 9am-7pm IST
    if (hour < 9 || hour >= 19) {
        console.log(
            `[Payment Reminders] Outside sending window (9am-7pm IST). Current hour: ${hour}`
        );
        return;
    }

    try {
        // Get payments due for reminder
        const payments = await db.leadPayment.findMany({
            where: {
                nextReminderAt: {
                    lte: now,
                },
                stopReminders: false,
                status: {
                    notIn: ["PAID", "CANCELLED", "NOT_RAISED"],
                },
            },
            include: {
                lead: {
                    include: {
                        salesUser: true,
                        financeUser: true,
                    },
                },
            },
        });

        console.log(`[Payment Reminders] Found ${payments.length} payments to process`);

        let successCount = 0;
        let errorCount = 0;

        for (const payment of payments) {
            try {
                console.log(`[Payment Reminders] Processing payment ${payment.id} for lead ${payment.leadId}`);

                // Check if promise is broken
                if (isPromiseBroken(payment.status, payment.clientCommitmentDate)) {
                    console.log(`[Payment Reminders] Promise broken for payment ${payment.id}`);
                    await db.leadPayment.update({
                        where: { id: payment.id },
                        data: { status: "BROKEN_PROMISE" },
                    });
                }

                // Check if overdue
                const overdue = isPaymentOverdue(payment.dueDate, payment.status);
                if (overdue && payment.status === "PENDING") {
                    console.log(`[Payment Reminders] Payment ${payment.id} is overdue`);
                    await db.leadPayment.update({
                        where: { id: payment.id },
                        data: { status: "OVERDUE" },
                    });
                }

                // Send to CLIENT
                if (payment.lead.email) {
                    try {
                        const clientTemplate = getClientPaymentReminderTemplate({
                            customerName: payment.lead.customerName,
                            invoiceNo: payment.invoiceNo || undefined,
                            totalAmount: Number(payment.totalAmount),
                            paidAmount: Number(payment.paidAmount),
                            pendingAmount: Number(payment.pendingAmount),
                            dueDate: payment.dueDate!,
                            salesRepName: payment.lead.salesUser?.name || "Sales Team",
                            salesRepPhone: payment.lead.salesUser?.phone || undefined,
                            isOverdue: overdue,
                        });

                        await sendEmail({
                            to: payment.lead.email,
                            subject: clientTemplate.subject,
                            html: clientTemplate.html,
                        });

                        await db.paymentReminderLog.create({
                            data: {
                                leadPaymentId: payment.id,
                                recipientType: "CLIENT",
                                recipientEmail: payment.lead.email,
                                channel: "EMAIL",
                                status: "SENT",
                            },
                        });

                        console.log(`[Payment Reminders] Sent client reminder to ${payment.lead.email}`);
                    } catch (error) {
                        console.error(`[Payment Reminders] Failed to send client reminder:`, error);
                        await db.paymentReminderLog.create({
                            data: {
                                leadPaymentId: payment.id,
                                recipientType: "CLIENT",
                                recipientEmail: payment.lead.email,
                                channel: "EMAIL",
                                status: "FAILED",
                                errorMessage: error instanceof Error ? error.message : "Unknown error",
                            },
                        });
                    }
                }

                // Send to SALES
                if (payment.lead.salesUser?.email) {
                    try {
                        const internalTemplate = getInternalPaymentReminderTemplate({
                            leadName: payment.lead.customerName,
                            leadPhone: payment.lead.phone,
                            invoiceNo: payment.invoiceNo || undefined,
                            pendingAmount: Number(payment.pendingAmount),
                            dueDate: payment.dueDate!,
                            status: payment.status,
                            lastFollowupNote: payment.lastFollowupNote || undefined,
                            clientCommitmentDate: payment.clientCommitmentDate || undefined,
                            isOverdue: overdue,
                        });

                        await sendEmail({
                            to: payment.lead.salesUser.email,
                            subject: internalTemplate.subject,
                            html: internalTemplate.html,
                        });

                        await db.paymentReminderLog.create({
                            data: {
                                leadPaymentId: payment.id,
                                recipientType: "SALES",
                                recipientEmail: payment.lead.salesUser.email,
                                channel: "EMAIL",
                                status: "SENT",
                            },
                        });

                        console.log(`[Payment Reminders] Sent sales reminder to ${payment.lead.salesUser.email}`);
                    } catch (error) {
                        console.error(`[Payment Reminders] Failed to send sales reminder:`, error);
                        await db.paymentReminderLog.create({
                            data: {
                                leadPaymentId: payment.id,
                                recipientType: "SALES",
                                recipientEmail: payment.lead.salesUser.email,
                                channel: "EMAIL",
                                status: "FAILED",
                                errorMessage: error instanceof Error ? error.message : "Unknown error",
                            },
                        });
                    }
                }

                // Send to FINANCE
                if (payment.lead.financeUser?.email) {
                    try {
                        const internalTemplate = getInternalPaymentReminderTemplate({
                            leadName: payment.lead.customerName,
                            leadPhone: payment.lead.phone,
                            invoiceNo: payment.invoiceNo || undefined,
                            pendingAmount: Number(payment.pendingAmount),
                            dueDate: payment.dueDate!,
                            status: payment.status,
                            lastFollowupNote: payment.lastFollowupNote || undefined,
                            clientCommitmentDate: payment.clientCommitmentDate || undefined,
                            isOverdue: overdue,
                        });

                        await sendEmail({
                            to: payment.lead.financeUser.email,
                            subject: internalTemplate.subject,
                            html: internalTemplate.html,
                        });

                        await db.paymentReminderLog.create({
                            data: {
                                leadPaymentId: payment.id,
                                recipientType: "FINANCE",
                                recipientEmail: payment.lead.financeUser.email,
                                channel: "EMAIL",
                                status: "SENT",
                            },
                        });

                        console.log(`[Payment Reminders] Sent finance reminder to ${payment.lead.financeUser.email}`);
                    } catch (error) {
                        console.error(`[Payment Reminders] Failed to send finance reminder:`, error);
                        await db.paymentReminderLog.create({
                            data: {
                                leadPaymentId: payment.id,
                                recipientType: "FINANCE",
                                recipientEmail: payment.lead.financeUser.email,
                                channel: "EMAIL",
                                status: "FAILED",
                                errorMessage: error instanceof Error ? error.message : "Unknown error",
                            },
                        });
                    }
                }

                // Calculate next reminder
                const nextReminder = calculateNextReminder(
                    payment.status,
                    payment.dueDate,
                    payment.clientCommitmentDate
                );

                await db.leadPayment.update({
                    where: { id: payment.id },
                    data: { nextReminderAt: nextReminder },
                });

                console.log(`[Payment Reminders] Updated next reminder for payment ${payment.id}: ${nextReminder}`);
                successCount++;
            } catch (error) {
                console.error(`[Payment Reminders] Failed to process payment ${payment.id}:`, error);
                errorCount++;
            }
        }

        console.log(
            `[Payment Reminders] Completed. Success: ${successCount}, Errors: ${errorCount}`
        );
    } catch (error) {
        console.error("[Payment Reminders] Fatal error:", error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    runPaymentReminders()
        .then(() => {
            console.log("[Payment Reminders] Job completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("[Payment Reminders] Job failed:", error);
            process.exit(1);
        });
}
