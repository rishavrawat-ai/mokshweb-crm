
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function checkData() {
    try {
        const item = await db.inventoryHoarding.findFirst({
            where: {
                OR: [
                    { district: { contains: 'agra' } },
                    { district: { contains: 'Agra' } },
                    { district: { contains: 'AGRA' } }
                ]
            }
        });
        console.log("Found matching 'Agra' item district:", item ? item.district : "None");

        const all = await db.inventoryHoarding.findMany({ take: 5, select: { district: true } });
        console.log("First 5 districts in DB:", all.map(x => x.district));
    } catch (error) {
        console.error(error)
    }
}

checkData()
