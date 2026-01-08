"use client"

import { useState, useEffect } from "react"
import { Loader2, XCircle, CheckCircle } from "lucide-react"

interface DiscountRequest {
    id: string
    project: { title: string, id: number }
    salesUser: { name: string, email: string }
    requestedDiscountPct: number | null
    requestedCouponCode: string | null
    status: string
    reason: string
    createdAt: string
}

export default function DiscountRequestsPage() {
    const [requests, setRequests] = useState<DiscountRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("PENDING")

    const fetchRequests = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/discount-requests?status=${statusFilter}`)
            if (res.ok) {
                const data = await res.json()
                setRequests(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [statusFilter])

    const handleReject = async (id: string) => {
        const reason = prompt("Enter rejection reason:")
        if (!reason) return

        try {
            const res = await fetch(`/api/admin/discount-requests/${id}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rejectReason: reason })
            })
            if (res.ok) {
                alert("Request Rejected")
                fetchRequests()
            } else {
                alert("Failed to reject")
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Discount Approval Requests</h1>

            <div className="flex gap-4 mb-6">
                {['PENDING', 'APPROVED', 'REJECTED', 'LOCKED', 'EXPIRED'].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === s
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Loading requests...
                                </td>
                            </tr>
                        ) : requests.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                    No requests found with status {statusFilter}.
                                </td>
                            </tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{req.project.title}</div>
                                        <div className="text-xs text-gray-500">ID: {req.project.id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{req.salesUser.name}</div>
                                        <div className="text-xs text-gray-500">{req.salesUser.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {req.requestedDiscountPct ? `${req.requestedDiscountPct}% Off` : '-'}
                                        </div>
                                        {req.requestedCouponCode && (
                                            <div className="text-xs font-mono bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded inline-block mt-1">
                                                {req.requestedCouponCode}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={req.reason}>
                                        {req.reason}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                    req.status === 'PENDING' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {req.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleReject(req.id)}
                                                className="text-red-600 hover:text-red-900 flex items-center justify-end w-full gap-1"
                                            >
                                                <XCircle className="w-4 h-4" /> Reject
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
