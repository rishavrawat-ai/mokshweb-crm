
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import bcrypt from "bcryptjs"
import { randomBytes, randomInt } from "crypto"

// Constants
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "gohypedevelopers@gmail.com"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

// -- Service Functions --

/**
 * Creates a new discount request for a lead and sends approval email to Super Admin.
 */
export async function createDiscountRequest({
    leadId,
    userId,
    percent,
    reason,
}: {
    leadId: number
    userId: number
    percent: number
    reason: string
}) {
    // 1. Check if active request exists
    const existingRequest = await db.discountRequest.findFirst({
        where: {
            leadId,
            status: { in: ["PENDING", "UNDER_REVIEW", "OTP_SENT"] },
        },
    })

    if (existingRequest) {
        throw new Error("An active discount request already exists for this lead.")
    }

    // 2. Generate Magic Token for Link
    const tokenRaw = randomBytes(32).toString("hex")
    const tokenHash = await bcrypt.hash(tokenRaw, 10)
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // 3. Create Request
    const request = await db.discountRequest.create({
        data: {
            leadId,
            requestedByUserId: userId,
            requestedPercent: percent,
            reason,
            status: "PENDING",
            tokenHash,
            tokenExpiresAt,
        },
        include: {
            lead: true,
            requestedByUser: true,
        },
    })

    // 4. Email Super Admin
    const reviewUrl = `${APP_URL}/discount-approval/review?token=${tokenRaw}`

    // Calculate impact (if lead has baseTotal)
    const baseTotal = Number(request.lead.baseTotal) || 0
    const discountAmount = (baseTotal * percent) / 100
    const finalPrice = baseTotal - discountAmount

    await sendEmail({
        to: SUPER_ADMIN_EMAIL,
        subject: `Discount Approval Request: ${request.lead.customerName} - ${request.id}`,
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h2 style="color: #333;">Discount Approval Request</h2>
        <p><strong>Request ID:</strong> ${request.id}</p>
        <p><strong>Lead:</strong> ${request.lead.customerName} (ID: ${request.leadId})</p>
        <p><strong>Sales Rep:</strong> ${request.requestedByUser.name}</p>
        
        <hr style="border-top: 1px solid #eaeaea; margin: 20px 0;" />
        
        <h3 style="color: #666;">Pricing Details</h3>
        <p><strong>Original Price:</strong> ₹${baseTotal.toLocaleString()}</p>
        <p><strong>Requested Discount:</strong> ${percent}%</p>
        <p><strong>Discount Amount:</strong> -₹${discountAmount.toLocaleString()}</p>
        <p><strong>Final Price:</strong> ₹${finalPrice.toLocaleString()}</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
             <p style="margin: 0; color: #555;"><strong>Reason:</strong><br/>${reason}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <a href="${reviewUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Review & Approve</a>
        </div>
        
        <p style="font-size: 0.8em; color: #999; margin-top: 30px; text-align: center;">Link expires in 24 hours.</p>
      </div>
    `,
    })

    return request
}

/**
 * Validates the token and retrieves the request details.
 */
export async function getDiscountRequestByToken(tokenRaw: string) {
    const candidates = await db.discountRequest.findMany({
        where: {
            status: { in: ["PENDING", "UNDER_REVIEW", "OTP_SENT"] },
            tokenExpiresAt: { gt: new Date() },
        },
        include: {
            lead: {
                include: {
                    campaignItems: {
                        include: { inventoryHoarding: true }
                    }
                }
            },
            requestedByUser: true
        }
    })

    for (const req of candidates) {
        if (req.tokenHash && (await bcrypt.compare(tokenRaw, req.tokenHash))) {
            return req
        }
    }

    return null
}

/**
 * Generate OTP for an existing request (found via token usually, or ID).
 */
export async function generateApprovalOtp(requestId: string) {
    const request = await db.discountRequest.findUnique({ where: { id: requestId } })
    if (!request) throw new Error("Request not found")

    // Rate limit
    if (request.status === "APPROVED" || request.status === "REJECTED") {
        throw new Error("Request already finalized")
    }

    // Generate 6 digit OTP
    const otp = randomInt(100000, 999999).toString()
    const otpHash = await bcrypt.hash(otp, 10)
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 mins

    await db.discountRequest.update({
        where: { id: requestId },
        data: {
            status: "OTP_SENT",
            otpHash,
            otpExpiresAt,
            otpAttempts: 0
        }
    })

    await sendEmail({
        to: SUPER_ADMIN_EMAIL,
        subject: `OTP for Discount Approval: ${otp}`,
        html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h3>Your OTP is: <span style="font-size: 1.5em; letter-spacing: 2px;">${otp}</span></h3>
        <p>This OTP is valid for 10 minutes.</p>
        <p>Request ID: ${requestId}</p>
      </div>
    `
    })

    return { success: true }
}

