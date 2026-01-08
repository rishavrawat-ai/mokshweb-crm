
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateDiscountCode } from "@/lib/discount"
import { NextResponse } from "next/server"

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { approvedPercent } = body

        const result = await generateDiscountCode({
            requestId: params.id,
            adminId: parseInt(session!.user.id),
            approvedPercent,
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("[DISCOUNT_CODE_GENERATE]", error)
        return new NextResponse(error.message, { status: 500 })
    }
}
