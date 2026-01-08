
import { db } from "../lib/db"
import { createDiscountRequest, generateDiscountCode, verifyDiscountCodeAndApply, rejectDiscountRequest } from "../lib/discount"
import { randomBytes } from "crypto"

async function runTest() {
    console.log("Starting Discount Flow Test...")

    // 1. Setup Data
    console.log("1. Setting up Test Data...")
    // Find or Create User
    let user = await db.user.findFirst({ where: { email: "test_sales@example.com" } })
    if (!user) {
        user = await db.user.create({
            data: {
                name: "Test Sales",
                email: "test_sales@example.com",
                password: "hashedpassword",
                role: "SALES"
            }
        })
    }

    let admin = await db.user.findFirst({ where: { email: "test_admin@example.com" } })
    if (!admin) {
        admin = await db.user.create({
            data: {
                name: "Test Admin",
                email: "test_admin@example.com",
                password: "hashedpassword",
                role: "ADMIN"
            }
        })
    }

    // Create Lead
    const lead = await db.lead.create({
        data: {
            customerName: "Test Customer " + randomBytes(4).toString("hex"),
            phone: "1234567890",
            status: "NEW",
            baseTotal: 100000,
            salesUserId: user.id
        }
    })
    console.log("Created Lead:", lead.id)

    try {
        // 2. Create Request
        console.log("2. Creating Discount Request...")
        const request = await createDiscountRequest({
            leadId: lead.id,
            userId: user.id,
            percent: 10,
            reason: "Integration Test"
        })
        console.log("Request Created:", request.id, request.status)

        if (request.status !== "PENDING") throw new Error("Status mismatch")

        // 3. Admin Generate Code
        console.log("3. Admin Generating Code...")
        const { request: approvedReq, code } = await generateDiscountCode({
            requestId: request.id,
            adminId: admin.id,
            approvedPercent: 10
        })
        console.log("Code Generated:", code)
        if (approvedReq.status !== "CODE_GENERATED") throw new Error("Status mismatch after generation")

        // 4. Verify Code
        console.log("4. Verifying Code...")
        const verifyResult = await verifyDiscountCodeAndApply({
            leadId: lead.id,
            code: code,
            userId: user.id
        })
        console.log("Verification Result:", verifyResult)

        // 5. Check Final Lead State
        const finalLead = await db.lead.findUnique({ where: { id: lead.id } })
        console.log("Final Total:", finalLead?.finalTotal?.toNumber())

        if (finalLead?.finalTotal?.toNumber() !== 90000) {
            throw new Error(`Expected 90000, got ${finalLead?.finalTotal}`)
        }

        // 6. Test Rejection Flow (New Lead)
        console.log("6. Testing Rejection Flow...")
        const lead2 = await db.lead.create({
            data: {
                customerName: "Test Customer 2 " + randomBytes(4).toString("hex"),
                phone: "9876543210",
                baseTotal: 50000,
                salesUserId: user.id
            }
        })

        const request2 = await createDiscountRequest({
            leadId: lead2.id,
            userId: user.id,
            percent: 20,
            reason: "Reject Me"
        })

        const rejectedReq = await rejectDiscountRequest({
            requestId: request2.id,
            adminId: admin.id,
            reason: "Not meaningful"
        })

        if (rejectedReq.status !== "REJECTED") throw new Error("Rejection failed")
        console.log("Rejection Successful.")

        console.log("SUCCESS: All tests passed!")
    } catch (error) {
        console.error("TEST FAILED:", error)
    } finally {
        // Cleanup (Optional)
        // await db.lead.delete({ where: { id: lead.id } })
    }
}

runTest()
