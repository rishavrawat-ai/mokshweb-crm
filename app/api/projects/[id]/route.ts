import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const projectId = parseInt(params.id)
        const body = await req.json()
        const { status } = body

        // Verify project exists
        const existingProject = await db.project.findUnique({
            where: { id: projectId }
        })

        if (!existingProject) {
            return new NextResponse("Project not found", { status: 404 })
        }

        // TODO: Add role-based checks for status transitions if needed
        // e.g. Only FINANCE can move to IN_OPERATIONS

        const updatedProject = await db.project.update({
            where: { id: projectId },
            data: { status }
        })

        return NextResponse.json(updatedProject)
    } catch (error) {
        console.error("PROJECT_PATCH", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
