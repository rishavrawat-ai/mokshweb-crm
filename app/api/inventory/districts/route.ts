import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * GET /api/inventory/districts?state=UP
 * Returns list of districts in a state with count of locations
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const state = searchParams.get("state")

        if (!state) {
            return new NextResponse("State parameter is required", { status: 400 })
        }

        // Get all districts in the state with count
        const districts = await db.inventoryHoarding.groupBy({
            by: ['district'],
            where: {
                state: state,
            },
            _count: {
                id: true
            }
        })

        const districtList = districts
            .map(d => ({
                district: d.district!,
                count: d._count.id
            }))
            .sort((a, b) => a.district.localeCompare(b.district))

        return NextResponse.json(districtList)
    } catch (error) {
        console.error('Error fetching districts:', error)
        return new NextResponse("Failed to fetch districts", { status: 500 })
    }
}
