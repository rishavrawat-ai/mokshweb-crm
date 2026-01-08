
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

type Props = {
    request: any
    requestId: string
}

export default function ApproveForm({ request, requestId }: Props) {
    const router = useRouter()
    const [approvedPercent, setApprovedPercent] = useState(request.requestedPercent)
    const [loading, setLoading] = useState(false)
    const [rejecting, setRejecting] = useState(false)
    const [rejectionReason, setRejectionReason] = useState("")

    const handleApprove = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/discount-requests/${requestId}/generate-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ approvedPercent: Number(approvedPercent) }),
            })
            if (!res.ok) throw new Error(await res.text())

            router.refresh()
            alert("Code Generated & Email Sent!")
        } catch (error: any) {
            alert("Error: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleReject = async () => {
        if (!rejectionReason) return alert("Please provide a rejection reason.")
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/discount-requests/${requestId}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rejectionReason }),
            })
            if (!res.ok) throw new Error(await res.text())
            router.refresh()
            alert("Request Rejected.")
        } catch (error: any) {
            alert("Error: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    if (request.status !== "PENDING") {
        return (
            <Card className="max-w-xl mx-auto mt-8 border-l-4 border-l-gray-500">
                <CardHeader>
                    <CardTitle>Request Status: {request.status}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This request has already been processed.</p>
                    {request.status === "CODE_GENERATED" && <p className="text-green-600">Code Generated.</p>}
                    {request.status === "REJECTED" && <p className="text-red-600">Rejected: {request.rejectionReason}</p>}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold mb-4">Discount Approval Request</h1>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Lead Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Lead Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <span className="text-xs text-muted-foreground uppercase">Customer</span>
                            <p className="font-medium">{request.lead.customerName}</p>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground uppercase">Current Total</span>
                            <p className="font-medium text-xl">₹{Number(request.lead.baseTotal).toLocaleString("en-IN")}</p>
                        </div>
                        <Separator />
                        <div>
                            <span className="text-xs text-muted-foreground uppercase">Requested By</span>
                            <p className="text-sm">{request.requestedByUser?.name} ({request.requestedByUser?.email})</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Request Decision */}
                <Card className="border-t-4 border-t-blue-600 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            Review Request
                            <Badge variant="secondary">{request.requestedPercent}% Requested</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-md border text-sm italic text-gray-700">
                            "{request.reason}"
                        </div>

                        {!rejecting ? (
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Approve Percentage</Label>
                                    <div className="flex bg-white border rounded-md overflow-hidden">
                                        <Input
                                            type="number"
                                            className="border-0 focus-visible:ring-0"
                                            value={approvedPercent}
                                            onChange={(e) => setApprovedPercent(e.target.value)}
                                            max={request.requestedPercent}
                                        />
                                        <div className="bg-gray-100 flex items-center px-4 font-bold text-gray-500">%</div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Max requested: {request.requestedPercent}%</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="bg-blue-50 p-2 rounded text-blue-800 text-sm font-semibold flex justify-between">
                                        <span>New Total if Approved:</span>
                                        <span>₹{(request.lead.baseTotal * (1 - approvedPercent / 100)).toLocaleString("en-IN")}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 pt-4 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-red-600">Rejection Reason</Label>
                                <Textarea
                                    className="resize-none"
                                    placeholder="Explain why this is rejected..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between pt-4 bg-gray-50/50">
                        {rejecting ? (
                            <>
                                <Button variant="ghost" onClick={() => setRejecting(false)}>Cancel</Button>
                                <Button variant="destructive" onClick={handleReject} disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Confirm Reject"}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setRejecting(true)}>
                                    Reject
                                </Button>
                                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleApprove} disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Approve & Generate Code"}
                                </Button>
                            </>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
