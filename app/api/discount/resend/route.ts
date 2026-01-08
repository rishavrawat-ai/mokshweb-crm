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

        return new NextResponse("This API is deprecated.", { status: 410 })

        /*
        const body = await req.json()
        const { requestId } = body

        if (!requestId) return new NextResponse("Missing requestId", { status: 400 })

        const request = await db.discountRequest.findUnique({
            where: { id: requestId },
            include: { 
                // project: true, 
                // salesUser: true 
            }
        })

        if (!request) return new NextResponse("Not Found", { status: 404 })

        if (request.status !== "PENDING") {
            return new NextResponse("Request is not Pending", { status: 400 })
        }

        // if (session.user.role === 'SALES' && request.salesUserId !== Number(session.user.id)) {
        //    return new NextResponse("Forbidden", { status: 403 })
        // }

        // Rate Limit
        if (request.lastOtpSentAt) {
            const diff = Date.now() - new Date(request.lastOtpSentAt).getTime()
            if (diff < 60000) {
                const wait = Math.ceil((60000 - diff) / 1000)
                return new NextResponse(`Please wait ${wait} seconds`, { status: 429 })
            }
        }

        // Generate New OTP
        const otp = randomInt(100000, 999999).toString()
        const otpHash = await hash(otp, 10)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

        // Update DB
        await db.discountRequest.update({
            where: { id: requestId },
            data: {
                otpHash,
                otpExpiresAt: expiresAt,
                // lastOtpSentAt: new Date(),
                // attemptCount: 0 
            }
        })

        // Send Email
        const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com"
        const emailHtml = `
             <h2>Discount Approval - NEW OTP</h2>
             <p><strong>Request ID:</strong> #${request.id.slice(-6)}</p>
             <p>A new OTP was requested by ${session.user.name}.</p>
             <hr />
             <h3>OTP Code: ${otp}</h3>
             <p>Expires in 5 minutes.</p>
         `

        await sendEmail({
            to: adminEmail,
            subject: `[Resend] Discount OTP Request #${request.id.slice(-6)}`,
            html: emailHtml
        })

        await createAuditLog(Number(session.user.id), "DISCOUNT_OTP_RESENT", "DiscountRequest", requestId)

        return NextResponse.json({ success: true, expiresAt })
        */

    } catch (error) {
        console.error("DISCOUNT_RESEND_ERROR", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
