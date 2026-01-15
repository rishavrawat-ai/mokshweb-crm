
"use client"

import { useState } from "react"
import { Send, Loader2, Check } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PlanActions({ planId, currentStatus }: { planId: string, currentStatus: string }) {
    const router = useRouter()
    const [sending, setSending] = useState(false)

    const handleSend = async () => {
        if (!confirm("Are you sure you want to send this plan to the client?")) return

        setSending(true)
        try {
            const res = await fetch(`/api/plans/${planId}/send`, { method: "POST" })
            if (!res.ok) throw new Error("Failed to send")

            alert("Plan sent successfully!")
            router.refresh()
        } catch (error) {
            alert("Error sending plan")
        } finally {
            setSending(false)
        }
    }

    if (currentStatus === "SENT") {
        return (
            <button disabled className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 cursor-not-allowed">
                <Check className="w-4 h-4" /> Sent
            </button>
        )
    }

    return (
        <button
            onClick={handleSend}
            disabled={sending}
            className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition disabled:opacity-70"
        >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send to Client
        </button>
    )
}
