import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifySecureToken } from "@/lib/discount-utils";

/**
 * GET /api/discount-review/[requestId]
 * Get discount request details for review (token-based, no auth required)
 */
export async function GET(
    req: Request,
    { params }: { params: { requestId: string } }
) {
    try {
        const { requestId } = params;
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return new NextResponse("Token is required", { status: 400 });
        }

        // Get discount request
        const discountRequest = await db.discountRequest.findUnique({
            where: { id: requestId },
            include: {
                lead: {
                    include: {
                        campaignItems: {
                            include: {
                                inventoryHoarding: true,
                            },
                        },
                    },
                },
                requestedByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!discountRequest) {
            return new NextResponse("Discount request not found", { status: 404 });
        }

        // Verify token
        const superAdminEmail =
            process.env.SUPER_ADMIN_EMAIL || "gohypedevelopers@gmail.com";

        if (
            !discountRequest.tokenHash ||
            !discountRequest.tokenExpiresAt ||
            new Date() > discountRequest.tokenExpiresAt
        ) {
            return new NextResponse("Token expired or invalid", { status: 401 });
        }

        const isValidToken = verifySecureToken(
            requestId,
            superAdminEmail,
            token,
            discountRequest.tokenHash
        );

        if (!isValidToken) {
            return new NextResponse("Invalid token", { status: 401 });
        }

        // Check if already processed
        if (
            discountRequest.status === "APPROVED" ||
            discountRequest.status === "REJECTED"
        ) {
            return NextResponse.json({
                success: false,
                message: `This request has already been ${discountRequest.status.toLowerCase()}`,
                status: discountRequest.status,
            });
        }

        // Calculate pricing
        const baseTotal = Number(discountRequest.lead.baseTotal);
        const discountAmount = (baseTotal * discountRequest.requestedPercent) / 100;
        const finalTotal = baseTotal - discountAmount;

        // Format campaign items
        const campaignItems = discountRequest.lead.campaignItems.map((item) => ({
            id: item.id,
            location: item.inventoryHoarding.location,
            city: item.inventoryHoarding.city,
            state: item.inventoryHoarding.state,
            rate: Number(item.rate),
            total: Number(item.total),
        }));

        return NextResponse.json({
            success: true,
            request: {
                id: discountRequest.id,
                leadId: discountRequest.leadId,
                leadName: discountRequest.lead.customerName,
                leadPhone: discountRequest.lead.phone,
                leadEmail: discountRequest.lead.email,
                salesRepName: discountRequest.requestedByUser.name,
                salesRepEmail: discountRequest.requestedByUser.email,
                requestedPercent: discountRequest.requestedPercent,
                baseTotal,
                discountAmount,
                finalTotal,
                reason: discountRequest.reason,
                status: discountRequest.status,
                campaignItems,
                createdAt: discountRequest.createdAt,
            },
        });
    } catch (error) {
        console.error("GET_DISCOUNT_REVIEW_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
