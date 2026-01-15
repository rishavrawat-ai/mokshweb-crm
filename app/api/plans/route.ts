
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !["SALES", "ADMIN", "SUPER_ADMIN", "FINANCE", "OPERATIONS"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        console.log("Creating Plan with Body:", JSON.stringify(body, null, 2))

        const { clientName, clientEmail, clientPhone, items, baseTotal, discountType, discountValue, finalTotal, notes } = body

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Items required" }, { status: 400 })
        }

        // Calculation check
        const discountAmount = Number(baseTotal) - Number(finalTotal)

        console.log("Plan Calculation:", { baseTotal, finalTotal, discountAmount })

        const plan = await db.plan.create({
            data: {
                userId: Number(session.user.id),
                clientName,
                clientEmail,
                clientPhone: clientPhone || null,
                itemsSnapshot: JSON.stringify(items),
                baseTotal: Number(baseTotal),
                discountType,
                discountValue: Number(discountValue),
                discountAmount: Number(discountAmount),
                finalTotal: Number(finalTotal),
                notes,
                status: "DRAFT"
            }
        })

        return NextResponse.json({ success: true, planId: plan.id })

    } catch (error: any) {
        console.error("CREATE_PLAN_ERROR_DETAILS:", error)
        // Check for specific Prisma errors
        if (error.code === 'P2003') {
            return NextResponse.json({ error: "Foreign key constraint failed. Invalid User ID or Item ID." }, { status: 500 })
        }
        return NextResponse.json({
            error: error.message || "Failed to create plan"
        }, { status: 500 })
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(req.url)
        const mine = searchParams.get("mine") === "true"

        // Filter Logic
        let where: any = {}
        if (mine || session.user.role === "SALES") {
            where.userId = Number(session.user.id)
        }

        const plans = await db.plan.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: { createdBy: { select: { name: true } } }
        })

        return NextResponse.json(plans)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 })
    }
}