/**
 * Verify OTP and Approve.
 */
export async function verifyOtpAndApprove(requestId: string, otp: string, adminId?: number) {
    const request = await db.discountRequest.findUnique({
        where: { id: requestId },
        include: { lead: true, requestedByUser: true }
    })

    if (!request) throw new Error("Request not found")
    if (!request.otpHash || !request.otpExpiresAt) throw new Error("OTP not generated")

    if (new Date() > request.otpExpiresAt) {
        throw new Error("OTP expired")
    }

    if (request.otpAttempts >= 5) {
        throw new Error("Too many attempts. Request locked.")
    }

    const isValid = await bcrypt.compare(otp, request.otpHash)
    if (!isValid) {
        await db.discountRequest.update({
            where: { id: requestId },
            data: { otpAttempts: { increment: 1 } }
        })
        throw new Error("Invalid OTP")
    }

    // Apply Discount
    const baseTotal = Number(request.lead.baseTotal) || 0
    const discountAmount = (baseTotal * request.requestedPercent) / 100
    const finalTotal = baseTotal - discountAmount

    await db.$transaction([
        db.discountRequest.update({
            where: { id: requestId },
            data: {
                status: "APPROVED",
                approvedAt: new Date(),
                approvedByAdminId: adminId || request.requestedByUserId,
                appliedAt: new Date(),
                otpHash: null,
            }
        }),
        db.lead.update({
            where: { id: request.leadId },
            data: {
                discountPercentApplied: request.requestedPercent,
                discountAmount,
                finalTotal,
                // Make sure to reset or update pricing breakdown if needed, but for now logic is simple
            }
        }),
        db.auditLog.create({
            data: {
                action: "APPROVE_DISCOUNT",
                entityType: "LEAD",
                entityId: request.leadId.toString(),
                metaJson: JSON.stringify({ requestId, percent: request.requestedPercent, finalTotal }),
                actorUserId: adminId
            }
        })
    ])

    // Notify info
    await sendEmail({
        to: request.requestedByUser.email,
        subject: `Discount Approved! Lead: ${request.lead.customerName}`,
        html: `<p>Good news! The discount of ${request.requestedPercent}% has been approved and applied.</p>`
    })

    return { success: true }
}

/**
 * Verify OTP and Reject.
 */
export async function verifyOtpAndReject(requestId: string, otp: string, rejectionReason: string, adminId?: number) {
    const request = await db.discountRequest.findUnique({
        where: { id: requestId },
        include: { lead: true, requestedByUser: true }
    })

    if (!request) throw new Error("Request not found")
    if (!request.otpHash || !request.otpExpiresAt) throw new Error("OTP not generated")

    if (new Date() > request.otpExpiresAt) throw new Error("OTP expired")

    const isValid = await bcrypt.compare(otp, request.otpHash)
    if (!isValid) {
        await db.discountRequest.update({
            where: { id: requestId },
            data: { otpAttempts: { increment: 1 } }
        })
        throw new Error("Invalid OTP")
    }

    await db.$transaction([
        db.discountRequest.update({
            where: { id: requestId },
            data: {
                status: "REJECTED",
                rejectionReason,
                otpHash: null
            }
        }),
        db.auditLog.create({
            data: {
                action: "REJECT_DISCOUNT",
                entityType: "LEAD",
                entityId: request.leadId.toString(),
                metaJson: JSON.stringify({ requestId, reason: rejectionReason }),
                actorUserId: adminId
            }
        })
    ])

    await sendEmail({
        to: request.requestedByUser.email,
        subject: `Discount Rejected: ${request.lead.customerName}`,
        html: `<p>The discount request was rejected.<br/>Reason: ${rejectionReason}</p>`
    })

    return { success: true }
}

// -- Legacy / Stub Functions for Build Compatibility --
export async function verifyDiscountCodeAndApply(args: any): Promise<any> {
    throw new Error("Legacy function not implemented. Please use verifyOtpAndApprove.")
}

export async function generateDiscountCode(args: any): Promise<any> {
    throw new Error("Legacy function not implemented.")
}

export async function rejectDiscountRequest(args: any): Promise<any> {
    throw new Error("Legacy function not implemented. Please use verifyOtpAndReject.")
}
