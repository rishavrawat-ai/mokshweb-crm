"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { projectSchema } from "@/lib/schemas"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

type ProjectFormValues = z.infer<typeof projectSchema>

interface NewProjectModalProps {
    customers: { id: number; name: string; company: string | null }[]
}

export default function NewProjectModal({ customers }: NewProjectModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: "",
            customerId: 0,
            status: "DRAFT" as const,
            discountPercent: 0,
            couponCode: "",
            remarks: ""
        }
    })

    const onSubmit = async (data: ProjectFormValues) => {
        setLoading(true)
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!res.ok) throw new Error("Failed to create project")

            setOpen(false)
            form.reset()
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Error creating project")
        } finally {
            setLoading(false)
        }
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium"
            >
                + New Project
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Create New Project</h2>
                    <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Project Title</label>
                        <input
                            {...form.register("title")}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="e.g. Summer Campaign 2025"
                        />
                        {form.formState.errors.title && (
                            <p className="text-red-500 text-xs">{form.formState.errors.title.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Customer</label>
                        <select
                            {...form.register("customerId", { valueAsNumber: true })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                        >
                            <option value="">Select a customer...</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} {c.company ? `(${c.company})` : ""}
                                </option>
                            ))}
                        </select>
                        {form.formState.errors.customerId && (
                            <p className="text-red-500 text-xs">{form.formState.errors.customerId.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Discount (%)</label>
                            <input
                                type="number"
                                {...form.register("discountPercent", { valueAsNumber: true })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="0"
                                min="0"
                                max="100"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Coupon Code</label>
                            <input
                                {...form.register("couponCode")}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Remarks</label>
                        <textarea
                            {...form.register("remarks")}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Additional notes..."
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
