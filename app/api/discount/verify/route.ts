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

        return new NextResponse("This API is deprecated.", { status: 410 })

        /*
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
        if (request.otpAttempts >= 3) {
            await db.discountRequest.update({
                where: { id: requestId },
                data: { status: "LOCKED" }
            })
            return new NextResponse("Too many failed attempts. Request Locked.", { status: 403 })
        }

        // Validate Expiry
        if (request.otpExpiresAt && new Date() > request.otpExpiresAt) {
            await db.discountRequest.update({
                where: { id: requestId },
                data: { status: "EXPIRED" }
            })
            return new NextResponse("OTP Expired", { status: 400 })
        }

        // Validate User (Sales verifies own, Admin can verify any)
        // if (session.user.role === 'SALES' && request.salesUserId !== Number(session.user.id)) {
        //    return new NextResponse("Forbidden", { status: 403 })
        // }

        // Check OTP
        // const isValid = await compare(otp, request.otpHash!)

        // if (!isValid) {
        //    await db.discountRequest.update({
        //        where: { id: requestId },
        //        data: { otpAttempts: { increment: 1 } }
        //    })
        //    await createAuditLog(Number(session.user.id), "DISCOUNT_OTP_FAILED", "DiscountRequest", requestId)
        //    return new NextResponse("Invalid OTP", { status: 400 })
        // }

        // Success Flow
        // 1. Update Request
        await db.discountRequest.update({
            where: { id: requestId },
            data: {
                status: "APPROVED",
                approvedAt: new Date(),
                approvedByAdminId: session.user.role === 'ADMIN' ? Number(session.user.id) : null
            }
        })

        // 2. Update Project (Linking removed)
        
        await createAuditLog(
            Number(session.user.id),
            "DISCOUNT_APPROVED_BY_OTP",
            "DiscountRequest",
            String(requestId),
            { requestId: request.id }
        )

        return NextResponse.json({ success: true, projectId: 0 })
        */

    } catch (error) {
        console.error("DISCOUNT_VERIFY_ERROR", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
