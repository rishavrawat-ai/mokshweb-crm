"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Eye, Send, FileText, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PlansListPage() {
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPlans()
    }, [])

    const fetchPlans = async () => {
        try {
            const res = await fetch("/api/plans")
            const data = await res.json()
            if (Array.isArray(data)) setPlans(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Campaign Plans</h1>
                <Link
                    href="/dashboard/sales/plans/builder"
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" /> New Plan
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left bg-white border">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-700">Client</th>
                            <th className="p-4 font-semibold text-gray-700">Items</th>
                            <th className="p-4 font-semibold text-gray-700 text-right">Total Value</th>
                            <th className="p-4 font-semibold text-gray-700 text-center">Status</th>
                            <th className="p-4 font-semibold text-gray-700 text-right">Date</th>
                            <th className="p-4 font-semibold text-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading plans...</td></tr>
                        ) : plans.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No plans created yet.</td></tr>
                        ) : (
                            plans.map((plan) => {
                                let itemsCount = 0
                                try { itemsCount = JSON.parse(plan.itemsSnapshot || "[]").length } catch (e) { }

                                return (
                                    <tr key={plan.id} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="font-medium">{plan.clientName}</div>
                                            <div className="text-sm text-gray-500">{plan.clientEmail}</div>
                                        </td>
                                        <td className="p-4 text-center">{itemsCount}</td>
                                        <td className="p-4 text-right font-mono">₹{Number(plan.finalTotal).toLocaleString('en-IN')}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs ${plan.status === 'SENT' ? 'bg-green-100 text-green-800' :
                                                    plan.status === 'CONVERTED' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {plan.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-sm text-gray-500">
                                            {new Date(plan.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            <Link href={`/dashboard/sales/plans/${plan.id}`} className="p-2 text-gray-600 hover:text-blue-600 border rounded hover:border-blue-600 transition">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
