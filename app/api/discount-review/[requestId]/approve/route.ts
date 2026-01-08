import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifySecureToken, verifyOTP } from "@/lib/discount-utils";
import { createAuditLog } from "@/lib/audit";

/**
 * POST /api/discount-review/[requestId]/approve
 * Approve discount request with OTP verification (Super Admin)
 */
export async function POST(
    req: Request,
    { params }: { params: { requestId: string } }
) {
    try {
        const { requestId } = params;
        const body = await req.json();
        const { token, otp, approvedPercent, comment } = body;

        if (!token || !otp) {
            return new NextResponse("Token and OTP are required", { status: 400 });
        }

        // Get discount request
        const discountRequest = await db.discountRequest.findUnique({
            where: { id: requestId },
            include: {
                lead: true,
                requestedByUser: true,
            },
        });

        if (!discountRequest) {
            return new NextResponse("Discount request not found", { status: 404 });
        }

        // Check if already processed
        if (
            discountRequest.status === "APPROVED" ||
            discountRequest.status === "REJECTED"
        ) {
            return new NextResponse(
                `Request already ${discountRequest.status.toLowerCase()}`,
                { status: 400 }
            );
        }

        // Verify token
        const superAdminEmail =
            process.env.SUPER_ADMIN_EMAIL || "gohypedevelopers@gmail.com";

        if (
            !discountRequest.tokenHash ||
            !discountRequest.tokenExpiresAt ||
            new Date() > discountRequest.tokenExpiresAt
        ) {
            return new NextResponse("Token expired", { status: 401 });
        }

        const isValidToken = verifySecureToken(
            requestId,
            superAdminEmail,
            token,
            discountRequest.tokenHash
        );

        if (!isValidToken) {
            return new NextResponse("Invalid token", { status: 401 });
        }

        // Verify OTP
        if (
            !discountRequest.otpHash ||
            !discountRequest.otpExpiresAt ||
            new Date() > discountRequest.otpExpiresAt
        ) {
            return new NextResponse("OTP expired", { status: 401 });
        }

        const isValidOTP = await verifyOTP(otp, discountRequest.otpHash);

        if (!isValidOTP) {
            await createAuditLog(
                null,
                "DISCOUNT_INVALID_OTP_ATTEMPT",
                "DiscountRequest",
                requestId,
                { otp: "***" }
            );
            return new NextResponse("Invalid OTP", { status: 401 });
        }

        // Determine approved percentage (can be different from requested)
        const finalApprovedPercent = approvedPercent || discountRequest.requestedPercent;

        if (finalApprovedPercent < 1 || finalApprovedPercent > 100) {
            return new NextResponse("Approved discount must be between 1 and 100", {
                status: 400,
            });
        }

        // Calculate final amounts
        const baseTotal = Number(discountRequest.lead.baseTotal);
        const discountAmount = (baseTotal * finalApprovedPercent) / 100;
        const finalTotal = baseTotal - discountAmount;

        // Update discount request
        await db.discountRequest.update({
            where: { id: requestId },
            data: {
                status: "APPROVED",
                approvedPercent: finalApprovedPercent,
                approvedAt: new Date(),
            },
        });

        // Update lead with approved discount
        await db.lead.update({
            where: { id: discountRequest.leadId },
            data: {
                discountPercentApplied: finalApprovedPercent,
                discountAmount: discountAmount,
                finalTotal: finalTotal,
            },
        });

        // Audit log
        await createAuditLog(
            null,
            "DISCOUNT_APPROVED",
            "DiscountRequest",
            requestId,
            {
                leadId: discountRequest.leadId,
                requestedPercent: discountRequest.requestedPercent,
                approvedPercent: finalApprovedPercent,
                baseTotal,
                finalTotal,
                comment,
            }
        );

        return NextResponse.json({
            success: true,
            message: "Discount approved successfully",
            approvedPercent: finalApprovedPercent,
            finalTotal,
        });
    } catch (error) {
        console.error("APPROVE_DISCOUNT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
