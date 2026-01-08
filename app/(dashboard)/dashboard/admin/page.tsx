import { db } from "@/lib/db"
import { PageHeader, StatCard } from "@/components/dashboard/DashboardComponents"
import { Users, Building2, FileText, TrendingUp } from "lucide-react"

export default async function AdminDashboard() {
    const leadCount = await db.lead.count()
    const projectCount = await db.project.count({
        where: {
            status: {
                notIn: ['COMPLETED', 'CANCELLED']
            }
        }
    })
    const pendingInvoiceCount = await db.invoice.count({
        where: {
            status: 'PENDING'
        }
    })

    return (
        <div className="space-y-8 animate-fade-in-up">
            <PageHeader
                title="Admin Overview"
                description="Welcome back. Here's what's happening today."
            />

            <div className="grid gap-6 md:grid-cols-3">
                <StatCard
                    title="Total Leads"
                    value={leadCount}
                    icon={<Users className="w-5 h-5" />}
                    description="Potential clients in pipeline"
                />
                <StatCard
                    title="Active Projects"
                    value={projectCount}
                    icon={<Building2 className="w-5 h-5" />}
                    description="Campaigns currently running"
                />
                <StatCard
                    title="Pending Invoices"
                    value={pendingInvoiceCount}
                    icon={<FileText className="w-5 h-5" />}
                    description="Awaiting payment"
                />
            </div>
        </div>
    )
}
