"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X, Loader2, CheckCircle, RefreshCcw } from "lucide-react"
import { useRouter } from "next/navigation"

const requestSchema = z.object({
    discountPct: z.string().optional(),
    couponCode: z.string().optional(),
    reason: z.string().min(5, "Reason is required (min 5 chars)")
})

interface DiscountRequestModalProps {
    isOpen: boolean
    onClose: () => void
    projectId: number
    onSuccess?: () => void
}

export default function DiscountRequestModal({ isOpen, onClose, projectId, onSuccess }: DiscountRequestModalProps) {
    const router = useRouter()
    const [step, setStep] = useState<'FORM' | 'OTP'>('FORM')
    const [requestId, setRequestId] = useState<string | null>(null)
    const [otp, setOtp] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const form = useForm<z.infer<typeof requestSchema>>({
        resolver: zodResolver(requestSchema),
        defaultValues: { reason: "" }
    })

    if (!isOpen) return null

    const handleRequest = async (values: z.infer<typeof requestSchema>) => {
        setLoading(true)
        setError("")
        try {
            const res = await fetch("/api/discount/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId,
                    discountPct: values.discountPct,
                    couponCode: values.couponCode,
                    reason: values.reason
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Request failed")

            setRequestId(data.requestId)
            setStep('OTP')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async () => {
        if (!otp || otp.length < 6) {
            setError("Enter valid 6-digit OTP")
            return
        }
        setLoading(true)
        setError("")
        try {
            const res = await fetch("/api/discount/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, otp })
            })
            if (!res.ok) {
                const txt = await res.text()
                throw new Error(txt || "Verification failed")
            }

            // Success
            onClose()
            if (onSuccess) onSuccess()
            router.refresh()
            alert("Discount Approved Successfully!")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setLoading(true)
        setError("")
        try {
            const res = await fetch("/api/discount/resend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId })
            })
            if (!res.ok) {
                const txt = await res.text()
                throw new Error(txt)
            }
            alert("OTP Resent to Admin Email")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold text-gray-900">
                        {step === 'FORM' ? "Request Discount" : "Verify OTP"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {step === 'FORM' ? (
                        <form onSubmit={form.handleSubmit(handleRequest)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Discount Percentage (%)</label>
                                <input
                                    {...form.register("discountPct")}
                                    type="number"
                                    step="0.1"
                                    max="100"
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g. 10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Coupon Code (Optional)</label>
                                <input
                                    {...form.register("couponCode")}
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="DISCOUNT50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reason for Discount *</label>
                                <textarea
                                    {...form.register("reason")}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Why is this discount needed?"
                                />
                                {form.formState.errors.reason && (
                                    <p className="text-xs text-red-500 mt-1">{form.formState.errors.reason.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Submit Request"}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
                                OTP has been sent to the Admin email. Please ask Admin for the code.
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 text-center mb-2">Enter 6-digit OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                    maxLength={6}
                                    className="block w-full text-center text-2xl tracking-[0.5em] font-bold rounded-md border border-gray-300 p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="------"
                                />
                            </div>

                            <button
                                onClick={handleVerify}
                                disabled={loading || otp.length !== 6}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify & Apply Discount"}
                            </button>

                            <div className="flex justify-between items-center text-sm">
                                <button
                                    onClick={() => setStep('FORM')}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleResend}
                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    disabled={loading}
                                >
                                    <RefreshCcw className="w-3 h-3" /> Resend OTP
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
