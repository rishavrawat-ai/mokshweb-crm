
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { ArrowLeft, Package, Calendar } from "lucide-react"

export default async function OrdersPage() {
    // 1. Get Session
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Please Login</h1>
                    <p className="text-gray-600 mb-4">You need to be logged in to view your orders.</p>
                    <Link href="/client-login?callbackUrl=/orders" className="text-blue-600 underline">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    // 2. Find Customer by Email
    const customer = await db.customer.findFirst({
        where: { email: session.user.email },
        include: {
            projects: {
                orderBy: { createdAt: 'desc' },
                include: {
                    invoices: true,
                }
            }
        }
    })

    const projects = customer?.projects || []

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold text-[#002147]">My Orders</h1>
                    <p className="text-gray-600 mt-2">Track your campaigns and payments</p>
                </div>

                {projects.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-lg shadow border border-gray-100">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900">No Orders Yet</h2>
                        <p className="text-gray-500 mt-2 mb-6">Looks like you haven't booked any campaigns yet.</p>
                        <Link href="/petrolpump-media" className="inline-block px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition">
                            Browse Locations
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {projects.map((project) => (
                            <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {project.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                Ordered on {new Date(project.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {project.invoices.length > 0 && (
                                                <div className="font-bold text-lg text-gray-900">
                                                    ₹{Number(project.invoices[0].amount).toLocaleString('en-IN')}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded p-4 text-sm text-gray-700 whitespace-pre-wrap">
                                        {project.remarks || "No details available."}
                                    </div>

                                    <div className="mt-4 flex gap-4 pt-4 border-t border-gray-100">
                                        <div className="text-sm">
                                            <span className="text-gray-500">Invoice:</span>{' '}
                                            <span className="font-medium text-gray-900">
                                                {project.invoices[0]?.invoiceNumber || "Generating..."}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
