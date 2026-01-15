
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createHash } from "crypto"
import { sendEmail } from "@/lib/email"
import { getDiscountInquiryAdminEmailTemplate } from "@/lib/email-templates"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { clientName, clientEmail, clientPhone, companyName, notes, expectedDiscount, items, baseTotal } = body

        // Validation
        if (!clientName || !clientEmail || !items || items.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // 1. Create DiscountInquiry
        const inquiry = await db.discountInquiry.create({
            data: {
                clientName,
                clientEmail,
                clientPhone,
                companyName,
                notes,
                baseTotal,
                cartSnapshot: JSON.stringify(items),
                status: "PENDING"
            }
        })

        // 2. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpHash = createHash("sha256").update(otp).digest("hex")
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 mins

        // 3. Store AdminOtp
        await db.adminOtp.create({
            data: {
                inquiryId: inquiry.id,
                otpHash,
                expiresAt
            }
        })

        // 4. Find Admin to notify
        // optimize: pick one or send to general admin email. Priority: SUPER_ADMIN, then ADMIN
        let adminUser = await db.user.findFirst({
            where: { role: "SUPER_ADMIN" }
        })

        if (!adminUser) {
            adminUser = await db.user.findFirst({
                where: { role: "ADMIN" }
            })
        }

        const adminEmail = adminUser?.email || process.env.ADMIN_EMAIL || "admin@mokshpromotion.com"

        // 5. Send Email
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
        const approveLink = `${baseUrl}/dashboard/admin/discount-inquiries/${inquiry.id}`

        const { subject, html } = getDiscountInquiryAdminEmailTemplate({
            clientName,
            clientEmail,
            clientPhone,
            companyName,
            baseTotal,
            requestedDiscount: expectedDiscount,
            notes,
            itemsCount: items.length,
            otp,
            otpExpiresAt: expiresAt,
            approveLink
        })

        await sendEmail({ to: adminEmail, subject, html })

        console.log(`[DEV] Admin OTP for Inquiry ${inquiry.id}: ${otp}`) // Log for dev convenience

        return NextResponse.json({ success: true, inquiryId: inquiry.id })

    } catch (error) {
        console.error("DISCOUNT_INQUIRY_ERROR", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
