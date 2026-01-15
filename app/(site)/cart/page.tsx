"use client"

import { useCart } from "@/context/CartContext"
import { Trash2, ArrowLeft, CreditCard, FileText } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import QuoteModal from "@/components/QuoteModal"
import DiscountRequestModal from "@/components/DiscountRequestModal"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function CartPage() {
    const { cartItems, removeFromCart, clearCart } = useCart()
    const { data: session } = useSession()
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false)
    const router = useRouter()

    const formatCurrency = (val: any) => {
        if (!val) return "-"
        return `₹${Number(val).toLocaleString('en-IN')}`
    }

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => sum + (Number(item.netTotal) || 0), 0)
    }

    const handlePayment = async () => {
        if (!session) {
            if (confirm("You need to login to proceed with payment. Login now?")) {
                router.push("/client-login?callbackUrl=/cart")
            }
            return
        }

        if (confirm(`Proceed to pay ${formatCurrency(calculateTotal())}?`)) {
            try {
                const res = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: session.user.id,
                        items: cartItems,
                        totalAmount: calculateTotal()
                    })
                })

                if (res.ok) {
                    clearCart()
                    router.push("/orders")
                } else {
                    alert("Payment failed. Please try again.")
                }
            } catch (error) {
                console.error(error)
                alert("Something went wrong.")
            }
        }
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 pt-32 px-4 pb-20">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
                    <p className="text-gray-600 mb-8">You haven't selected any locations yet.</p>
                    <Link
                        href="/petrolpump-media"
                        className="inline-flex items-center text-blue-600 font-medium hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Browse Media Inventories
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </button>
                </div>

                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Your Selection</h1>
                        <p className="text-gray-500 mt-1">{cartItems.length} locations selected for campaign</p>
                    </div>
                    <button
                        onClick={clearCart}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                    >
                        <Trash2 className="w-4 h-4" /> Clear All
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Items List */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                                        <tr>
                                            <th className="px-4 py-3">Location & City</th>
                                            <th className="px-4 py-3 text-center">Size (ft)</th>
                                            <th className="px-4 py-3 text-center">Hoardings</th>
                                            <th className="px-4 py-3 text-right">Net Total</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {cartItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4">
                                                    <div className="font-medium text-gray-900">{item.name || "N/A"}</div>
                                                    <div className="text-xs text-gray-500">{item.location}</div>
                                                    <div className="text-xs font-semibold text-blue-600 mt-0.5">{item.city}, {item.state}</div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    {item.width} x {item.height}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    {item.hoardingsCount}
                                                </td>
                                                <td className="px-4 py-4 text-right font-medium text-gray-900">
                                                    {formatCurrency(item.netTotal)}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-gray-400 hover:text-red-500 transition"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right: Summary & Actions */}
                    <div className="lg:w-1/3 space-y-6">
                        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Total Items</span>
                                    <span className="font-medium">{cartItems.length}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-3">
                                    <span>Estimated Total</span>
                                    <span>{formatCurrency(calculateTotal())}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handlePayment}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Proceed to Payment
                                </button>

                                <div className="relative flex py-1 items-center">
                                    <div className="flex-grow border-t border-gray-300"></div>
                                    <span className="flex-shrink mx-4 text-gray-400 text-sm">Or</span>
                                    <div className="flex-grow border-t border-gray-300"></div>
                                </div>

                                <button
                                    onClick={() => setIsQuoteModalOpen(true)}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                >
                                    <FileText className="w-5 h-5" />
                                    Request Formal Quote
                                </button>
                                <button
                                    onClick={() => setIsDiscountModalOpen(true)}
                                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                                >
                                    <FileText className="w-5 h-5" />
                                    Request Discount Plan
                                </button>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                    Request a quote or discount plan to get customized rates.
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800">
                            <strong>Note:</strong> Final pricing may vary based on campaign duration and bulk discounts. We recommend requesting a quote for large campaigns.
                        </div>
                    </div>
                </div>
            </div>

            <QuoteModal
                isOpen={isQuoteModalOpen}
                onClose={() => setIsQuoteModalOpen(false)}
            />
            <DiscountRequestModal
                isOpen={isDiscountModalOpen}
                onClose={() => setIsDiscountModalOpen(false)}
            />
        </div>
    )
}
