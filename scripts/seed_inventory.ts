
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function seed() {
    console.log("Seeding Inventory...")

    const locations = [
        { state: "Maharashtra", city: "Mumbai", location: "Bandra West, Link Road", rate: 50000, printing: 5000 },
        { state: "Maharashtra", city: "Mumbai", location: "Andheri East, Metro Station", rate: 45000, printing: 4000 },
        { state: "Maharashtra", city: "Pune", location: "FC Road", rate: 30000, printing: 3000 },
        { state: "Delhi", city: "New Delhi", location: "Connaught Place, Inner Circle", rate: 80000, printing: 6000 },
        { state: "Delhi", city: "New Delhi", location: "Lajpat Nagar Market", rate: 60000, printing: 5000 },
        { state: "Karnataka", city: "Bangalore", location: "Indiranagar 100ft Road", rate: 55000, printing: 4500 },
    ]

    for (const loc of locations) {
        const net = loc.rate + loc.printing
        await db.inventoryHoarding.create({
            data: {
                state: loc.state,
                city: loc.city,
                district: loc.city,
                locationName: loc.location,
                outletName: loc.location,
                location: loc.location,
                rate: loc.rate,
                printingCharge: loc.printing,
                netTotal: net,
                width: 20,
                height: 10,
                totalArea: 200
            }
        })
    }

    console.log("Seeded 6 inventory items.")
}

seed()
    .catch(console.error)
    .finally(() => db.$disconnect())
