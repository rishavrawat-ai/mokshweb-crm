
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyDiscountCodeAndApply } from "@/lib/discount"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
    req: Request,
    { params }: { params: { id: string; requestId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { code } = await req.json()
        const leadId = parseInt(params.id)

        // Check ownership
        const lead = await db.lead.findUnique({ where: { id: leadId } })
        if (!lead) return new NextResponse("Lead not found", { status: 404 })

        const isOwner = lead.salesUserId === parseInt(session.user.id) || lead.assigneeId === parseInt(session.user.id)
        const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"

        // Allow verify if owner or admin
        if (!isOwner && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const result = await verifyDiscountCodeAndApply({
            leadId,
            code,
            userId: parseInt(session.user.id),
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("[DISCOUNT_VERIFY]", error)
        // Return 400 for logic errors (invalid code, etc)
        return new NextResponse(error.message, { status: 400 })
    }
}
