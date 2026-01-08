import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * GET /api/inventory/states
 * Returns list of unique states that have inventory
 */
export async function GET() {
    try {
        const states = await db.inventoryHoarding.findMany({
            select: {
                state: true
            },
            distinct: ['state']
        })

        const stateList = states
            .map(s => s.state)
            .filter(Boolean)
            .sort()

        return NextResponse.json(stateList)
    } catch (error) {
        console.error('Error fetching states:', error)
        return new NextResponse("Failed to fetch states", { status: 500 })
    }
}
