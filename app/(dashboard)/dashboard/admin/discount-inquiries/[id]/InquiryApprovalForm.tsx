"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function InquiryApprovalForm({ inquiry }: { inquiry: any }) {
    const router = useRouter()
    const [otp, setOtp] = useState("")
    const [discount, setDiscount] = useState(inquiry.discountPercent || "")
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(inquiry.status)
    const [message, setMessage] = useState("")

    const items = JSON.parse(inquiry.cartSnapshot || "[]")

    const handleAction = async (action: "APPROVE" | "REJECT") => {
        setLoading(true)
        setMessage("")

        try {
            const res = await fetch("/api/discount-inquiry/verify-otp-and-approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inquiryId: inquiry.id,
                    otp,
                    discountPercent: discount,
                    action
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Action failed")

            setStatus(data.status)
            setMessage(action === "APPROVE" ? "Inquiry Approved Successfully" : "Inquiry Rejected")
            router.refresh()
        } catch (error: any) {
            setMessage(error.message)
        } finally {
            setLoading(false)
        }
    }

    const isPending = status === "PENDING"

    return (
        <div className="space-y-6">
            {/* Details */}
            <div className="bg-white p-6 rounded-lg shadow border">
                <h2 className="text-lg font-bold mb-4">Inquiry Details</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500 block">Client Name</span>
                        <span className="font-medium">{inquiry.clientName}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Email</span>
                        <span className="font-medium">{inquiry.clientEmail}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Phone</span>
                        <span className="font-medium">{inquiry.clientPhone || "-"}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Company</span>
                        <span className="font-medium">{inquiry.companyName || "-"}</span>
                    </div>
                    <div className="col-span-2">
                        <span className="text-gray-500 block">Requested Discount / Budget / Notes</span>
                        <span className="font-medium text-orange-600">{inquiry.notes || "-"}</span>
                    </div>
                    {inquiry.requestedDiscount && (
                        <div className="col-span-2">
                            <span className="text-gray-500 block">Expected Discount</span>
                            <span className="font-medium">{inquiry.requestedDiscount}</span>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Cart Items ({items.length})</h3>
                    <div className="max-h-60 overflow-y-auto border rounded text-sm custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="p-2">Item</th>
                                    <th className="p-2 text-right">Net Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map((item: any, i: number) => (
                                    <tr key={i}>
                                        <td className="p-2">
                                            <div className="font-medium">{item.name || item.outletName}</div>
                                            <div className="text-xs text-gray-500">{item.location}</div>
                                        </td>
                                        <td className="p-2 text-right">₹{Number(item.netTotal).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-between mt-3 font-bold text-lg">
                        <span>Base Total:</span>
                        <span>₹{Number(inquiry.baseTotal).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Action Form */}
            <div className="bg-white p-6 rounded-lg shadow border">
                <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
                    <span>Action Required</span>
                    <span className={`px-2 py-1 rounded text-xs ${status === 'APPROVED' ? 'bg-green-100 text-green-800' : status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {status}
                    </span>
                </h2>

                {message && (
                    <div className={`p-3 mb-4 rounded text-sm ${message.includes("Success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {message}
                    </div>
                )}

                {isPending ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Approved Discount %</label>
                            <input
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. 15"
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter percentage (e.g. 15 for 15%).</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Enter OTP (from Email)</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full border p-2 rounded font-mono tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="123456"
                            />
                            <p className="text-xs text-gray-500 mt-1">Check your Admin details email.</p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => handleAction("APPROVE")}
                                disabled={loading}
                                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 flex justify-center gap-2 items-center"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                Verify & Approve
                            </button>
                            <button
                                onClick={() => handleAction("REJECT")}
                                disabled={loading}
                                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50 flex justify-center gap-2 items-center"
                            >
                                <XCircle className="w-4 h-4" />
                                Reject
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        This inquiry has been processed.
                        {status === "APPROVED" && (
                            <div className="mt-2 text-green-600 font-bold">
                                Approved {inquiry.discountPercent}% Discount.
                                <br />
                                Final Total: ₹{Number(inquiry.finalTotal).toLocaleString()}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
