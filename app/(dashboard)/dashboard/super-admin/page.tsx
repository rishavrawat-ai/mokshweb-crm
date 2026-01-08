
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function SuperAdminDashboardPage() {
    const session = await getServerSession(authOptions)

    if (session?.user.role !== "SUPER_ADMIN") {
        return redirect("/login")
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Super Admin Portal</h1>
                <p className="text-gray-600">
                    Welcome, {session.user.name || "Super Admin"}. Manage your organization from here.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    href="/dashboard/super-admin/discount-dashboard"
                    className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 group"
                >
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">Discount Dashboard &rarr;</h2>
                    <p className="mt-2 text-gray-600 text-sm">
                        Review and approve pending discount requests. Manage discount codes and pricing overrides.
                    </p>
                </Link>

                <Link
                    href="/dashboard/super-admin/users"
                    className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 group"
                >
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">User Management &rarr;</h2>
                    <p className="mt-2 text-gray-600 text-sm">
                        View all system users. Impersonate users to preview their dashboards (Read-Only).
                    </p>
                </Link>
            </div>
        </div>
    )
}
