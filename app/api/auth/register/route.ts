import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { hash } from "bcryptjs"

export async function POST(req: Request) {
    try {
        const { name, email, password, otp } = await req.json()

        if (!name || !email || !password || !otp) {
            return new NextResponse("Missing fields", { status: 400 })
        }

        // Verify OTP
        const existingToken = await db.verificationToken.findFirst({
            where: {
                identifier: email,
                token: otp
            }
        })

        if (!existingToken) {
            return new NextResponse("Invalid OTP", { status: 400 })
        }

        if (new Date() > existingToken.expires) {
            return new NextResponse("OTP expired", { status: 400 })
        }

        // Check user existence again
        const existingUser = await db.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return new NextResponse("User already exists", { status: 409 })
        }

        // Hash password
        const hashedPassword = await hash(password, 12)

        // Create User
        await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "CLIENT" // Default role for public signup
            }
        })

        // Delete used OTP
        await db.verificationToken.deleteMany({
            where: { identifier: email }
        })

        return NextResponse.json({ success: true, message: "Account created successfully" })

    } catch (error) {
        console.error("REGISTER_ERROR", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
