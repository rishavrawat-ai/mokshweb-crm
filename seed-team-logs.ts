
import { db } from "@/lib/db"

async function seedTeamLogs() {
    try {
        console.log("Searching for lead 'Roy'...")
        const lead = await db.lead.findFirst({
            where: { customerName: { contains: "Roy" } }
        })

        if (!lead) {
            console.log("Lead 'Roy' not found.")
            return
        }

        // Find a Finance User
        const financeUser = await db.user.findFirst({
            where: { role: "FINANCE" }
        })

        // Find an Ops User
        const opsUser = await db.user.findFirst({
            where: { role: "OPERATIONS" } // Adjust role name if needed (e.g. OPERATIONS_MANAGER)
        })

        if (!financeUser) {
            console.log("No Finance user found in database.")
        } else {
            console.log(`Adding Finance log from ${financeUser.name}...`)
            await db.leadLog.create({
                data: {
                    leadId: lead.id,
                    userId: financeUser.id,
                    action: "HANDOFF_FINANCE",
                    details: "Payment verified. Received 50% advance via NEFT. Approved for processing."
                }
            })
        }

        if (!opsUser) {
            console.log("No Ops user found in database.")
        } else {
            console.log(`Adding Ops log from ${opsUser.name}...`)
            await db.leadLog.create({
                data: {
                    leadId: lead.id,
                    userId: opsUser.id,
                    action: "PRINTING",
                    details: "Files received. Printing started. Expected installation date: 7th Jan."
                }
            })
        }

        console.log("Logs seeded successfully.")

    } catch (error) {
        console.error(error)
    }
}

seedTeamLogs()
