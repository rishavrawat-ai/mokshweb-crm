
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
    console.log('Starting Sales User ID Backfill...')

    // Find leads where salesUserId is null
    const leadsToFix = await db.lead.findMany({
        where: {
            salesUserId: null
        },
        include: {
            assignee: true,
            logs: {
                orderBy: { createdAt: 'asc' }, // Oldest first
                include: { user: true }
            }
        }
    })

    console.log(`Found ${leadsToFix.length} leads with missing salesUserId.`)

    for (const lead of leadsToFix) {
        let newSalesUserId: number | null = null
        let reason = ''

        // Strategy 1: If current assignee is SALES, use them
        if (lead.assignee && (lead.assignee.role === 'SALES' || lead.assignee.role === 'ADMIN' || lead.assignee.role === 'SUPER_ADMIN')) {
            // Only if status implies it's still in sales or just handed off
            // Note: Admin/SuperAdmin can be sales reps too in this context
            newSalesUserId = lead.assignee.id
            reason = `Current assignee is ${lead.assignee.role}`
        }

        // Strategy 2: If Strategy 1 failed (e.g. current assignee is Finance), check logs for first assignment
        if (!newSalesUserId) {
            // Look for "ASSIGNMENT" logs
            const assignmentLog = lead.logs.find(l => l.action === 'ASSIGNMENT' || l.action === 'CREATE')

            // Use the user from the log if they are Sales/Admin
            // Note: leadLogs store `userId` (who performed action). 
            // For ASSIGNMENT, typically we want to know WHO was assigned. 
            // But our logs usually say "Assigned lead to X".
            // Let's rely on the log's actor for creation, or try to parse details?
            // Parsing details is risky. 

            // Alternate: Look for any log by a SALES user (activity)
            const salesLog = lead.logs.find(l => l.user.role === 'SALES')
            if (salesLog) {
                newSalesUserId = salesLog.userId
                reason = `Found activity by SALES user ${salesLog.user.name}`
            }
        }

        // Apply Update
        if (newSalesUserId) {
            console.log(`Updating Lead #${lead.id}: Setting salesUserId to ${newSalesUserId} (${reason})`)
            await db.lead.update({
                where: { id: lead.id },
                data: { salesUserId: newSalesUserId }
            })
        } else {
            console.log(`Skipping Lead #${lead.id}: Could not determine sales user.`)
        }
    }

    console.log('Backfill complete.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
