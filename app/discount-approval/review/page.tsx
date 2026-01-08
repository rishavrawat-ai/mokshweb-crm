
import { getDiscountRequestByToken } from "@/lib/discount"
import { DiscountReviewClient } from "@/components/discount/DiscountReviewClient" // I moved it here
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function DiscountReviewPage({
    searchParams,
}: {
    searchParams: { token?: string }
}) {
    const token = searchParams.token

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <h1 className="text-xl font-bold text-red-600 mb-2">Invalid Link</h1>
                    <p className="text-gray-600">The secure link is missing. Please use the link provided in your email.</p>
                </div>
            </div>
        )
    }

    const request = await getDiscountRequestByToken(token)

    if (!request) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <h1 className="text-xl font-bold text-red-600 mb-2">Link Expired or Invalid</h1>
                    <p className="text-gray-600">This approval link has expired or never existed. Please request a new one.</p>
                </div>
            </div>
        )
    }

    // Serialize Decimal for Client Component
    const serializedRequest = {
        ...request,
        lead: {
            ...request.lead,
            baseTotal: request.lead.baseTotal?.toString() || "0",
            discountAmount: request.lead.discountAmount?.toString(),
            finalTotal: request.lead.finalTotal?.toString() || null,
            campaignItems: (request.lead as any).campaignItems?.map((item: any) => ({
                ...item,
                total: item.total?.toString(),
                rate: item.rate?.toString(),
                printingCharge: item.printingCharge?.toString(),
                inventoryHoarding: {
                    ...item.inventoryHoarding,
                    netTotal: item.inventoryHoarding.netTotal?.toString(),
                    createdAt: item.inventoryHoarding.createdAt?.toISOString(),
                    updatedAt: item.inventoryHoarding.updatedAt?.toISOString(),
                }
            })) || []
        },
        requestedByUser: {
            name: request.requestedByUser.name,
            email: request.requestedByUser.email,
        },
        createdAt: request.createdAt.toISOString()
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Discount Approval Review</h1>
                    <p className="mt-2 text-gray-600">Review request information and authorize via OTP.</p>
                </div>

                <DiscountReviewClient request={serializedRequest} />
            </div>
        </div>
    )
}
