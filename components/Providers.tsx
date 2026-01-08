"use client"

import { CartProvider } from "@/context/CartContext"
import { SessionProvider } from "next-auth/react"

import { Toaster } from "react-hot-toast"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <CartProvider>
                {children}
                <Toaster position="top-right" />
            </CartProvider>
        </SessionProvider>
    )
}
