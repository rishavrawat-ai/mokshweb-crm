import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user || session.user.role !== 'ADMIN') {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')

        const where: any = {}
        if (status) where.status = status

        const requests = await db.discountRequest.findMany({
            where,
            include: {
                project: {
                    select: { title: true, id: true }
                },
                salesUser: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(requests)

    } catch (error) {
        console.error("ADMIN_GET_REQUESTS_ERROR", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
