"use client"

import { useState } from "react"
import { useCart } from "@/context/CartContext"
import { X, CheckCircle, Loader2, Info } from "lucide-react"
import { useRouter } from "next/navigation"

interface DiscountRequestModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function DiscountRequestModal({ isOpen, onClose }: DiscountRequestModalProps) {
    const router = useRouter()
    const { cartItems, clearCart } = useCart()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        companyName: "",
        notes: "",
        expectedDiscount: "",
    })

    if (!isOpen) return null

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => sum + (Number(item.netTotal) || 0), 0)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/discount-inquiry/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    items: cartItems,
                    baseTotal: calculateTotal()
                })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || "Failed to submit request")

            setSuccess(true)
        } catch (error) {
            console.error(error)
            alert("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 text-center animate-in fade-in zoom-in">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
                    <p className="text-gray-600 mb-6">
                        Your discount request has been sent to our admin team. Valid requests are usually approved within 10 minutes. You will receive an email shortly.
                    </p>
                    <button
                        onClick={() => {
                            clearCart() // Optional: clear cart or keep it? Requirement says "sends a discounted campaign plan email", implies a new flow.
                            // But usually users might want to keep browsing. 
                            // However, the `DiscountInquiry` saves the cart snapshot. 
                            // Let's clear the cart to simulate "Order Placed" feel, or we can keep it.
                            // Given the mockups, usually we redirect home.
                            clearCart()
                            onClose()
                            router.push("/")
                        }}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium w-full"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="border-b px-6 py-4 flex justify-between items-center bg-gray-50 sticky top-0 bg-white/95 backdrop-blur z-10">
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900">Request Discount Plan</h3>
                        <p className="text-xs text-gray-500">Get the best possible price for your campaign</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Full Name *</label>
                            <input
                                required
                                type="text"
                                value={formData.clientName}
                                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Your Name"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Company Name</label>
                            <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Email Address *</label>
                        <input
                            required
                            type="email"
                            value={formData.clientEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="john@company.com"
                        />
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Info className="w-3 h-3" /> We will send the discounted plan to this email.
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            value={formData.clientPhone}
                            onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="+91 98765 43210 (Optional)"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Expected Discount % (Rough Idea)</label>
                        <input
                            type="text"
                            value={formData.expectedDiscount}
                            onChange={(e) => setFormData(prev => ({ ...prev, expectedDiscount: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="e.g. 10-15%"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Additional Notes / Requirements</label>
                        <textarea
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Any specific requests?"
                        />
                    </div>

                    <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-200">
                        <strong>For {cartItems.length} items.</strong> Total Estimation: ₹{calculateTotal().toLocaleString('en-IN')}. <br />
                        Submitting this request triggers an immediate review by our admin team.
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-600/20"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Sending Request..." : "Submit Discount Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
