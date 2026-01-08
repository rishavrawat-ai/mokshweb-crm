import { db } from "@/lib/db"
import StateCityGrid from "@/components/StateCityGrid"
import CartFooter from "@/components/CartFooter"

export const dynamic = "force-dynamic"

export default async function PetrolPumpMediaPage() {
    // Fetch all unique pairings of state and district (or city for legacy data)
    const locations = await db.inventoryHoarding.findMany({
        select: {
            state: true,
            district: true,
            city: true
        },
        distinct: ['state', 'district']
    })

    // Group by state
    const groupedData: Record<string, string[]> = {}

    locations.forEach(loc => {
        let state = loc.state?.trim()
        // Use district first (new data), fallback to city (legacy data)
        let district = loc.district?.trim() || loc.city?.trim()

        if (!state || state.length < 2) return // Skip empty or invalid states

        // Normalize state to Uppercase for consistency (matches the UI style)
        state = state.toUpperCase()

        // Normalize district to Title Case for better readability
        if (district) {
            district = district.charAt(0).toUpperCase() + district.slice(1).toLowerCase()
        } else {
            district = "Unknown District"
        }

        if (!groupedData[state]) {
            groupedData[state] = []
        }

        // Add district if not already present
        if (!groupedData[state].includes(district)) {
            groupedData[state].push(district)
        }
    })

    // Sort districts alphabetically for each state
    Object.keys(groupedData).forEach(state => {
        groupedData[state].sort()
    })

    return (
        <main className="min-h-screen bg-[#032D52] py-20 pb-24">
            <StateCityGrid data={groupedData} />
            <CartFooter />
        </main>
    )
}
