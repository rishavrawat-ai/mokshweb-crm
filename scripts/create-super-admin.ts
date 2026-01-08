
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'gohypedevelopers@gmail.com'
    const password = 'SuperAdmin123!'
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'SUPER_ADMIN',
            password: hashedPassword, // Reset password to ensure user knows it
        },
        create: {
            email,
            name: 'Super Admin',
            password: hashedPassword,
            phone: '0000000000',
            role: 'SUPER_ADMIN',
        },
    })

    console.log(`SUPER_ADMIN_CREATED: ${user.email}`)
    console.log(`PASSWORD: ${password}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
