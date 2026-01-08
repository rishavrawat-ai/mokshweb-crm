import { db } from "@/lib/db"
import { projectSchema } from "@/lib/schemas"
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
        const validatedData = projectSchema.parse(body)

        const project = await db.project.create({
            data: {
                ...validatedData,
                salesUserId: Number(session.user.id)
            }
        })

        return NextResponse.json(project)
    } catch (error) {
        console.error("PROJECTS_POST", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const projects = await db.project.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                customer: true,
                salesUser: { select: { name: true } }
            }
        })

        return NextResponse.json(projects)
    } catch (error) {
        console.error("PROJECTS_GET", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
