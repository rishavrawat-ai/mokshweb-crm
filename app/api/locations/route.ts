
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const state = searchParams.get("state")

    try {
        if (type === "states") {
            const states = await db.inventoryHoarding.findMany({
                distinct: ['state'],
                select: { state: true },
                orderBy: { state: 'asc' }
            })
            return NextResponse.json(states.map((s: { state: string }) => s.state).filter(Boolean))
        }

        if (type === "districts") {
            if (!state) {
                return NextResponse.json({ error: "State required" }, { status: 400 })
            }
            const districts = await db.inventoryHoarding.findMany({
                where: { state },
                distinct: ['district'],
                select: { district: true },
                orderBy: { district: 'asc' }
            })
            return NextResponse.json(districts.map((d: { district: string }) => d.district).filter(Boolean))
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 })

    } catch (error) {
        console.error("LOCATIONS_API_ERROR", error)
        return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
    }
}
