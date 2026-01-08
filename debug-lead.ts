
import { db } from "@/lib/db"

async function debugLead() {
    try {
        console.log("Searching for lead 'Roy'...")
        const lead = await db.lead.findFirst({
            where: { customerName: { contains: "Roy" } },
            include: {
                logs: true
            }
        })

        if (!lead) {
            console.log("Lead 'Roy' not found.")
            return
        }

        console.log(`Lead Found: ID ${lead.id}`)
        console.log("Current Notes:", lead.notes)
        console.log("Status:", lead.status)
        console.log("Logs Count:", lead.logs.length)
        console.log("Logs:", JSON.stringify(lead.logs, null, 2))

    } catch (error) {
        console.error(error)
    }
}

debugLead()
