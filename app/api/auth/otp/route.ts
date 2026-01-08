import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { NextResponse } from "next/server"
import { randomInt } from "crypto"

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        if (!email) {
            return new NextResponse("Email is required", { status: 400 })
        }

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return new NextResponse("User already exists", { status: 409 })
        }

        // Generate 6 digit OTP
        const otp = randomInt(100000, 999999).toString()
        const expires = new Date(new Date().getTime() + 10 * 60 * 1000) // 10 minutes

        // Delete existing OTPs for this email
        await db.verificationToken.deleteMany({
            where: { identifier: email }
        })

        // Save new OTP
        await db.verificationToken.create({
            data: {
                identifier: email,
                token: otp,
                expires
            }
        })

        // Send Email
        await sendEmail({
            to: email,
            subject: "Your OTP for Sign Up",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2563eb;">Verify Your Email</h2>
                    <p>Use the following OTP to complete your sign up process:</p>
                    <h1 style="font-size: 32px; letter-spacing: 5px; background: #f3f4f6; padding: 10px 20px; display: inline-block; border-radius: 8px;">${otp}</h1>
                    <p>This code expires in 10 minutes.</p>
                </div>
             `
        })

        return NextResponse.json({ success: true, message: "OTP sent to email" })
    } catch (error) {
        console.error("OTP_SEND_ERROR", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
