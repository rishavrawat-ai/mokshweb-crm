"use client"

import { ShoppingCart } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { useRouter } from "next/navigation"

export default function CartFooter() {
    const { cartItems, clearCart } = useCart()
    const router = useRouter()

    if (cartItems.length === 0) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50 flex justify-between items-center px-4 sm:px-8 max-w-[1400px] mx-auto rounded-t-lg">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white p-2 rounded-full">
                    <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-bold text-gray-900">{cartItems.length} locations selected</p>
                    <p className="text-xs text-gray-500">From multiple cities</p>
                </div>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={clearCart}
                    className="text-gray-500 text-sm hover:text-red-500 font-medium px-3"
                >
                    Clear
                </button>
                <button
                    onClick={() => router.push('/cart')}
                    className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition font-medium"
                >
                    View Cart & Request Quote
                </button>
            </div>
        </div>
    )
}
