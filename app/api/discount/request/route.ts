import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { randomInt } from "crypto"
import { sendEmail } from "@/lib/email"
import { createAuditLog } from "@/lib/audit"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        return new NextResponse("This API is deprecated. Please use the Lead-based discount workflow.", { status: 410 })

        /*
        const body = await req.json()
        const { projectId, discountPct, couponCode, reason } = body

        if (!projectId || !reason) {
            return new NextResponse("Project ID and Reason are required", { status: 400 })
        }

        if (session.user.role === 'SALES') {
            // Check if project belongs to sales user or valid
            // Optional: Implement strict check
        }

        // Generate OTP
        const otp = randomInt(100000, 999999).toString()
        const otpHash = await hash(otp, 10)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 mins

        // Create Request
        const discountRequest = await db.discountRequest.create({
            data: {
                // projectId, // REMOVED FROM SCHEMA
                // salesUserId: Number(session.user.id),
                // requestedDiscountPct: discountPct ? Number(discountPct) : null,
                // requestedCouponCode: couponCode || null,
                reason,
                status: "PENDING",
                otpHash,
                otpExpiresAt: expiresAt,
                // lastOtpSentAt: new Date()
                requestedByUserId: Number(session.user.id),
                leadId: 0, // Placeholder
                requestedPercent: discountPct ? Number(discountPct) : 0
            },
            include: {
                // project: true,
                // salesUser: true
            }
        })

        // Send Email to Admin
        const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com"
        const emailHtml = `
            <h2>Discount Approval Needed</h2>
            <p><strong>Sales User:</strong> ${session.user.name} (${session.user.email})</p>
            <p><strong>Project:</strong> ${"Unknown"}</p>
            <p><strong>Requested Discount:</strong> ${discountPct || 0}%</p>
            <p><strong>Coupon:</strong> ${couponCode || "None"}</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <hr />
            <h3>OTP Code: ${otp}</h3>
            <p>This code expires in 5 minutes.</p>
        `

        await sendEmail({
            to: adminEmail,
            subject: `Discount OTP Request #${discountRequest.id.slice(-6)}`,
            html: emailHtml
        })

        await createAuditLog(
            Number(session.user.id),
            "DISCOUNT_REQUEST_CREATED",
            "DiscountRequest",
            discountRequest.id,
            { projectId, discountPct, couponCode }
        )

        return NextResponse.json({
            success: true,
            requestId: discountRequest.id,
            expiresAt: expiresAt
        })
        */

    } catch (error) {
        console.error("DISCOUNT_REQUEST_ERROR", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
