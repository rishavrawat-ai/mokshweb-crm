import { PageHeader, EmptyState, TableShell } from "@/components/dashboard/DashboardComponents"
import { CreditCard, Plus } from "lucide-react"

export default function PaymentsPage() {
    return (
        <div className="space-y-8 animate-fade-in-up">
            <PageHeader
                title="Payments"
                description="View payment history and record new transactions."
                action={
                    <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">
                        <Plus className="w-4 h-4" /> Record Payment
                    </button>
                }
            />

            <TableShell>
                <div className="py-16">
                    <EmptyState
                        title="No payments recorded"
                        description="Payments recorded for invoices will appear here."
                        image={<CreditCard className="w-10 h-10 text-gray-300" />}
                    />
                </div>
            </TableShell>
        </div>
    )
}
