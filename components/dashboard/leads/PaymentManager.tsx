"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Phone, Mail, MessageCircle, Clock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface PaymentManagerProps {
    leadId: number
    payment: any // details from db
    currentUserRole: string
}

export default function PaymentManager({ leadId, payment, currentUserRole }: PaymentManagerProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState("")
    const [channel, setChannel] = useState("PHONE")
    const [note, setNote] = useState("")

    if (!payment) return null

    const handleSave = async () => {
        if (!date || !note) {
            alert("Date and Note are required.")
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/leads/${leadId}/payment/add-commitment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    commitmentDate: new Date(date),
                    channel,
                    note
                })
            })

            if (!res.ok) throw new Error("Failed to add commitment")

            setIsOpen(false)
            router.refresh()
            // Reset form
            setDate("")
            setNote("")
        } catch (error) {
            console.error(error)
            alert("Error adding commitment")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">Payment Follow-up</h3>
                    {payment.nextReminderAt ? (
                        <p className="text-xs text-orange-600 font-medium flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            Next Reminder: {format(new Date(payment.nextReminderAt), 'dd MMM yyyy')}
                        </p>
                    ) : (
                        <p className="text-xs text-gray-400 mt-1">No upcoming reminder set.</p>
                    )}
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-xs h-8 gap-1">
                            <Plus className="w-3 h-3" /> Add Commitment
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Payment Commitment / Reminder</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label>Next Commitment Date (Reminder)</Label>
                                <Input
                                    type="datetime-local"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Communication Channel</Label>
                                <Select value={channel} onValueChange={setChannel}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PHONE">Phone Call</SelectItem>
                                        <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                                        <SelectItem value="EMAIL">Email</SelectItem>
                                        <SelectItem value="IN_PERSON">In Person</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Note / Outcome</Label>
                                <Textarea
                                    placeholder="Client promised to pay by..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                                <Button onClick={handleSave} disabled={loading} className="bg-[#002147] text-white">
                                    {loading ? "Saving..." : "Set Reminder"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Recent History */}
            {payment.followupNotes && payment.followupNotes.length > 0 && (
                <div className="border-t border-gray-100 pt-3 space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Activity</p>
                    <div className="space-y-3 max-h-32 overflow-y-auto pr-1">
                        {payment.followupNotes.map((note: any) => (
                            <div key={note.id} className="text-xs bg-gray-50 p-2 rounded-md border border-gray-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-gray-800">System / User</span>
                                    <span className="text-gray-400">{format(new Date(note.createdAt), 'dd MMM, HH:mm')}</span>
                                </div>
                                <p className="text-gray-600">{note.note}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
