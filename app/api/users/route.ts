import { db } from "@/lib/db"
import { userCreateSchema } from "@/lib/schemas"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        // Manual validation since schema might need import adjustment
        if (!body.email || !body.password || !body.name) {
            return new NextResponse("Missing fields", { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(body.password, 10)

        const existingUser = await db.user.findUnique({
            where: { email: body.email }
        })

        if (existingUser) {
            return new NextResponse("User already exists", { status: 409 })
        }

        const user = await db.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: hashedPassword,
                role: body.role || "SALES"
            }
        })

        // Remove password from response
        const { password, ...userWithoutPassword } = user

        return NextResponse.json(userWithoutPassword)
    } catch (error) {
        console.error("USERS_POST", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const users = await db.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error("USERS_GET", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
