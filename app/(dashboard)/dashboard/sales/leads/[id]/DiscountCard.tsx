
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

type DiscountRequest = {
    id: string
    requestedPercent: number
    approvedPercent?: number | null
    status: string
    reason: string
    rejectionReason?: string | null
}

type Props = {
    leadId: number
    initialRequest?: DiscountRequest | null
    baseTotal: number
    finalTotal?: number
    discountAmount?: number
}

const ALLOWED_PERCENTS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]

export default function DiscountCard({ leadId, initialRequest, baseTotal, finalTotal, discountAmount }: Props) {
    const [request, setRequest] = useState<DiscountRequest | null>(initialRequest || null)
    const [loading, setLoading] = useState(false)
    const [reason, setReason] = useState("")
    const [percent, setPercent] = useState("5")
    const [verifyCode, setVerifyCode] = useState("")
    const router = useRouter()

    const submitRequest = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/leads/${leadId}/discount-requests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestedPercent: parseInt(percent), reason }),
            })
            if (!res.ok) throw new Error(await res.text())
            const data = await res.json()
            setRequest(data)
        } catch (err: any) {
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    const verifyCodeAndApply = async () => {
        setLoading(true)
        try {
            if (!request) return
            const res = await fetch(`/api/leads/${leadId}/discount-requests/${request.id}/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: verifyCode }),
            })
            if (!res.ok) throw new Error(await res.text())

            // Update local state to show success immediately
            setRequest((prev) => prev ? { ...prev, status: "APPLIED" } : null)
            router.refresh() // Refresh page to see updated prices
        } catch (err: any) {
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    // --- Render States ---

    // 1. Discount Applied
    if (request?.status === "APPLIED" || (discountAmount && discountAmount > 0)) {
        return (
            <Card className="border-green-500 bg-green-50 dark:bg-green-950/20 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-green-700 flex justify-between items-center">
                        Discount Applied
                        <Badge variant="default" className="bg-green-600">
                            {Math.round(((discountAmount || 0) / (baseTotal || 1)) * 100)}% OFF
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Base Total:</span>
                        <span className="line-through text-gray-400 font-medium">₹{baseTotal?.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-green-700">
                        <span>Discount:</span>
                        <span>- ₹{discountAmount?.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                        <span>Final Total:</span>
                        <span>₹{finalTotal?.toLocaleString("en-IN")}</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // 2. Pending Approval
    if (request?.status === "PENDING") {
        return (
            <Card className="border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20">
                <CardHeader>
                    <CardTitle className="text-yellow-700 flex justify-between items-center text-lg">
                        Approval Pending
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-yellow-800 mb-2">
                        Requested: {request.requestedPercent}%
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                        Waiting for Admin approval...
                    </p>
                </CardContent>
            </Card>
        )
    }

    // 3. Code Generated (Needs Verification)
    if (request?.status === "CODE_GENERATED") {
        return (
            <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                <CardHeader>
                    <CardTitle className="text-blue-700 text-lg">Verify Discount Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Enter Code from Email</Label>
                        <Input
                            placeholder="Ex: A1B2C3..."
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value)}
                            className="font-mono text-center uppercase tracking-widest text-lg"
                        />
                    </div>
                    <Button
                        onClick={verifyCodeAndApply}
                        disabled={loading || !verifyCode}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Apply"}
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // 4. Rejected
    if (request?.status === "REJECTED") {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardHeader>
                    <CardTitle className="text-red-600">Request Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm"><strong>Reason:</strong> {request.rejectionReason}</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 border-red-200 text-red-600 hover:bg-red-100"
                        onClick={() => setRequest(null)}
                    >
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // 5. Default: Request Form
    const selectedPercent = parseInt(percent)
    const discountValue = Math.floor((baseTotal * selectedPercent) / 100)
    const estimatedFinal = Math.floor(baseTotal - discountValue)

    return (
        <div className="space-y-4 lg:sticky lg:top-6">
            <Card className="rounded-xl shadow-sm border border-gray-200">
                <CardHeader className="py-4 border-b bg-gray-50/50">
                    <CardTitle className="text-base font-semibold text-gray-900">Request Discount</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Select Discount %</Label>
                        <Select value={percent} onValueChange={setPercent}>
                            <SelectTrigger className="w-full h-9 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ALLOWED_PERCENTS.map((p) => (
                                    <SelectItem key={p} value={p.toString()}>
                                        {p}% Discount
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Reason</Label>
                        <Textarea
                            placeholder="Reason for discount..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="resize-none h-20 text-sm py-2"
                        />
                    </div>

                    <div className="pt-1">
                        <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 border border-gray-100 mb-3">
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>Base:</span>
                                <span>₹{baseTotal?.toLocaleString("en-IN") ?? 0}</span>
                            </div>
                            <div className="flex justify-between text-xs text-blue-600 font-medium">
                                <span>Disc ({selectedPercent}%):</span>
                                <span>- ₹{discountValue.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-1.5 mt-1.5">
                                <span>Final:</span>
                                <span>₹{estimatedFinal.toLocaleString("en-IN")}</span>
                            </div>
                        </div>

                        <Button
                            onClick={submitRequest}
                            disabled={loading || !reason}
                            className="w-full bg-[#002147] hover:bg-[#002147]/90 text-white font-medium h-9 text-sm rounded-lg"
                        >
                            {loading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : "Submit Request"}
                        </Button>
                        <p className="text-[10px] text-center text-gray-400 mt-2">
                            Approval required from Super Admin
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
