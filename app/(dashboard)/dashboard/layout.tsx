"use client"

import { useState } from "react"
import { SessionProvider } from "next-auth/react"
import { Sidebar, Topbar } from "@/components/dashboard/Sidebar"
import { useSession } from "next-auth/react"

// Create a wrapper component to handle the session consumer
function DashboardShell({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const role = session?.user?.role

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]"> {/* Premium Light Grey Background */}
            <Sidebar role={role} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-[1600px] mx-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <DashboardShell>{children}</DashboardShell>
        </SessionProvider>
    )
}
