import { db } from "@/lib/db"
import { customerSchema } from "@/lib/schemas"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const validatedData = customerSchema.parse(body)

        const customer = await db.customer.create({
            data: validatedData
        })

        return NextResponse.json(customer)
    } catch (error) {
        console.error("CUSTOMERS_POST", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const customers = await db.customer.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { projects: true }
                }
            }
        })

        return NextResponse.json(customers)
    } catch (error) {
        console.error("CUSTOMERS_GET", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
