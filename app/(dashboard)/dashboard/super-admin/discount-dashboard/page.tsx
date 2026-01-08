
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DiscountDashboardClient } from "@/components/discount/DiscountDashboardClient"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DiscountDashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) return redirect("/login")
    if (session.user.role !== "SUPER_ADMIN") return redirect("/dashboard")

    const requests = await db.discountRequest.findMany({
        include: {
            lead: true,
            requestedByUser: true,
        },
        orderBy: { createdAt: "desc" },
    })

    const validRequests = requests.map(req => ({
        ...req,
        lead: {
            ...req.lead,
            baseTotal: Number(req.lead.baseTotal) || 0,
            finalTotal: Number(req.lead.finalTotal) || 0
        },
        createdAt: req.createdAt.toISOString(),
        updatedAt: req.updatedAt.toISOString(),
        tokenExpiresAt: req.tokenExpiresAt?.toISOString() || null,
        otpExpiresAt: req.otpExpiresAt?.toISOString() || null
    }))

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Discount Requests</h1>
                <Link href="/dashboard/super-admin" className="text-sm text-gray-500 hover:text-gray-900">
                    &larr; Back to Portal
                </Link>
            </div>

            <DiscountDashboardClient initialRequests={validRequests} />
        </div>
    )
}
