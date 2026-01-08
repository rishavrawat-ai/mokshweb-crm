"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { Loader2, User, UserCircle } from "lucide-react"

type Lead = {
    id: number
    customerName: string
    email: string | null
    phone: string
    status: string
    notes: string | null
    baseTotal: number | string
    assignee?: { id: number, name: string } | null
    salesUser?: { id: number, name: string } | null
    financeUser?: { id: number, name: string } | null
    opsUser?: { id: number, name: string } | null
    logs: {
        id: number
        action: string
        details: string
        createdAt: Date | string
        user: { name: string, role: string }
    }[]
}

interface EditLeadModalProps {
    lead: Lead
    users: { id: number, name: string, role: string }[]
    currentUserRole?: string
}

export default function EditLeadModal({ lead, users, currentUserRole }: EditLeadModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(lead.status)
    const [notes, setNotes] = useState(lead.notes || "")
    const [baseTotal, setBaseTotal] = useState(Number(lead.baseTotal))

    // Finance Handoff States
    const [financeUserId, setFinanceUserId] = useState<string>("")

    // Ops Handoff States
    const [opsUserId, setOpsUserId] = useState<string>("")
    const [remark, setRemark] = useState("")

    const router = useRouter()

    const handleSave = async () => {
        setLoading(true)
        try {
            const body: any = {
                status,
                notes,
                baseTotal: Number(baseTotal)
            }

            if (status === "IN_PROGRESS") {
                if (!financeUserId) {
                    alert("Please select a Finance member for handoff")
                    setLoading(false)
                    return
                }
                body.financeUserId = Number(financeUserId)
                body.remark = remark
            }

            if (status === "HANDOFF_TO_OPS") {
                if (!opsUserId) {
                    alert("Please select an Operations member for handoff")
                    setLoading(false)
                    return
                }
                body.opsUserId = Number(opsUserId)
                body.remark = remark
            }

            const res = await fetch(`/api/leads/${lead.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            if (!res.ok) throw new Error("Failed to update lead")

            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Error updating lead")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs">Edit</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Update Lead</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header Info */}
                    <div>
                        <h2 className="text-xl font-bold">{lead.customerName}</h2>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                            <span>{lead.email}</span>
                            <span>•</span>
                            <span>{lead.phone}</span>
                        </div>
                    </div>

                    {/* Assignees */}
                    <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-3 gap-4 border border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Sales Rep</p>
                            <div className="flex items-center gap-2">
                                <UserCircle className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">{lead.salesUser?.name || "Unassigned"}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Finance</p>
                            <div className="flex items-center gap-2">
                                <UserCircle className={`h-4 w-4 ${lead.financeUser ? "text-green-500" : "text-gray-400"}`} />
                                <span className="text-sm font-medium">{lead.financeUser?.name || "Pending"}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Operations</p>
                            <div className="flex items-center gap-2">
                                <UserCircle className={`h-4 w-4 ${lead.opsUser ? "text-purple-500" : "text-gray-400"}`} />
                                <span className="text-sm font-medium">{lead.opsUser?.name || "Pending"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div>
                        <Label className="text-sm font-semibold text-gray-700">Activity Log / Remarks History</Label>
                        <div className="mt-2 border rounded-lg h-32 overflow-y-auto p-4 bg-gray-50 space-y-3">
                            {lead.logs.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-4">No history yet.</p>
                            ) : (
                                lead.logs.map(log => (
                                    <div key={log.id} className="text-xs border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-gray-800">
                                                {log.user.name} <span className="text-gray-400 font-normal">({log.user.role})</span>
                                            </span>
                                            <span className="text-gray-400">{format(new Date(log.createdAt), 'MM/dd/yyyy')}</span>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed">{log.details}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Update Status */}
                    <div className="space-y-2">
                        <Label>Update Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {currentUserRole === 'FINANCE' ? (
                                    <>
                                        {/* Finance View: Only Handoff or keep current */}
                                        {status !== 'HANDOFF_TO_OPS' && (
                                            <SelectItem value={status}>{status.replace(/_/g, ' ')}</SelectItem>
                                        )}
                                        <SelectItem value="HANDOFF_TO_OPS">Handoff to Ops</SelectItem>
                                    </>
                                ) : (
                                    <>
                                        {/* Standard / Admin / Sales View */}
                                        <SelectItem value="NEW">New</SelectItem>
                                        <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                                        <SelectItem value="INTERESTED">Interested</SelectItem>
                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>

                                        {["ADMIN", "SUPER_ADMIN"].includes(currentUserRole || "") && (
                                            <SelectItem value="HANDOFF_TO_OPS">Handoff to Ops</SelectItem>
                                        )}

                                        {["OPERATIONS", "ADMIN", "SUPER_ADMIN"].includes(currentUserRole || "") && (
                                            <>
                                                <SelectItem value="HANDOFF_TO_OPS">Handoff to Ops</SelectItem>
                                                <SelectItem value="PRINTING">Printing</SelectItem>
                                                <SelectItem value="INSTALLATION">Installation</SelectItem>
                                                <SelectItem value="DEAL_CLOSED">Deal Closed</SelectItem>
                                            </>
                                        )}
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Finance Handoff Section */}
                    {status === "IN_PROGRESS" && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                            <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                Finance Handoff Details
                            </h4>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-blue-900">Assign Finance Member</Label>
                                <Select value={financeUserId} onValueChange={setFinanceUserId}>
                                    <SelectTrigger className="w-full bg-white border-blue-200">
                                        <SelectValue placeholder="Select Finance User..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.filter(u => u.role === 'FINANCE').map(user => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-blue-900">Payment Terms / Remarks</Label>
                                <Textarea
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                    className="w-full border-blue-200 h-20 text-sm resize-none bg-white"
                                    placeholder="e.g. 50% Advance received, sent via NEFT..."
                                />
                            </div>
                            <p className="text-xs text-blue-600/80">
                                Saving will explicitly assign this lead to the selected Finance member.
                            </p>
                        </div>
                    )}

                    {/* Ops Handoff Section */}
                    {status === "HANDOFF_TO_OPS" && (
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                            <h4 className="text-sm font-bold text-purple-900 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                                Operations Handoff Details
                            </h4>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-purple-900">Assign Operations Member</Label>
                                <Select value={opsUserId} onValueChange={setOpsUserId}>
                                    <SelectTrigger className="w-full bg-white border-purple-200">
                                        <SelectValue placeholder="Select Ops User..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.filter(u => u.role === 'OPERATIONS').map(user => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-purple-900">Handoff Instructions / Remarks</Label>
                                <Textarea
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                    className="w-full border-purple-200 h-20 text-sm resize-none bg-white"
                                    placeholder="e.g. Payment verified. Proceed with printing..."
                                />
                            </div>
                            <p className="text-xs text-purple-600/80">
                                Saving will explicitly assign this lead to the selected Operations member.
                            </p>
                        </div>
                    )}

                    {/* Standard Notes (Hide if In Progress or Handoff to Ops to focus on Handover remark) */}
                    {status !== "IN_PROGRESS" && status !== "HANDOFF_TO_OPS" && (
                        <div className="space-y-2">
                            <Label>Remarks / Notes</Label>
                            <Textarea
                                placeholder="Add notes about this lead..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                    )}

                    {/* Base Price */}
                    <div className="space-y-2">
                        <Label>Base Quote / Price (₹)</Label>
                        <Input
                            type="number"
                            value={baseTotal}
                            onChange={(e) => setBaseTotal(Number(e.target.value))}
                        />
                        <p className="text-xs text-muted-foreground">Set the initial quote amount before applying discounts.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={loading} className="bg-[#002147] hover:bg-[#002147]/90 text-white">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
