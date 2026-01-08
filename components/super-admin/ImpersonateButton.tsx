"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ImpersonateButtonProps {
    userId: string
    userName: string
}

export function ImpersonateButton({ userId, userName }: ImpersonateButtonProps) {
    const { update } = useSession()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleImpersonate = async () => {
        setIsLoading(true)
        try {
            await update({ impersonateUserId: userId })
            // Determine where to redirect? 
            // Actually, simply refreshing or pushing to dashboard should trigger the role-based redirect
            // But we need to make sure the session update has propagated.
            // update() returns the new session, so we are good.
            router.push("/dashboard")
            router.refresh()
        } catch (error) {
            console.error("Impersonation failed", error)
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleImpersonate}
            disabled={isLoading}
            variant="destructive"
            className="w-full sm:w-auto"
        >
            {isLoading ? "Switching..." : `Log in as ${userName} (Full Access)`}
        </Button>
    )
}
