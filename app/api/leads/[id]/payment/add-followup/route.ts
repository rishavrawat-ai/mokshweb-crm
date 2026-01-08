import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";

/**
 * POST /api/leads/[id]/payment/add-followup
 * Add a follow-up note for payment
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
        const { note } = body;

        if (!note || note.trim() === "") {
            return new NextResponse("Follow-up note is required", { status: 400 });
        }

        // Get payment
        const payment = await db.leadPayment.findUnique({
            where: { leadId },
        });

        if (!payment) {
            return new NextResponse("Payment not found", { status: 404 });
        }

        // Add followup note
        const followupNote = await db.paymentFollowupNote.create({
            data: {
                leadPaymentId: payment.id,
                note: note.trim(),
                createdBy: Number(session.user.id),
            },
        });

        // Update payment last followup
        await db.leadPayment.update({
            where: { leadId },
            data: {
                lastFollowupAt: new Date(),
                lastFollowupNote: note.trim(),
            },
        });

        // Audit log
        await createAuditLog(
            Number(session.user.id),
            "PAYMENT_FOLLOWUP_ADDED",
            "LeadPayment",
            payment.id.toString(),
            {
                leadId,
                note: note.substring(0, 100),
            }
        );

        return NextResponse.json({
            success: true,
            followupNote,
        });
    } catch (error) {
        console.error("ADD_FOLLOWUP_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
