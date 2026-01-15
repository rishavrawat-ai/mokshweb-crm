
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import InquiryApprovalForm from "./InquiryApprovalForm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DiscountInquiryPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
        redirect("/dashboard")
    }

    const inquiry = await db.discountInquiry.findUnique({
        where: { id: params.id }
    })

    if (!inquiry) notFound()

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Review Discount Inquiry</h1>
            <InquiryApprovalForm inquiry={inquiry} />
        </div>
    )
}
