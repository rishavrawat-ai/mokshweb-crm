"use client"

import { useState } from "react"
import { Image as ImageIcon, CheckSquare, Square, ShoppingCart } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { useRouter } from "next/navigation"
import CartFooter from "@/components/CartFooter"

interface Hoarding {
    id: number
    name: string | null
    location: string
    district: string | null
    hoardingsCount: number
    width: any
    height: any
    totalArea: any
    rate: any
    printingCharge: any
    netTotal: any
    state: string
    city: string
}

interface CityHoardingTableProps {
    hoardings: Hoarding[]
}

export default function CityHoardingTable({ hoardings }: CityHoardingTableProps) {
    const { cartItems, toggleCartItem, isInCart, clearCart } = useCart()
    const router = useRouter()

    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    const toggleAll = () => {
        // Check if all displayed hoardings are in cart
        const allSelected = hoardings.every(h => isInCart(h.id))

        hoardings.forEach(h => {
            if (allSelected) {
                // If all selected, verify they are in cart before toggling (removing)
                if (isInCart(h.id)) toggleCartItem(h)
            } else {
                // If not all selected, add the missing ones
                if (!isInCart(h.id)) toggleCartItem(h)
            }
        })
    }

    const formatCurrency = (val: any) => {
        if (!val) return "-"
        return `₹${Number(val).toLocaleString('en-IN')}`
    }

    return (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden relative">

            <div className="overflow-x-auto pb-16">
                <table className="w-full text-xs text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
                        <tr>
                            <th className="px-3 py-3 w-10 text-center">Sn</th>
                            <th className="px-3 py-3 min-w-[150px]">Retail Outlet Name</th>
                            <th className="px-3 py-3 min-w-[200px]">Location</th>
                            <th className="px-3 py-3">District</th>
                            <th className="px-3 py-3 text-center">No. of<br />Hoardings</th>
                            <th className="px-3 py-3 text-center">Width<br />(ft)</th>
                            <th className="px-3 py-3 text-center">Height<br />(ft)</th>
                            <th className="px-3 py-3 text-center">Total Area<br />(sq ft)</th>
                            <th className="px-3 py-3 text-right">Rates<br />(₹)</th>
                            <th className="px-3 py-3 text-right">Printing<br />Charge (₹)</th>
                            <th className="px-3 py-3 text-right">Net Total<br />(₹)</th>
                            <th className="px-3 py-3 text-center">Gallery</th>
                            <th className="px-3 py-3 text-center">
                                <button onClick={toggleAll} className="focus:outline-none" title="Select All on Page">
                                    {hoardings.length > 0 && hoardings.every(h => isInCart(h.id)) ? (
                                        <CheckSquare className="w-4 h-4 text-blue-600" />
                                    ) : (
                                        <Square className="w-4 h-4 text-gray-400" />
                                    )}
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {hoardings.map((hoarding, index) => {
                            const isSelected = isInCart(hoarding.id)
                            return (
                                <tr
                                    key={hoarding.id}
                                    className={`hover:bg-blue-50 transition-colors ${isSelected ? 'bg-blue-50' : 'bg-white'}`}
                                >
                                    <td className="px-3 py-3 text-center font-medium">{index + 1}</td>
                                    <td className="px-3 py-3 font-medium text-blue-600">{hoarding.name || "N/A"}</td>
                                    <td className="px-3 py-3 text-gray-700 max-w-xs truncate" title={hoarding.location}>
                                        {hoarding.location}
                                    </td>
                                    <td className="px-3 py-3 whitespace-nowrap">{hoarding.district || "-"}</td>
                                    <td className="px-3 py-3 text-center">{hoarding.hoardingsCount}</td>
                                    <td className="px-3 py-3 text-center">{hoarding.width ? Number(hoarding.width) : "-"}</td>
                                    <td className="px-3 py-3 text-center">{hoarding.height ? Number(hoarding.height) : "-"}</td>
                                    <td className="px-3 py-3 text-center font-medium">{hoarding.totalArea ? Number(hoarding.totalArea) : "-"}</td>
                                    <td className="px-3 py-3 text-right whitespace-nowrap">{formatCurrency(hoarding.rate)}</td>
                                    <td className="px-3 py-3 text-right whitespace-nowrap">{formatCurrency(hoarding.printingCharge)}</td>
                                    <td className="px-3 py-3 text-right font-bold text-gray-900 whitespace-nowrap">
                                        {formatCurrency(hoarding.netTotal)}
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <button
                                            onClick={() => setSelectedImage("/images/petrol-pump-demo.png")}
                                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                            title="View Gallery"
                                        >
                                            <ImageIcon className="w-4 h-4 mx-auto" />
                                        </button>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <button
                                            onClick={() => toggleCartItem(hoarding)}
                                            className="focus:outline-none"
                                        >
                                            {isSelected ? (
                                                <CheckSquare className="w-5 h-5 text-blue-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <CartFooter />

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
                        {/* Close Button Mobile/Desktop */}
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
                        >
                            <span className="sr-only">Close</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>

                        <img
                            src={selectedImage}
                            alt="Site View"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
