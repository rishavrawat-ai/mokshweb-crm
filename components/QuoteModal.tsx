"use client"

import { useState } from "react"
import { useCart } from "@/context/CartContext"
import { X, CheckCircle, Loader2 } from "lucide-react"

import { useRouter } from "next/navigation"

interface QuoteModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function QuoteModal({ isOpen, onClose }: QuoteModalProps) {
    const router = useRouter()
    const { cartItems, clearCart } = useCart()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        city: ""
    })

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/quote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    items: cartItems
                })
            })

            if (!res.ok) throw new Error("Failed to send quote")

            setSuccess(true)
            // clearCart() - Moved to close action to prevent modal from unmounting immediately
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
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
                    <p className="text-gray-600 mb-6">
                        Thanks for your quote request. We will get back to you shortly.
                    </p>
                    <button
                        onClick={() => {
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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                <div className="border-b px-6 py-4 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-lg text-gray-900">Request a Quote</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Full Name *</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Email Address *</label>
                        <input
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="john@company.com"
                        />
                    </div>

                    <div className="row grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                            <input
                                required
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">City *</label>
                            <input
                                required
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="e.g. Mumbai"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded text-xs text-blue-700 mt-2">
                        You are enquiring for <strong>{cartItems.length} locations</strong>. We will send a confirmation to your email.
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2.5 rounded hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Submitting..." : "Submit Quote Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
