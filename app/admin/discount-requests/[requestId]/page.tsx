
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import ApproveForm from "./ApproveForm"

export default async function DiscountRequestPage({ params }: { params: { requestId: string } }) {
    const request = await db.discountRequest.findUnique({
        where: { id: params.requestId },
        include: {
            lead: true,
            requestedByUser: true,
        },
    })

    if (!request) {
        return notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <ApproveForm request={request} requestId={params.requestId} />
        </div>
    )
}
