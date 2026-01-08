import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { createAuditLog } from "@/lib/audit"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { requestId, otp } = body

        if (!requestId || !otp) {
            return new NextResponse("Missing fields", { status: 400 })
        }

        const request = await db.discountRequest.findUnique({
            where: { id: requestId }
        })

        if (!request) {
            return new NextResponse("Request not found", { status: 404 })
        }

        // Validate Status
        if (request.status !== "PENDING") {
            return new NextResponse(`Request is ${request.status}`, { status: 400 })
        }

        // Validate Attempts
        if (request.attemptCount >= 3) {
            await db.discountRequest.update({
                where: { id: requestId },
                data: { status: "LOCKED" }
            })
            return new NextResponse("Too many failed attempts. Request Locked.", { status: 403 })
        }

        // Validate Expiry
        if (new Date() > request.otpExpiresAt) {
            await db.discountRequest.update({
                where: { id: requestId },
                data: { status: "EXPIRED" }
            })
            return new NextResponse("OTP Expired", { status: 400 })
        }

        // Validate User (Sales verifies own, Admin can verify any)
        if (session.user.role === 'SALES' && request.salesUserId !== Number(session.user.id)) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        // Check OTP
        const isValid = await compare(otp, request.otpHash)

        if (!isValid) {
            await db.discountRequest.update({
                where: { id: requestId },
                data: { attemptCount: { increment: 1 } }
            })
            await createAuditLog(Number(session.user.id), "DISCOUNT_OTP_FAILED", "DiscountRequest", requestId)
            return new NextResponse("Invalid OTP", { status: 400 })
        }

        // Success Flow
        // 1. Update Request
        await db.discountRequest.update({
            where: { id: requestId },
            data: {
                status: "APPROVED",
                approvedAt: new Date(),
                // If verified by OTP, we can consider it approved by the system or attribute to admin
                // But prompt says "approvedByAdminId" - we can leave null or use a System Admin ID if we have one.
                // Or if Admin entered OTP, use Admin ID.
                approvedByAdminId: session.user.role === 'ADMIN' ? Number(session.user.id) : null
            }
        })

        // 2. Update Project
        await db.project.update({
            where: { id: request.projectId },
            data: {
                discountPct: request.requestedDiscountPct ? request.requestedDiscountPct : undefined,
                discountPercent: request.requestedDiscountPct ? request.requestedDiscountPct : undefined, // Syncing both for compatibility
                couponCode: request.requestedCouponCode,
                discountApprovedRequestId: request.id,
                discountApprovedAt: new Date()
            }
        })

        await createAuditLog(
            Number(session.user.id),
            "DISCOUNT_APPROVED_BY_OTP",
            "Project",
            String(request.projectId),
            { requestId: request.id }
        )

        return NextResponse.json({ success: true, projectId: request.projectId })

    } catch (error) {
        console.error("DISCOUNT_VERIFY_ERROR", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
