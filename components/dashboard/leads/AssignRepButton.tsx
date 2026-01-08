"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, UserPlus } from "lucide-react"

type User = {
    id: number
    name: string
    role: string
}

type Props = {
    leadId: number
    currentAssigneeId?: number | null
    users: User[]
}

export default function AssignRepButton({ leadId, currentAssigneeId, users }: Props) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState<string>(
        currentAssigneeId ? currentAssigneeId.toString() : ""
    )
    const router = useRouter()

    const handleAssign = async () => {
        if (!selectedUserId) return
        setLoading(true)
        try {
            const res = await fetch(`/api/leads/${leadId}/assign`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ assigneeId: selectedUserId }),
            })

            if (!res.ok) {
                throw new Error("Failed to assign lead")
            }

            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to update assignment")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                    Assign Rep
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign Sales Representative</DialogTitle>
                    <DialogDescription>
                        Select a sales representative to handle this lead.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="rep">Sales Representative</Label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                            <SelectTrigger id="rep" className="w-full">
                                <SelectValue placeholder="Select a representative" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                        {user.name}
                                        {/* <span className="text-muted-foreground ml-2 text-xs">({user.role})</span> */}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleAssign} disabled={loading || !selectedUserId}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Assignment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
