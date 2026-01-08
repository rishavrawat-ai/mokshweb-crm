import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifySecureToken, verifyOTP } from "@/lib/discount-utils";
import { createAuditLog } from "@/lib/audit";

/**
 * POST /api/discount-review/[requestId]/reject
 * Reject discount request with OTP verification (Super Admin)
 */
export async function POST(
    req: Request,
    { params }: { params: { requestId: string } }
) {
    try {
        const { requestId } = params;
        const body = await req.json();
        const { token, otp, rejectionReason } = body;

        if (!token || !otp || !rejectionReason) {
            return new NextResponse("Token, OTP, and rejection reason are required", {
                status: 400,
            });
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
                { otp: "***", action: "reject" }
            );
            return new NextResponse("Invalid OTP", { status: 401 });
        }

        // Update discount request
        await db.discountRequest.update({
            where: { id: requestId },
            data: {
                status: "REJECTED",
                rejectionReason,
            },
        });

        // Audit log
        await createAuditLog(
            null,
            "DISCOUNT_REJECTED",
            "DiscountRequest",
            requestId,
            {
                leadId: discountRequest.leadId,
                requestedPercent: discountRequest.requestedPercent,
                rejectionReason,
            }
        );

        return NextResponse.json({
            success: true,
            message: "Discount request rejected",
        });
    } catch (error) {
        console.error("REJECT_DISCOUNT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
