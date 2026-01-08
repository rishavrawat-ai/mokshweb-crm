
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

import { ImpersonateButton } from "@/components/super-admin/ImpersonateButton"

export const dynamic = "force-dynamic"

export default async function UserDashboardPreviewPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (session?.user.role !== "SUPER_ADMIN") redirect("/login")

    const userId = parseInt(params.id)
    if (isNaN(userId)) return <div>Invalid User ID</div>

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return <div>User not found</div>

    const leadsCount = await db.lead.count({
        where: {
            OR: [
                { salesUserId: userId },
                { assigneeId: userId },
                { financeUserId: userId },
                { opsUserId: userId }
            ]
        }
    })

    const projectsCount = await db.project.count({
        where: { salesUserId: userId }
    })

    return (
        <div className="space-y-6">
            <div className="bg-orange-600 text-white p-4 rounded-lg shadow-lg flex justify-between items-center">
                <div>
                    <div className="font-bold flex items-center gap-2">
                        <span>⚠️ READ-ONLY PREVIEW: Viewing as {user.name} ({user.role})</span>
                    </div>
                    <p className="text-xs text-orange-100 mt-1">
                        To edit or manage this user's data, swap to their account below.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/dashboard/super-admin/users" className="text-white hover:text-orange-100 text-sm underline">
                        Exit
                    </Link>
                    <ImpersonateButton userId={user.id.toString()} userName={user.name} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Role</h3>
                    <p className="text-2xl font-bold">{user.role}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Assigned Leads</h3>
                    <p className="text-3xl font-bold text-blue-600">{leadsCount}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Projects</h3>
                    <p className="text-3xl font-bold text-green-600">{projectsCount}</p>
                </div>
            </div>

            <div className="bg-white p-12 rounded-lg shadow-sm text-center border-dashed border-2 border-gray-300">
                <h2 className="text-xl text-gray-500 font-medium">Dashboard Snapshot</h2>
                <p className="text-gray-400 mt-2 max-w-md mx-auto">
                    Full interactive dashboard emulation requires logging in as the user.
                    This view provides a quick audit of their current workload statistics.
                </p>
            </div>
        </div>
    )
}
