
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function cleanup() {
    console.log("Starting cleanup of 'Test Customer' leads...")

    const leads = await db.lead.findMany({
        where: { customerName: { startsWith: "Test Customer" } },
        include: { discountRequests: { include: { discountCode: true } } }
    })

    console.log(`Found ${leads.length} test leads to delete.`)

    for (const lead of leads) {
        console.log(`Deleting Lead: ${lead.customerName} (${lead.id})`)

        // 1. Delete DiscountCodes
        for (const req of lead.discountRequests) {
            if (req.discountCode) {
                await db.discountCode.delete({ where: { id: req.discountCode.id } })
            }
        }

        // 2. Delete DiscountRequests
        await db.discountRequest.deleteMany({ where: { leadId: lead.id } })

        // 3. Delete LeadLogs
        await db.leadLog.deleteMany({ where: { leadId: lead.id } })

        // 4. Delete Lead
        await db.lead.delete({ where: { id: lead.id } })
    }

    console.log("Cleanup completed successfully.")
}

cleanup()
    .catch((e) => {
        console.error("Cleanup failed:", e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
