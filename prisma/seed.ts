import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const adminPassword = await bcrypt.hash('admin123', 10)
    const salesPassword = await bcrypt.hash('sales123', 10)
    const financePassword = await bcrypt.hash('finance123', 10)
    const opsPassword = await bcrypt.hash('ops123', 10)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: { password: adminPassword },
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: adminPassword,
            role: 'ADMIN',
        },
    })

    const sales = await prisma.user.upsert({
        where: { email: 'sales@example.com' },
        update: {
            password: salesPassword,
            name: 'Sales Team User'
        },
        create: {
            email: 'sales@example.com',
            name: 'Sales Team User',
            password: salesPassword,
            role: 'SALES',
        },
    })

    const sales2 = await prisma.user.upsert({
        where: { email: 'sales2@example.com' },
        update: { password: salesPassword },
        create: {
            email: 'sales2@example.com',
            name: 'Sales Team User 2',
            password: salesPassword,
            role: 'SALES',
        },
    })

    const finance = await prisma.user.upsert({
        where: { email: 'finance@example.com' },
        update: {
            password: financePassword,
            name: 'Finance Team User'
        },
        create: {
            email: 'finance@example.com',
            name: 'Finance Team User',
            password: financePassword,
            role: 'FINANCE',
        },
    })

    const operations = await prisma.user.upsert({
        where: { email: 'ops@example.com' },
        update: {
            password: opsPassword,
            name: 'Operations Team User'
        },
        create: {
            email: 'ops@example.com',
            name: 'Operations Team User',
            password: opsPassword,
            role: 'OPERATIONS',
        },
    })

    console.log({ admin, sales, finance, operations })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
