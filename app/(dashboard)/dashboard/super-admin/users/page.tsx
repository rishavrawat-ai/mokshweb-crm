
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function SuperAdminUsersPage() {
    const session = await getServerSession(authOptions)
    if (session?.user.role !== "SUPER_ADMIN") redirect("/login")

    const users = await db.user.findMany({
        orderBy: { name: "asc" }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                <Link href="/dashboard/super-admin" className="text-sm text-gray-500 hover:text-gray-900">
                    &larr; Back to Portal
                </Link>
            </div>

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-medium text-gray-700">Name</th>
                            <th className="p-4 font-medium text-gray-700">Email</th>
                            <th className="p-4 font-medium text-gray-700">Role</th>
                            <th className="p-4 font-medium text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-900">{user.name}</td>
                                <td className="p-4 text-gray-500">{user.email}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <Link
                                        href={`/dashboard/super-admin/users/${user.id}/preview`}
                                        className="inline-flex items-center px-3 py-1.5 bg-black text-white rounded-md text-xs font-medium hover:bg-gray-800 transition-colors"
                                    >
                                        Preview Dashboard
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
