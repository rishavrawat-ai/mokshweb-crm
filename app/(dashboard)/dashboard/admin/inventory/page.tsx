import { db } from "@/lib/db"
import InventoryUploader from "@/components/dashboard/InventoryUploader"

export default async function InventoryPage() {
    const inventory = await db.inventoryHoarding.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Inventory Management</h1>
            </div>

            {/* Upload Section */}
            <InventoryUploader />

            {/* Inventory List */}
            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-700">All Hoardings ({inventory.length})</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City/State</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size (WxH)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Area</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {inventory.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No inventory data found. Please import a CSV file.
                                    </td>
                                </tr>
                            ) : (
                                inventory.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.location}</div>
                                            <div className="text-xs text-gray-500">{item.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.city}, {item.state}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.width ? `${Number(item.width)} x ${Number(item.height)}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            ₹{item.rate ? Number(item.rate).toLocaleString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.totalArea ? `${Number(item.totalArea)} sq ft` : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
