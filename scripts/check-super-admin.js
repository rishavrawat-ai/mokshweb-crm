
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const superAdmin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' }
    })

    if (superAdmin) {
        console.log('FOUND_SUPER_ADMIN:', superAdmin.email)
    } else {
        console.log('NO_SUPER_ADMIN_FOUND')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
