
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import PlanActions from "./PlanActions"

export default async function PlanDetailsPage({ params }: { params: { id: string } }) {
    const plan = await db.plan.findUnique({
        where: { id: params.id },
        include: { createdBy: true }
    })

    if (!plan) notFound()

    const items = JSON.parse(plan.itemsSnapshot || "[]")

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <Link href="/dashboard/sales/plans" className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Plans
            </Link>

            <div className="bg-white shadow rounded-lg overflow-hidden border">
                {/* Header */}
                <div className="bg-gray-50 p-6 border-b flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Campaign Plan for {plan.clientName}</h1>
                        <p className="text-sm text-gray-500 mt-1">Created by {plan.createdBy.name} on {new Date(plan.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${plan.status === 'SENT' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {plan.status}
                        </span>
                        <PlanActions planId={plan.id} currentStatus={plan.status} />
                    </div>
                </div>

                <div className="p-6 grid grid-cols-3 gap-8">
                    {/* Left: Client Info */}
                    <div className="col-span-1 space-y-4">
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Client Details</h3>
                            <div className="bg-gray-50 p-4 rounded border">
                                <p className="font-medium">{plan.clientName}</p>
                                <p className="text-sm text-gray-600">{plan.clientEmail}</p>
                                <p className="text-sm text-gray-600">{plan.clientPhone || "No Phone"}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pricing Summary</h3>
                            <div className="bg-blue-50 p-4 rounded border border-blue-100 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Base Total:</span>
                                    <span>₹{Number(plan.baseTotal).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-red-600">
                                    <span>Discount ({plan.discountType === 'PERCENT' ? `${plan.discountValue}%` : 'FLAT'}):</span>
                                    <span>- ₹{Number(plan.discountAmount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t border-blue-200 pt-2 mt-2">
                                    <span>Final Total:</span>
                                    <span className="text-blue-700">₹{Number(plan.finalTotal).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Items */}
                    <div className="col-span-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Plan Items ({items.length})</h3>
                        <div className="border rounded overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-3">Location / Outlet</th>
                                        <th className="p-3 text-right">Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {items.map((item: any, i: number) => (
                                        <tr key={i}>
                                            <td className="p-3">
                                                <div className="font-medium">{item.outletName || item.name}</div>
                                                <div className="text-xs text-gray-500">{item.locationName || item.location}, {item.city}</div>
                                            </td>
                                            <td className="p-3 text-right font-mono">
                                                ₹{Number(item.netTotal).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {plan.notes && (
                            <div className="mt-6">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h3>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">{plan.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
