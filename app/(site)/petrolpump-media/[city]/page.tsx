import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import CityHoardingTable from "@/components/CityHoardingTable"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CityMediaPage({ params }: { params: { city: string } }) {
    const cityName = decodeURIComponent(params.city)

    // ... (data fetching)
    const cityHoardings = await db.inventoryHoarding.findMany({
        where: {
            OR: [
                { district: cityName },
                { district: cityName.toUpperCase() },
                { district: cityName.toLowerCase() },
                { city: cityName },
                { city: cityName.toUpperCase() },
                { city: cityName.toLowerCase() }
            ]
        },
        orderBy: { location: 'asc' }
    })

    if (cityHoardings.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <Link href="/petrolpump-media" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to All Locations
                    </Link>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">No media found for {cityName}</h1>
                        <p className="mt-2 text-gray-600">Please try another location.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1400px] mx-auto">
                <div className="mb-6">
                    <Link href="/petrolpump-media" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to All Locations
                    </Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{cityName}</h1>
                    <p className="text-gray-500 mt-1">Found {cityHoardings.length} advertising locations</p>
                </div>

                <CityHoardingTable hoardings={cityHoardings.map(h => ({
                    ...h,
                    location: h.location ?? (h as any).locationName ?? "",
                    city: h.city ?? ""
                }))} />
            </div>
        </main>
    )
}
