import { db } from "@/lib/db"
import { PageHeader, StatCard, TableShell, Badge } from "@/components/dashboard/DashboardComponents"
import { CreditCard, FileText, AlertCircle, IndianRupee, TrendingUp, User, Phone, ArrowUpRight } from "lucide-react"
import FinancePendingDeals from "@/components/dashboard/FinancePendingDeals"

export const dynamic = "force-dynamic"

export default async function FinanceDashboard() {
    // 1. Fetch Inbound Deals from Sales (Leads marked IN_PROGRESS)
    // 1. Fetch Inbound Deals from Sales (Leads marked IN_PROGRESS)
    const inboundDeals = await db.lead.findMany({
        where: { status: 'IN_PROGRESS' },
        include: {
            assignee: { select: { name: true } },
            salesUser: { select: { name: true } },
            financeUser: { select: { name: true } },
            opsUser: { select: { name: true } },
            logs: {
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true, role: true } } }
            }
        },
        orderBy: { updatedAt: 'desc' }
    })

    // 2. Fetch summary stats
    const pendingInvoiceCount = await db.invoice.count({
        where: { status: 'PENDING' }
    })

    const revenueResult = await db.paymentTransaction.aggregate({
        _sum: { amount: true }
    })
    const totalRevenue = revenueResult._sum.amount ? Number(revenueResult._sum.amount) : 0

    const outstandingResult = await db.invoice.aggregate({
        _sum: { amount: true },
        where: { status: 'PENDING' }
    })
    const totalOutstanding = outstandingResult._sum.amount ? Number(outstandingResult._sum.amount) : 0

    // 3. Fetch Recent Invoices/Transactions
    const recentInvoices = await db.invoice.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { project: { include: { customer: true } } }
    })

    // 4. Fetch Ops Users for Handoff
    const opsUsers = await db.user.findMany({
        where: { role: 'OPERATIONS' },
        select: { id: true, name: true, role: true }
    })

    return (
        <div className="space-y-8 animate-fade-in-up">
            <PageHeader
                title="Finance Overview"
                description="Financial status, revenue, and pending deals."
                action={
                    <button className="bg-[#002147] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors shadow-sm">
                        Generate Report
                    </button>
                }
            />

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <StatCard
                    title="Total Revenue"
                    value={`₹${totalRevenue.toLocaleString()}`}
                    icon={<IndianRupee className="w-5 h-5" />}
                    description="Total successfully collected"
                />
                <StatCard
                    title="Outstanding Amount"
                    value={`₹${totalOutstanding.toLocaleString()}`}
                    icon={<AlertCircle className="w-5 h-5" />}
                    description="Pending invoices total"
                />
                <StatCard
                    title="Pending Deals"
                    value={inboundDeals.length}
                    icon={<TrendingUp className="w-5 h-5" />}
                    description="Deals awaiting processing"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Deals Section (Client Component) */}
                <FinancePendingDeals deals={inboundDeals} opsUsers={opsUsers} />

                {/* Recent Invoices / Activity */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Recent Invoices</h2>
                        <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">View All</span>
                    </div>
                    <TableShell>
                        {recentInvoices.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No recent invoices generated.
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Invoice #</th>
                                        <th className="px-4 py-3 font-medium">Client</th>
                                        <th className="px-4 py-3 font-medium text-right">Amount</th>
                                        <th className="px-4 py-3 font-medium text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentInvoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{inv.invoiceNumber}</td>
                                            <td className="px-4 py-3 text-gray-600">{inv.project.customer.name}</td>
                                            <td className="px-4 py-3 text-right font-medium">₹{Number(inv.amount).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>{inv.status}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </TableShell>
                </div>
            </div>
        </div>
    )
}
