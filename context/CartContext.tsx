"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

export interface Hoarding {
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

interface CartContextType {
    cartItems: Hoarding[]
    addToCart: (item: Hoarding) => void
    removeFromCart: (id: number) => void
    toggleCartItem: (item: Hoarding) => void
    isInCart: (id: number) => boolean
    clearCart: () => void
    cartCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<Hoarding[]>([])

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("moksh-cart")
        if (saved) {
            try {
                setCartItems(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse cart", e)
            }
        }
    }, [])

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem("moksh-cart", JSON.stringify(cartItems))
    }, [cartItems])

    const addToCart = (item: Hoarding) => {
        setCartItems(prev => {
            if (prev.find(i => i.id === item.id)) return prev
            return [...prev, item]
        })
    }

    const removeFromCart = (id: number) => {
        setCartItems(prev => prev.filter(i => i.id !== id))
    }

    const toggleCartItem = (item: Hoarding) => {
        setCartItems(prev => {
            const exists = prev.find(i => i.id === item.id)
            if (exists) {
                return prev.filter(i => i.id !== item.id)
            } else {
                return [...prev, item]
            }
        })
    }

    const isInCart = (id: number) => {
        return cartItems.some(i => i.id === id)
    }

    const clearCart = () => {
        setCartItems([])
    }

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            toggleCartItem,
            isInCart,
            clearCart,
            cartCount: cartItems.length
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
