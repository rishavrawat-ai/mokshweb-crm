"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "./DashboardComponents"
import { Phone, User, FileText, Printer, Hammer, Loader2, CheckCircle, Mail, MapPin, CreditCard, X } from "lucide-react"

export default function OpsKanban({ leads, currentUserId }: { leads: any[], currentUserId: number }) {
    const router = useRouter()
    const [selectedLead, setSelectedLead] = useState<any | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [remark, setRemark] = useState("")

    // Filter leads by status
    const receivedLeads = leads.filter(l => l.status === "HANDOFF_TO_OPS")
    const printingLeads = leads.filter(l => l.status === "PRINTING")
    const installationLeads = leads.filter(l => l.status === "INSTALLATION")

    const handleCardClick = (lead: any) => {
        setSelectedLead(lead)
        setRemark("")
        setIsModalOpen(true)
    }

    const handleUpdateStatus = async (newStatus: string) => {
        if (!selectedLead) return

        setLoading(true)
        try {
            const res = await fetch(`/api/leads/${selectedLead.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: newStatus,
                    remark: remark,
                })
            })

            if (!res.ok) throw new Error("Failed to update status")

            router.refresh()
            setIsModalOpen(false)
        } catch (error) {
            console.error(error)
            alert("Failed to update status")
        } finally {
            setLoading(false)
        }
    }

    const renderColumn = (title: string, items: any[], color: string, icon: any) => (
        <div className="flex flex-col bg-gray-100/50 rounded-xl p-3 border border-gray-200/60 h-full">
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${color}`}></span> {title}
                </h3>
                <span className="bg-white border border-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">{items.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 p-0.5 custom-scrollbar">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center text-gray-400">
                        {icon}
                        <p className="text-xs mt-1">No items</p>
                    </div>
                ) : (
                    items.map((lead) => (
                        <div
                            key={lead.id}
                            onClick={() => handleCardClick(lead)}
                            className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className={`absolute top-0 left-0 w-1 h-full ${color.replace('bg-', 'bg-')}`}></div>
                            <div className="flex justify-between items-start mb-1.5 ml-2">
                                <span className="text-[10px] font-bold tracking-wider text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 uppercase">
                                    {lead.status.replace(/_/g, ' ')}
                                </span>
                                <span className="text-[10px] text-gray-400" suppressHydrationWarning>{new Date(lead.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-sm font-bold text-gray-900 mb-1 ml-2 truncate">{lead.customerName}</h4>
                            <div className="ml-2 text-xs text-gray-500 mb-2 space-y-0.5">
                                <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {lead.phone}</p>
                            </div>

                            {/* Latest Log Preview */}
                            {lead.logs && lead.logs.length > 0 && (
                                <div className="ml-2 text-[10px] text-gray-500 bg-gray-50 p-1.5 rounded mb-2 border border-gray-100 italic truncate">
                                    "{lead.logs[0].details}"
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-gray-50 ml-2">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-[10px] font-bold">
                                        {lead.opsUser?.name?.[0] || 'U'}
                                    </div>
                                    <span className="text-[10px] text-gray-600 font-medium">{lead.opsUser?.name || 'Unassigned'}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )

    return (
        <>
            <div className="flex-1 overflow-x-auto pb-2 h-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-[800px] md:min-w-0 h-full">
                    {renderColumn("Received", receivedLeads, "bg-blue-500", <FileText className="w-6 h-6 mb-2 opacity-20" />)}
                    {renderColumn("Under Printing", printingLeads, "bg-yellow-500", <Printer className="w-6 h-6 mb-2 opacity-50" />)}
                    {renderColumn("Under Installation", installationLeads, "bg-green-500", <Hammer className="w-6 h-6 mb-2 opacity-50" />)}
                </div>
            </div>

            {/* Ops Modal */}
            {isModalOpen && selectedLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-[96vw] max-w-5xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-200">
                        {/* Header */}
                        <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg text-gray-900 leading-tight">{selectedLead.customerName}</h3>
                                        <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 border-blue-200 text-blue-700 bg-blue-50 uppercase tracking-wide">{selectedLead.status.replace(/_/g, ' ')}</Badge>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">Lead ID: #{selectedLead.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-all">
                                <span className="sr-only">Close</span>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-gray-50/30 custom-scrollbar">

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                                {/* LEFT COLUMN: Summary & Inventory (8 cols) */}
                                <div className="lg:col-span-8 space-y-4">

                                    {/* 1. Deal Summary Card */}
                                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                                        <div className="flex items-center gap-2 mb-3 border-b border-gray-50 pb-2">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                            <h4 className="text-sm font-semibold text-gray-800">Deal Information</h4>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold mb-1">Contact</p>
                                                <div className="space-y-1">
                                                    <p className="text-gray-900 font-medium flex items-center gap-2 truncate"><Phone className="w-3 h-3 text-gray-400" /> {selectedLead.phone}</p>
                                                    <p className="text-gray-600 flex items-center gap-2 truncate text-xs"><Mail className="w-3 h-3 text-gray-400" /> {selectedLead.email || '-'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold mb-1">Dates</p>
                                                <div className="space-y-1 text-xs">
                                                    <p className="text-gray-700"><span className="text-gray-400 inline-block w-14">Created:</span> <span suppressHydrationWarning>{new Date(selectedLead.createdAt).toLocaleDateString()}</span></p>
                                                    <p className="text-gray-700"><span className="text-gray-400 inline-block w-14">Updated:</span> <span suppressHydrationWarning>{new Date(selectedLead.updatedAt).toLocaleDateString()}</span></p>
                                                </div>
                                            </div>
                                            <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold mb-2">Assigned Team</p>
                                                <div className="flex gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-[10px] font-bold">
                                                            {selectedLead.salesUser?.name?.[0] || 'S'}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400">Sales</p>
                                                            <p className="text-xs font-medium text-gray-900">{selectedLead.salesUser?.name || '-'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold">
                                                            {selectedLead.opsUser?.name?.[0] || 'O'}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400">Ops</p>
                                                            <p className="text-xs font-medium text-gray-900">{selectedLead.opsUser?.name || '-'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Inventory / Campaign Details List */}
                                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-h-[300px]">
                                        <div className="bg-gray-50/80 px-4 py-2.5 border-b border-gray-200 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                <h4 className="text-sm font-semibold text-gray-800">Campaign Inventory</h4>
                                            </div>
                                            <span className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                                                {selectedLead.campaignItems?.length || 0} ITEMS
                                            </span>
                                        </div>

                                        <div className="divide-y divide-gray-100">
                                            {selectedLead.campaignItems && selectedLead.campaignItems.length > 0 ? (
                                                selectedLead.campaignItems.map((item: any, idx: number) => (
                                                    <div key={item.id} className="px-4 py-3 hover:bg-gray-50/50 transition-colors">
                                                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">

                                                            {/* Index & Basic Info */}
                                                            <div className="flex items-start gap-3 flex-1">
                                                                <div className="w-5 h-5 rounded bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                                                                    {idx + 1}
                                                                </div>
                                                                <div>
                                                                    <h5 className="text-sm font-bold text-[#002147] leading-tight mb-0.5">
                                                                        {item.inventoryHoarding.name || item.inventoryHoarding.location || 'Unknown Location'}
                                                                    </h5>
                                                                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                                                        {[item.inventoryHoarding.address, item.inventoryHoarding.city, item.inventoryHoarding.state].filter(Boolean).join(", ")}
                                                                    </p>
                                                                    <div className="flex gap-2 mt-1.5">
                                                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 font-medium">{item.inventoryHoarding.mediaType}</span>
                                                                        {item.inventoryHoarding.illumination && <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-100 font-medium">{item.inventoryHoarding.illumination}</span>}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Specs & Price */}
                                                            <div className="flex flex-row sm:flex-col justify-between items-end min-w-[140px] text-right gap-y-1 gap-x-4 border-t sm:border-t-0 border-gray-50 pt-2 sm:pt-0 w-full sm:w-auto">
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-900">
                                                                        {Number(item.inventoryHoarding.width || 0)} x {Number(item.inventoryHoarding.height || 0)} <span className="font-normal text-xs text-gray-500">{item.inventoryHoarding.unit || 'ft'}</span>
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-sm font-semibold text-gray-700">
                                                                        ₹{Number(item.rate || 0).toLocaleString('en-IN')}
                                                                    </p>
                                                                </div>

                                                                {item.startDate && item.endDate ? (
                                                                    <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-medium whitespace-nowrap mt-1">
                                                                        {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] text-gray-400 italic mt-1">Schedule: Not set</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-12 text-center text-gray-400 italic text-sm">
                                                    No inventory items attached.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>

                                {/* RIGHT COLUMN: Actions & History (4 cols) */}
                                <div className="lg:col-span-4 space-y-4">

                                    {/* 3. Pricing Summary (Review Layout) */}
                                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <CreditCard className="w-3 h-3" /> Pricing Snapshot
                                        </h4>
                                        <div className="space-y-1.5 text-sm">
                                            <div className="flex justify-between text-gray-500">
                                                <span>Base</span>
                                                <span>₹{Number(selectedLead.baseTotal || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount</span>
                                                <span>- ₹{Number(selectedLead.discountAmount || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold text-gray-900 text-base">
                                                <span>Total</span>
                                                <span>₹{Number(selectedLead.finalTotal || selectedLead.baseTotal || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. Action Area (Status & Remarks) */}
                                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-4">

                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2 block">Update Status</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                {selectedLead.status === 'HANDOFF_TO_OPS' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus('PRINTING')}
                                                        disabled={loading}
                                                        className="h-9 w-full bg-yellow-500 hover:bg-yellow-600 text-white px-3 rounded-md text-sm font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
                                                    >
                                                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Printer className="w-3 h-3" />}
                                                        Move to Printing
                                                    </button>
                                                )}

                                                {(selectedLead.status === 'HANDOFF_TO_OPS' || selectedLead.status === 'PRINTING') && (
                                                    <button
                                                        onClick={() => handleUpdateStatus('INSTALLATION')}
                                                        disabled={loading}
                                                        className="h-9 w-full bg-green-600 hover:bg-green-700 text-white px-3 rounded-md text-sm font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
                                                    >
                                                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Hammer className="w-3 h-3" />}
                                                        Move to Installation
                                                    </button>
                                                )}

                                                {selectedLead.status === 'INSTALLATION' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus('DEAL_CLOSED')}
                                                        disabled={loading}
                                                        className="h-9 w-full bg-purple-600 hover:bg-purple-700 text-white px-3 rounded-md text-sm font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
                                                    >
                                                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                                        Mark Deal Closed
                                                    </button>
                                                )}

                                                {/* Fallback button if deal is closed or other status */}
                                                {!['HANDOFF_TO_OPS', 'PRINTING', 'INSTALLATION'].includes(selectedLead.status) && (
                                                    <div className="h-9 flex items-center justify-center bg-gray-100 rounded text-center text-xs font-medium text-gray-500">
                                                        Status: {selectedLead.status}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2 block">Work Note</label>
                                            <textarea
                                                value={remark}
                                                onChange={(e) => setRemark(e.target.value)}
                                                placeholder="Add details about printing, size check, or installation..."
                                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm min-h-[80px] resize-none bg-gray-50"
                                            />
                                            <button
                                                onClick={() => handleUpdateStatus(selectedLead.status)}
                                                disabled={loading || !remark.trim()}
                                                className="mt-2 w-full h-9 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 rounded-md text-xs font-medium transition-colors shadow-sm"
                                            >
                                                Save Note Only
                                            </button>
                                        </div>

                                    </div>

                                    {/* 5. Remarks Timeline (Scrollable) */}
                                    <div className="bg-gray-50 rounded-lg border border-gray-200/60 p-3 flex flex-col h-[220px]">
                                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-3">Activity Log</h4>
                                        <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-3">
                                            {selectedLead.logs && selectedLead.logs.length > 0 ? (
                                                selectedLead.logs.map((log: any) => (
                                                    <div key={log.id} className="relative pl-3 border-l text-xs border-gray-200 pb-1 last:pb-0">
                                                        <div className="absolute -left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                                                        <div className="flex justify-between items-start mb-0.5">
                                                            <span className="font-bold text-gray-900">{log.user?.name}</span>
                                                            <span className="text-[9px] text-gray-400" suppressHydrationWarning>{new Date(log.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-gray-600 leading-relaxed bg-white p-1.5 rounded border border-gray-100 shadow-sm">{log.details}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="h-full flex items-center justify-center">
                                                    <p className="text-center text-gray-400 text-xs italic">No activity recorded.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
