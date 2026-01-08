import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifySecureToken, generateOTP } from "@/lib/discount-utils";
import { getOTPEmailTemplate } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/audit";

/**
 * POST /api/discount-review/[requestId]/generate-otp
 * Generate OTP for discount approval (Super Admin)
 */
export async function POST(
    req: Request,
    { params }: { params: { requestId: string } }
) {
    try {
        const { requestId } = params;
        const body = await req.json();
        const { token } = body;

        if (!token) {
            return new NextResponse("Token is required", { status: 400 });
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

        // Check if already approved or rejected
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
            return new NextResponse("Token expired or invalid", { status: 401 });
        }

        const isValidToken = verifySecureToken(
            requestId,
            superAdminEmail,
            token,
            discountRequest.tokenHash
        );

        if (!isValidToken) {
            await createAuditLog(
                null,
                "DISCOUNT_INVALID_TOKEN_ATTEMPT",
                "DiscountRequest",
                requestId,
                { token: token.substring(0, 10) + "..." }
            );
            return new NextResponse("Invalid token", { status: 401 });
        }

        // Check OTP rate limiting (max 5 OTPs per request)
        if (discountRequest.otpAttempts >= 5) {
            return new NextResponse("Maximum OTP generation attempts exceeded", {
                status: 429,
            });
        }

        // Generate OTP
        const { otp, hash: otpHash, expiresAt: otpExpiresAt } = await generateOTP();

        // Update discount request
        await db.discountRequest.update({
            where: { id: requestId },
            data: {
                status: "OTP_SENT",
                otpHash,
                otpExpiresAt,
                otpAttempts: discountRequest.otpAttempts + 1,
            },
        });

        // Send OTP email
        const emailTemplate = getOTPEmailTemplate(
            otp,
            discountRequest.lead.customerName
        );

        await sendEmail({
            to: superAdminEmail,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
        });

        // Audit log
        await createAuditLog(
            null,
            "DISCOUNT_OTP_GENERATED",
            "DiscountRequest",
            requestId,
            {
                attempt: discountRequest.otpAttempts + 1,
            }
        );

        return NextResponse.json({
            success: true,
            message: "OTP sent to super admin email",
            expiresAt: otpExpiresAt,
        });
    } catch (error) {
        console.error("GENERATE_OTP_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
