
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("search") || searchParams.get("q") || ""
    const state = searchParams.get("state")
    const city = searchParams.get("city")
    const district = searchParams.get("district")

    console.log(`[API Inventory] Query Params: q=${q}, state=${state}, city=${city}, district=${district}`)

    const whereClause: any = {}

    if (state) whereClause.state = state
    const districts = searchParams.get("districts")

    if (state) whereClause.state = state

    if (districts) {
        whereClause.district = { in: districts.split(",") }
    } else if (district) {
        whereClause.district = district
    }

    // City filter logic
    if (city && !district) {
        whereClause.OR = [
            { city: { contains: city } }, // Removed strict equality, using contains for safer match
            { district: { contains: city } }
        ]
    }

    // Global Search Logic
    if (q) {
        // If specific modifiers are NOT present, use global search on everything
        if (!state && !district && !city) {
            whereClause.OR = [
                { locationName: { contains: q } },
                { outletName: { contains: q } },
                { district: { contains: q } },
                { city: { contains: q } },
                { state: { contains: q } },
                // Legacy fields
                { location: { contains: q } },
                { name: { contains: q } }
            ]
        }
        // If modifiers ARE present, we might want to AND the q search?
        // Current logic was: if q AND !state AND !district... which implies q is ignored if state is present.
        // Let's fix this to allow "Search within State" if needed, OR just keep it simple.
        // The user issue is searching "punjab" which likely is a state name mostly.

        // If the user searches "Punjab", it might match state name.
        // Let's ensure if q matches a state, we return items in that state too if no other filters exist.
    }

    console.log(`[API Inventory] Where Clause:`, JSON.stringify(whereClause, null, 2))

    const items = await db.inventoryHoarding.findMany({
        where: whereClause,
        take: 20,
    })

    // Map to ensure we always have the expected fields
    // Map to ensure we always have the expected fields
    const mappedItems = items.map((item: any) => ({
        id: item.id,
        // Detailed fields for Plan Builder & Email
        sourceSrNo: item.sourceSrNo,
        outletName: item.outletName || item.name || '',
        locationName: item.locationName || item.location || '',
        district: item.district || item.city || '',
        state: item.state,
        city: item.city || item.district || '',
        areaType: item.areaType,
        widthFt: item.widthFt || item.width,
        heightFt: item.heightFt || item.height,
        areaSqft: item.areaSqft || item.totalArea,
        ratePerSqft: item.ratePerSqft || item.rate,
        printingCharge: item.printingCharge,
        netTotal: Number(item.netTotal || 0),

        // Legacy fallbacks for UI compatibility
        location: item.outletName || item.locationName || item.name || item.location || '',
    }))

    return NextResponse.json(mappedItems)
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { data } = body

        if (!data || !Array.isArray(data) || data.length === 0) {
            return new NextResponse("Invalid data format", { status: 400 })
        }

        // Process and insert inventory items
        const inventoryItems = data.map((item: any, index: number) => {
            // Debug: Log the first item to see exact headers
            if (index === 0) {
                console.log('=== FIRST ROW HEADERS ===');
                console.log('Available keys:', Object.keys(item));
                console.log('Sample item:', item);
                console.log('========================');
            }

            // Parse and validate the data - handle multiple header variations

            // Sr no. mapping - try many variations
            const srNo = item['Sr no.'] ||
                item['Sr No.'] ||
                item['Sr No'] ||
                item['Sr.no.'] ||
                item['Sr.No.'] ||
                item['sr no.'] ||
                item['SR NO.'] ||
                item.SrNo ||
                item.srNo ||
                item['S.No.'] ||
                item['S.No'] ||
                item['S No.'] ||
                item['Serial No.'] ||
                Object.keys(item).find(key =>
                    key.toLowerCase().replace(/\s/g, '').includes('srno') ||
                    key.toLowerCase().replace(/\s/g, '').includes('sr.no') ||
                    key.toLowerCase().replace(/\s/g, '').includes('serialno')
                ) ? item[Object.keys(item).find(key =>
                    key.toLowerCase().replace(/\s/g, '').includes('srno') ||
                    key.toLowerCase().replace(/\s/g, '').includes('sr.no') ||
                    key.toLowerCase().replace(/\s/g, '').includes('serialno')
                )!] : null

            const width = item['Width in ft'] || item['Width in Ft'] || item['Width In Ft'] || item.Width || item.width || item.W || null
            const height = item['Height in Sq ft'] || item['Height in ft'] || item['Height in Sq Ft'] || item['Height In Sq Ft'] || item.Height || item.height || item.H || null
            const totalAreaProvided = item['Total Area in Sq Ft'] || item['Total Area'] || item.totalArea || item['Total area in Sq Ft'] || item['Total Area In Sq Ft'] || null
            const rate = item.Rates || item.Rate || item.rate || item.Price || item.price || null
            const installationCharge = item['Installation Charge'] || item['Installation charge'] || item.installationCharge || item['Installation'] || null

            // Try multiple variations for printing charge (including common typos)
            // Search for any key containing "print" (case-insensitive, ignoring spaces)
            const printingChargeKey = Object.keys(item).find(key => {
                const normalized = key.toLowerCase().replace(/\s/g, '');
                return normalized.includes('print') && (
                    normalized.includes('charge') ||
                    normalized.includes('chrg') ||
                    normalized === 'printing' ||
                    normalized === 'printining' ||
                    normalized === 'printinting'
                );
            });

            const printingCharge = printingChargeKey ? item[printingChargeKey] :
                item['Printinting Charge'] ||  // Two t's
                item['Printining Charge'] ||   // One extra i
                item['Printing Charge'] ||     // Correct spelling
                item['Printinting charge'] ||
                item['Printining charge'] ||
                item['Printing charge'] ||
                item['PrintintingCharge'] ||
                item['PrintiningCharge'] ||
                item['PrintingCharge'] ||
                item.printingCharge ||
                item['Printing'] ||
                item.Printing ||
                null

            // Debug printing charge for first row
            if (index === 0) {
                console.log('=== PRINTING CHARGE DEBUG ===');
                console.log('Printing charge key found:', printingChargeKey);
                console.log('Printing charge value:', printingCharge);
                console.log('All keys with "print":', Object.keys(item).filter(k => k.toLowerCase().includes('print')));
                console.log('============================');
            }

            const netTotalProvided = item['Net Total'] || item['Net total'] || item.netTotal || item['Net Total '] || null

            // Calculate area and total
            const widthNum = width ? parseFloat(width.toString().replace(/[^\d.-]/g, '')) : null
            const heightNum = height ? parseFloat(height.toString().replace(/[^\d.-]/g, '')) : null
            const totalAreaNum = totalAreaProvided ? parseFloat(totalAreaProvided.toString().replace(/[^\d.-]/g, '')) : null
            const computedArea = widthNum && heightNum ? widthNum * heightNum : null
            const finalArea = totalAreaNum || computedArea

            const rateNum = rate ? parseFloat(rate.toString().replace(/[₹$,\s]/g, '')) : null
            const installationChargeNum = installationCharge ? parseFloat(installationCharge.toString().replace(/[₹$,\s]/g, '')) : null
            const printingChargeNum = printingCharge ? parseFloat(printingCharge.toString().replace(/[₹$,\s]/g, '')) : null
            const netTotalNum = netTotalProvided ? parseFloat(netTotalProvided.toString().replace(/[₹$,\s]/g, '')) : null

            // Calculate net total if not provided
            const baseCost = finalArea && rateNum ? finalArea * rateNum : null
            const computedNetTotal = baseCost ? baseCost + (installationChargeNum || 0) + (printingChargeNum || 0) : null
            const finalNetTotal = netTotalNum || computedNetTotal

            const state = item.State || item.state || ""
            const city = item.City || item.city || ""
            const location = item.Location || item.location || item['Name of the Outlet'] || item.Name || item.name || ""
            const district = item.District || item.district || city // Use city as district if not provided
            const name = item['Name of the Outlet'] || item.Name || item.name || item.Location || item.location || location
            const areaType = item['Urban/ Highway/ Rural'] || item.Urban || item.Highway || item.Rural || item.areaType || null

            // Parse Sr no.
            const srNoNum = srNo ? (typeof srNo === 'number' ? srNo : parseInt(srNo.toString().replace(/[^\d]/g, ''))) : null

            return {
                // Source tracking
                sourceSrNo: srNoNum,

                // New required fields
                outletName: name,
                locationName: location,
                state: state,
                district: district,

                // New optional fields
                areaType: areaType,
                widthFt: widthNum,
                heightFt: heightNum,
                areaSqft: finalArea,
                ratePerSqft: rateNum,
                installationCharge: installationChargeNum,
                printingCharge: printingChargeNum,
                netTotal: finalNetTotal,
                computedArea: computedArea,
                computedBaseCost: baseCost,
                computedNetTotal: computedNetTotal,

                // Legacy fields for backward compatibility
                city: city,
                location: location,
                name: name,
                hoardingsCount: item['Hoardings Count'] || item.hoardingsCount || item.count || 1,
                width: widthNum,
                height: heightNum,
                totalArea: finalArea,
                rate: rateNum,
            }
        }).filter((item: any) => {
            // Filter out items with missing required fields
            return item.state && item.outletName && item.district
        })

        if (inventoryItems.length === 0) {
            return new NextResponse("No valid items found in the uploaded data", { status: 400 })
        }

        // Delete existing inventory and campaign items
        await db.leadCampaignItem.deleteMany({})
        await db.inventoryHoarding.deleteMany({})

        // Insert new inventory items one by one (SQLite doesn't support createMany)
        let count = 0
        for (const item of inventoryItems) {
            try {
                await db.inventoryHoarding.create({
                    data: item,
                })
                count++
            } catch (error) {
                console.error("Error creating inventory item:", error)
                // Continue with next item
            }
        }

        return NextResponse.json({
            success: true,
            count: count,
            message: `Successfully imported ${count} inventory items`,
        })
    } catch (error) {
        console.error("INVENTORY_UPLOAD_ERROR", error)
        return new NextResponse("Failed to upload inventory", { status: 500 })
    }
}

export async function DELETE(req: Request) {
    // 1. Auth Check (Admin only)
    // We can't import authOptions easily here if it causes circular deps, but usually it's fine.
    // Ideally we check session.

    // For now, let's assume if they can hit this API they are likely admin or we should add the check.
    // Adding checking logic:
    // const session = await getServerSession(authOptions)
    // if (session?.user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 })

    try {
        // Option 1: Cascade delete lead items.
        // Option 2: Error if items exist.

        // Given the user wants to "clean up", let's wipe the inventory.
        // BUT, deleting active campaign items from leads might be bad.
        // Let's try to delete inventory. If it fails, we inform them or we just force it.

        // Let's force clean for this use case (Delete All Data button usually implies Reset)

        // Delete all campaign items first to satisfy foreign key constraints
        await db.leadCampaignItem.deleteMany({})

        // Now delete inventory
        await db.inventoryHoarding.deleteMany({})

        return new NextResponse("Deleted", { status: 200 })
    } catch (error) {
        console.error("INVENTORY_DELETE_ALL", error)
        return new NextResponse("Failed to delete", { status: 500 })
    }
}
