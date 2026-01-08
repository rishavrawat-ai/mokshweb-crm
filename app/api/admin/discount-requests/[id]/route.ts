
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        // Auth: SUPER_ADMIN (or ADMIN)
        const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const request = await db.discountRequest.findUnique({
            where: { id: params.id },
            include: {
                lead: true,
                requestedByUser: {
                    select: { name: true, email: true }
                }
            }
        })

        if (!request) {
            return new NextResponse("Request not found", { status: 404 })
        }

        return NextResponse.json(request)
    } catch (error: any) {
        console.error("[DISCOUNT_REQUEST_GET]", error)
        return new NextResponse(error.message, { status: 500 })
    }
}
