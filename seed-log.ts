
import { db } from "@/lib/db"

async function seedLog() {
    try {
        console.log("Searching for lead 'Roy'...")
        const lead = await db.lead.findFirst({
            where: { customerName: { contains: "Roy" } }
        })

        if (!lead) {
            console.log("Lead 'Roy' not found.")
            return
        }

        console.log(`Matching lead found: ${lead.customerName} (ID: ${lead.id})`)

        if (lead.notes) {
            console.log("Seeding initial log entry from existing notes...")
            await db.leadLog.create({
                data: {
                    leadId: lead.id,
                    userId: 1, // Assigning to Admin/System mainly for visibility
                    action: "NOTE",
                    details: `Initial Notes: "${lead.notes}"`
                }
            })
            console.log("Log seeded successfully.")
        } else {
            console.log("No notes to seed.")
        }

    } catch (error) {
        console.error(error)
    }
}

seedLog()
