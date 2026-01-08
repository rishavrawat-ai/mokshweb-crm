"use client"

import { cn } from "@/lib/utils"
import { LucideIcon, ArrowUp, ArrowDown } from "lucide-react"

// --- Component: PageHeader ---
interface PageHeaderProps {
    title: string
    description?: string
    action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
                {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
        </div>
    )
}

// --- Component: StatCard ---
interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    description?: string
    trend?: {
        value: string
        positive: boolean
    }
}

export function StatCard({ title, value, icon, description, trend }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    {icon}
                </div>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
                    {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
                </div>
                {trend && (
                    <div className={cn("flex items-center text-xs font-medium px-2 py-1 rounded-full", trend.positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                        {trend.positive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                        {trend.value}
                    </div>
                )}
            </div>
        </div>
    )
}

// --- Component: EmptyState ---
export function EmptyState({ title, description, action, image }: { title: string, description: string, action?: React.ReactNode, image?: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-gray-100 border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                {image || <span className="text-2xl">📋</span>}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-2 mb-6">{description}</p>
            {action}
        </div>
    )
}

// --- Component: Wrapper for Tables to give them style ---
export function TableShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {children}
        </div>
    )
}

export function Badge({ children, variant = "default", className }: { children: React.ReactNode, variant?: "default" | "success" | "warning" | "destructive" | "outline", className?: string }) {
    const variants = {
        default: "bg-blue-50 text-blue-700 border-blue-100",
        success: "bg-green-50 text-green-700 border-green-100",
        warning: "bg-yellow-50 text-yellow-700 border-yellow-100",
        destructive: "bg-red-50 text-red-700 border-red-100",
        outline: "bg-transparent border-gray-200 text-gray-600",
    }

    return (
        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", variants[variant], className)}>
            {children}
        </span>
    )
}
