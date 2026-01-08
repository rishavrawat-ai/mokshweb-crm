import { PageHeader, EmptyState, TableShell } from "@/components/dashboard/DashboardComponents"
import { FilePlus, Receipt } from "lucide-react"

export default function InvoicesPage() {
    return (
        <div className="space-y-8 animate-fade-in-up">
            <PageHeader
                title="Invoices"
                description="Create and manage client invoices."
                action={
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                        <FilePlus className="w-4 h-4" /> New Invoice
                    </button>
                }
            />

            <TableShell>
                <div className="py-16">
                    <EmptyState
                        title="No invoices generated"
                        description="Start by creating an invoice from a project or manually here."
                        image={<Receipt className="w-10 h-10 text-gray-300" />}
                    />
                </div>
            </TableShell>
        </div>
    )
}
