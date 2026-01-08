
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils" // Assuming this exists or I'll standard format
import { toast } from "react-hot-toast" // Assuming installed, or use window.alert fallback
import { Loader2 } from "lucide-react"

interface DiscountRequest {
    id: string
    leadId: number
    lead: {
        customerName: string
        baseTotal: any
        campaignItems: any[]
    }
    requestedByUser: {
        name: string
        email: string
    }
    requestedPercent: number
    reason: string
    status: string
    createdAt: string
}

export function DiscountReviewClient({ request }: { request: DiscountRequest }) {
    const router = useRouter()
    const [status, setStatus] = useState(request.status)
    const [otpSent, setOtpSent] = useState(false)
    const [otp, setOtp] = useState("")
    const [loading, setLoading] = useState(false)
    const [action, setAction] = useState<"APPROVE" | "REJECT" | null>(null)
    const [rejectReason, setRejectReason] = useState("")

    const baseTotal = Number(request.lead.baseTotal) || 0
    const discountAmount = (baseTotal * request.requestedPercent) / 100
    const finalPrice = baseTotal - discountAmount

    const handleGenerateOtp = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/discount-approval/generate-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId: request.id }),
            })
            if (!res.ok) throw new Error(await res.text())
            setOtpSent(true)
            toast.success("OTP sent to Super Admin email")
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyAndAction = async () => {
        if (!action) return
        if (otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP")
            return
        }
        if (action === "REJECT" && !rejectReason) {
            toast.error("Please provide a rejection reason")
            return
        }

        setLoading(true)
        try {
            const endpoint = action === "APPROVE" ? "/api/discount-approval/approve" : "/api/discount-approval/reject"
            const body = {
                requestId: request.id,
                otp,
                reason: action === "REJECT" ? rejectReason : undefined
            }

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })

            if (!res.ok) throw new Error(await res.text())

            toast.success(`Discount ${action === "APPROVE" ? "Approved" : "Rejected"}`)
            setStatus(action === "APPROVE" ? "APPROVED" : "REJECTED")
            setTimeout(() => {
                router.refresh()
            }, 2000)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (status === "APPROVED") {
        return (
            <div className="bg-green-50 border border-green-200 p-8 rounded-lg text-center">
                <h2 className="text-2xl font-bold text-green-700">Request Approved</h2>
                <p className="text-green-600 mt-2">The discount has been applied successfully.</p>
            </div>
        )
    }

    if (status === "REJECTED") {
        return (
            <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
                <h2 className="text-2xl font-bold text-red-700">Request Rejected</h2>
                <p className="text-red-600 mt-2">This request has been rejected.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Lead Details</h3>
                    <div className="space-y-3">
                        <div>
                            <span className="block text-xs text-gray-400">Customer Name</span>
                            <span className="font-semibold text-lg">{request.lead.customerName}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-400">Sales Rep</span>
                            <span className="font-medium">{request.requestedByUser.name}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-400">Request ID</span>
                            <span className="font-mono text-sm">{request.id}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Pricing Impact</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Original Total</span>
                            <span className="font-semibold">₹{baseTotal.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between items-center text-blue-600">
                            <span>Requested Discount ({request.requestedPercent}%)</span>
                            <span className="font-bold">-₹{discountAmount.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="h-px bg-gray-200 my-2"></div>
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-bold text-gray-800">Final Price</span>
                            <span className="font-bold text-green-600">₹{finalPrice.toLocaleString("en-IN")}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaign Inventory Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Campaign Locations ({request.lead.campaignItems?.length || 0})</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {request.lead.campaignItems?.map((item: any) => (
                        <div key={item.id} className="flex flex-col sm:flex-row justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 items-start">
                            <div className="space-y-1">
                                <p className="font-bold text-gray-900 text-sm">
                                    {item.inventoryHoarding.outletName || item.inventoryHoarding.name || "Unknown Outlet"}
                                </p>
                                <p className="text-xs text-gray-600">
                                    {item.inventoryHoarding.locationName || item.inventoryHoarding.location} • {item.inventoryHoarding.city} • {item.inventoryHoarding.state}
                                </p>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                    Size: {item.inventoryHoarding.width}ft x {item.inventoryHoarding.height}ft • Total Area: {item.inventoryHoarding.totalArea} sq.ft
                                </p>
                            </div>
                            <div className="text-right mt-2 sm:mt-0">
                                <p className="font-bold text-gray-900 text-sm">₹{Number(item.total).toLocaleString('en-IN')}</p>
                                {/* <p className="text-[10px] text-gray-400">Rate: ₹{Number(item.rate).toLocaleString('en-IN')}</p> */}
                            </div>
                        </div>
                    ))}
                    {(!request.lead.campaignItems || request.lead.campaignItems.length === 0) && (
                        <p className="text-gray-500 text-sm text-center py-4">No locations selected.</p>
                    )}
                </div>
            </div>

            {/* Reason */}
            <div className="bg-gray-50 p-6 rounded-lg border">
                <h4 className="font-semibold text-gray-900 mb-2">Request Reason</h4>
                <p className="text-gray-700 italic">"{request.reason}"</p>
            </div>

            {/* Actions */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                {!otpSent ? (
                    <div className="text-center">
                        <p className="text-gray-600 mb-6">Review the details above. To take action, you must verify your identity via OTP.</p>
                        <button
                            onClick={handleGenerateOtp}
                            disabled={loading}
                            className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center mx-auto gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Generate Approval OTP
                        </button>
                    </div>
                ) : (
                    <div className="max-w-md mx-auto space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                        <div className="text-center space-y-2">
                            <h3 className="font-bold text-lg">Enter OTP</h3>
                            <p className="text-sm text-gray-500">Sent to Super Admin email</p>
                            <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="text-center text-3xl tracking-[0.5em] font-mono w-full border-b-2 border-gray-300 focus:border-black outline-none py-2 bg-transparent"
                                placeholder="000000"
                            />
                        </div>

                        {!action ? (
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    onClick={() => setAction("REJECT")}
                                    className="px-4 py-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors"
                                >
                                    Reject Request
                                </button>
                                <button
                                    onClick={() => setAction("APPROVE")}
                                    className="px-4 py-3 rounded-lg bg-black text-white hover:bg-gray-800 font-medium transition-colors shadow-lg shadow-gray-200"
                                >
                                    Approve Discount
                                </button>
                            </div>
                        ) : (
                            <div className="pt-4 space-y-4">
                                <h4 className="font-semibold text-center">
                                    Confirm {action === "APPROVE" ? "Approval" : "Rejection"}
                                </h4>

                                {action === "REJECT" && (
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Enter rejection reason..."
                                        className="w-full border rounded-md p-3 focus:ring-2 focus:ring-black outline-none"
                                        rows={3}
                                    />
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setAction(null)}
                                        className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-md"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleVerifyAndAction}
                                        disabled={loading}
                                        className={`flex-1 py-2 text-white rounded-md flex justify-center items-center gap-2 ${action === "APPROVE" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                                    >
                                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
