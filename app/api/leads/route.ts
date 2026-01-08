import { db } from "@/lib/db"
import { leadSchema } from "@/lib/schemas"
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
        const validatedData = leadSchema.parse(body)

        const lead = await db.lead.create({
            data: {
                ...validatedData,
                assigneeId: validatedData.assigneeId || (session.user.role === 'SALES' ? Number(session.user.id) : undefined),
                salesUserId: session.user.role === 'SALES' ? Number(session.user.id) : undefined,
                payment: {
                    create: {
                        status: "NOT_RAISED",
                        totalAmount: 0,
                        paidAmount: 0,
                        pendingAmount: 0
                    }
                }
            }
        })

        return NextResponse.json(lead)
    } catch (error) {
        console.error("LEADS_POST", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Role-based filtering
        const whereClause = session.user.role === 'SALES'
            ? { assigneeId: Number(session.user.id) }
            : {}

        const leads = await db.lead.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: { assignee: { select: { name: true } } }
        })

        return NextResponse.json(leads)
    } catch (error) {
        console.error("LEADS_GET", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
