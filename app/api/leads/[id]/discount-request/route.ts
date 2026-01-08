import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { generateSecureToken } from "@/lib/discount-utils";
import { getDiscountApprovalEmailTemplate } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/audit";

/**
 * POST /api/leads/[id]/discount-request
 * Create a new discount request for a lead (Sales Rep)
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

        // Only SALES can create discount requests
        if (session.user.role !== "SALES") {
            return new NextResponse("Forbidden: Only sales reps can request discounts", {
                status: 403,
            });
        }

        const leadId = parseInt(params.id);
        if (isNaN(leadId)) {
            return new NextResponse("Invalid lead ID", { status: 400 });
        }

        const body = await req.json();
        const { requestedPercent, reason, budgetDetails, campaignDetails } = body;

        if (!requestedPercent || !reason) {
            return new NextResponse("Requested discount and reason are required", {
                status: 400,
            });
        }

        if (requestedPercent < 1 || requestedPercent > 100) {
            return new NextResponse("Discount must be between 1 and 100", {
                status: 400,
            });
        }

        // Get lead with campaign items
        const lead = await db.lead.findUnique({
            where: { id: leadId },
            include: {
                campaignItems: {
                    include: {
                        inventoryHoarding: true,
                    },
                },
                salesUser: true,
            },
        });

        if (!lead) {
            return new NextResponse("Lead not found", { status: 404 });
        }

        // Calculate prices
        const baseTotal = Number(lead.baseTotal);
        const discountAmount = (baseTotal * requestedPercent) / 100;
        const finalTotal = baseTotal - discountAmount;

        // Get Super Admin email
        const superAdminEmail =
            process.env.SUPER_ADMIN_EMAIL || "gohypedevelopers@gmail.com";

        // Generate secure token for email link
        const { token, hash: tokenHash, expiresAt: tokenExpiresAt } = generateSecureToken(
            leadId.toString(),
            superAdminEmail
        );

        // Create discount request
        const discountRequest = await db.discountRequest.create({
            data: {
                leadId,
                requestedByUserId: Number(session.user.id),
                requestedPercent,
                reason,
                status: "PENDING",
                tokenHash,
                tokenExpiresAt,
            },
            include: {
                lead: true,
                requestedByUser: true,
            },
        });

        // Build review link
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const reviewLink = `${baseUrl}/discount-review/${discountRequest.id}?token=${token}`;

        // Prepare campaign details for email
        let campaignDetailsText = campaignDetails || "";
        if (lead.campaignItems.length > 0) {
            campaignDetailsText += "\n\nSelected Campaign Items:\n";
            lead.campaignItems.forEach((item, idx) => {
                campaignDetailsText += `${idx + 1}. ${item.inventoryHoarding.location}, ${item.inventoryHoarding.city} - ₹${Number(item.total).toLocaleString("en-IN")}\n`;
            });
        }

        // Send email to Super Admin
        const emailTemplate = getDiscountApprovalEmailTemplate({
            leadName: lead.customerName,
            leadPhone: lead.phone,
            leadEmail: lead.email || undefined,
            salesRepName: session.user.name || "Unknown",
            requestedDiscount: requestedPercent,
            basePriceBeforeDiscount: baseTotal,
            finalPriceAfterDiscount: finalTotal,
            reason,
            budgetDetails,
            campaignDetails: campaignDetailsText,
            reviewLink,
        });

        await sendEmail({
            to: superAdminEmail,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
        });

        // Create audit log
        await createAuditLog(
            Number(session.user.id),
            "DISCOUNT_REQUEST_CREATED",
            "DiscountRequest",
            discountRequest.id,
            {
                leadId,
                requestedPercent,
                baseTotal,
                finalTotal,
            }
        );

        return NextResponse.json({
            success: true,
            requestId: discountRequest.id,
            message: "Discount request sent to Super Admin for approval",
        });
    } catch (error) {
        console.error("DISCOUNT_REQUEST_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
