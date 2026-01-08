
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    })
    console.log('--- ALL USERS ---')
    users.forEach(u => {
        console.log(`[${u.role}] ${u.name} (${u.email})`)
    })
    console.log('-----------------')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
