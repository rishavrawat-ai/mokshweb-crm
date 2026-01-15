
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const count = await prisma.inventoryHoarding.count()
    console.log(`Total Inventory Items: ${count}`)

    if (count > 0) {
        const items = await prisma.inventoryHoarding.findMany({
            take: 5,
        })
        console.log('Sample Items:', JSON.stringify(items, null, 2))

        // Check for "Punjab" specifically
        const punjabItems = await prisma.inventoryHoarding.findMany({
            where: {
                OR: [
                    { state: { contains: 'Punjab' } },
                    { locationName: { contains: 'Punjab' } },
                    { outletName: { contains: 'Punjab' } }
                ]
            },
            take: 2
        })
        console.log(`Items matching 'Punjab': ${punjabItems.length}`)
        if (punjabItems.length > 0) console.log(JSON.stringify(punjabItems, null, 2))
    }
}

main()
    .catch((e) => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
