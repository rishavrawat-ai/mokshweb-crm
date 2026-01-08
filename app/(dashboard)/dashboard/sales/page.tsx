import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

export default async function SalesDashboard() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/login")

    const userId = Number(session.user.id)
    const isSales = session.user.role === 'SALES'

    // Filter by user if Sales role, otherwise view all (or adapt as needed)
    // For "My Leads" metric, strictly filter by salesUserId
    const whereUser = isSales ? { salesUserId: userId } : {}

    const totalLeads = await db.lead.count({ where: whereUser })

    // Active: Work in progress (not closed, not lost, not just new)
    const activeDeals = await db.lead.count({
        where: {
            ...whereUser,
            status: { in: ['INTERESTED', 'IN_PROGRESS', 'HANDOFF_TO_OPS', 'PRINTING', 'INSTALLATION'] }
        }
    })

    const wonDeals = await db.lead.count({
        where: {
            ...whereUser,
            status: 'DEAL_CLOSED'
        }
    })

    const lostDeals = await db.lead.count({
        where: {
            ...whereUser,
            status: 'LOST'
        }
    })

    const closedTotal = wonDeals + lostDeals
    const conversionRate = closedTotal > 0 ? Math.round((wonDeals / closedTotal) * 100) : 0

    return (
        <div className="space-y-6 animate-fade-in-up">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sales Overview</h1>
            <div className="grid gap-4 md:grid-cols-4">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Leads</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalLeads}</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Deals</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{activeDeals}</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Closed Won</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">{wonDeals}</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conversion Rate</h3>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{conversionRate}%</p>
                </div>
            </div>
        </div>
    )
}
