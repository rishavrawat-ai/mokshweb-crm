import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import DiscountCard from "./DiscountCard"
import CampaignManager from "@/components/dashboard/CampaignManager"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import AssignRepButton from "@/components/dashboard/leads/AssignRepButton"
import EditLeadModal from "@/components/dashboard/leads/EditLeadModal"
import PaymentManager from "@/components/dashboard/leads/PaymentManager"

export const dynamic = "force-dynamic"

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session) {
        // Redirect or show generic error
        return <div>Please log in</div>
    }

    const leadId = parseInt(params.id)
    if (isNaN(leadId)) return notFound()

    // Fetch Lead
    let lead = await db.lead.findUnique({
        where: { id: leadId },
        include: {
            discountRequests: {
                where: {
                    // Get the most relevant request (latest active)
                    status: { in: ["PENDING", "CODE_GENERATED", "APPLIED", "REJECTED"] }
                },
                orderBy: { createdAt: 'desc' },
                take: 1
            },
            salesUser: true,
            financeUser: true,
            opsUser: true,
            assignee: true,
            payment: {
                include: {
                    followupNotes: {
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    }
                }
            },
            campaignItems: {
                include: { inventoryHoarding: true }
            },
            logs: {
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true, role: true } }
                }
            }
        }
    })

    if (!lead) return notFound()

    // Self-healing: Ensure LeadPayment exists
    if (!lead.payment) {
        await db.leadPayment.create({
            data: {
                leadId: lead.id,
                status: "NOT_RAISED"
            }
        })
        // Re-fetch to get the payment relation populated
        lead = await db.lead.findUnique({
            where: { id: leadId },
            include: {
                discountRequests: {
                    where: { status: { in: ["PENDING", "CODE_GENERATED", "APPLIED", "REJECTED"] } },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                salesUser: true,
                financeUser: true,
                opsUser: true,
                assignee: true,
                payment: {
                    include: {
                        followupNotes: { orderBy: { createdAt: 'desc' }, take: 5 }
                    }
                },
                campaignItems: { include: { inventoryHoarding: true } },
                logs: {
                    orderBy: { createdAt: 'desc' },
                    include: { user: { select: { name: true, role: true } } }
                }
            }
        }) as any // Re-cast as necessary if types infer null
    }

    if (!lead) return notFound()

    // Fetch Potential Assignees (Sales Reps, Finance for handoff)
    const assignableUsers = await db.user.findMany({
        where: {
            role: { in: ["SALES", "ADMIN", "SUPER_ADMIN", "FINANCE", "OPERATIONS"] }
        },
        select: { id: true, name: true, role: true },
        orderBy: { name: 'asc' }
    })

    const latestRequest = lead.discountRequests[0] || null

    // Calculate campaign stats
    // Calculate campaign stats
    const totalItems = lead.campaignItems.length
    const uniqueCities = new Set(lead.campaignItems.map(item => item.inventoryHoarding.city)).size
    const avgPrice = totalItems > 0 ? lead.campaignItems.reduce((acc, curr) => acc + Number(curr.total), 0) / totalItems : 0

    return (
        <div className="w-full max-w-[1400px] mx-auto p-6 space-y-6">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center text-xs text-muted-foreground mb-1">
                        <span>Sales</span>
                        <span className="mx-2">/</span>
                        <span>Leads</span>
                        <span className="mx-2">/</span>
                        <span className="font-medium text-foreground">#{lead.id}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{lead.customerName}</h1>
                        <Badge variant={lead.status === "NEW" ? "default" : "secondary"} className="uppercase text-[10px] font-semibold tracking-wider">
                            {lead.status}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {['ADMIN', 'SUPER_ADMIN'].includes(session.user.role) && (
                        <AssignRepButton
                            leadId={lead.id}
                            currentAssigneeId={lead.assigneeId}
                            users={assignableUsers}
                        />
                    )}
                    <EditLeadModal
                        lead={{
                            ...lead,
                            baseTotal: Number(lead.baseTotal)
                        }}
                        users={assignableUsers}
                        currentUserRole={session.user.role}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                {/* LEFT COLUMN (Lead Info, Pricing, Inventory) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* 1. Lead Details */}
                    <Card className="rounded-xl border bg-card shadow-sm">
                        <CardHeader className="py-4 px-6 border-b bg-gray-50/40">
                            <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Lead Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</Label>
                                        <div className="mt-1.5 space-y-1">
                                            <p className="text-sm font-medium text-gray-900">{lead.phone}</p>
                                            <p className="text-sm text-gray-500">{lead.email || "-"}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Stage</Label>
                                        <div className="mt-1.5">
                                            <Badge variant="outline" className="text-xs px-2.5 py-0.5">{lead.status}</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">Assigned Team</Label>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold ring-2 ring-white">
                                                    {lead.salesUser?.name?.[0] || 'S'}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-blue-600">Sales</p>
                                                    <p className="text-sm font-medium text-gray-900 leading-none">{lead.salesUser?.name || "Unassigned"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold ring-2 ring-white">
                                                    {lead.financeUser?.name?.[0] || 'F'}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-green-600">Finance</p>
                                                    <p className="text-sm font-medium text-gray-900 leading-none">{lead.financeUser?.name || "Unassigned"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold ring-2 ring-white">
                                                    {lead.opsUser?.name?.[0] || 'O'}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-purple-600">Operations</p>
                                                    <p className="text-sm font-medium text-gray-900 leading-none">{lead.opsUser?.name || "Unassigned"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Pricing Breakdown Used to be here, moved to right or kept but styled better? User req asked for breakdown in Left col in prev structure but right panel req mentions pricing preview box. 
                       Actually, the breakdown is detailed (Tax, Disc, Total). Let's keep a detailed one here and summary on right? 
                       Wait, User req: "Pricing preview box (Base, Discount, Final)" in Right Panel.
                       But usually, Main breakdown is useful. I will keep a simplified Breakdown visual here if space permits, OR just rely on the right panel sticky one.
                       The request mentions: "Left column: Lead Details, Pricing Breakdown (implied)". 
                       Let's Keep "Pricing Breakdown" here as per original, but styled nicely.
                    */}
                    <Card className="rounded-xl border bg-card shadow-sm">
                        <CardHeader className="py-4 px-6 border-b bg-gray-50/40">
                            <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Financials</CardTitle>
                        </CardHeader>


                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 border-dashed">
                                    <span className="text-sm text-muted-foreground">Base Quote Amount</span>
                                    <span className="text-base font-medium tabular-nums">₹{Number(lead.baseTotal).toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 border-dashed">
                                    <span className="text-sm text-muted-foreground">Applied Discount ({lead.discountPercentApplied || 0}%)</span>
                                    <span className="text-base font-medium text-green-600 tabular-nums">- ₹{Number(lead.discountAmount || 0).toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-base font-bold text-gray-900">Total Payable</span>
                                    <span className="text-xl font-bold text-gray-900 tabular-nums">₹{Number(lead.finalTotal || lead.baseTotal).toLocaleString("en-IN")}</span>
                                </div>
                            </div>

                            {/* Payment / Reminder Manager */}
                            {lead.payment && (
                                <>
                                    <Separator className="my-6" />
                                    <PaymentManager
                                        leadId={lead.id}
                                        payment={lead.payment}
                                        currentUserRole={session.user.role}
                                    />
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* 3. Campaign Inventory - The Main List */}
                    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                        {/* We use the CampaignManager component which handles the UI internally. 
                           I'm wrapping it in a clean container to ensure it aligns nicely. 
                        */}
                        <CampaignManager
                            leadId={lead.id}
                            initialItems={lead.campaignItems.map(item => ({
                                ...item,
                                total: Number(item.total),
                                rate: Number(item.rate),
                                printingCharge: item.printingCharge ? Number(item.printingCharge) : null,
                                inventoryHoarding: {
                                    ...item.inventoryHoarding,
                                    netTotal: Number(item.inventoryHoarding.netTotal || 0)
                                }
                            }))}
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN (Sticky Sidebar: Stats & Actions) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="lg:sticky lg:top-6 space-y-6">
                        {/* Campaign High-Level Stats */}
                        <Card className="rounded-xl border bg-card shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white text-center">
                                <p className="text-xs font-medium text-gray-300 uppercase tracking-widest mb-2">Total Campaign Value</p>
                                <p className="text-3xl font-bold tracking-tight">₹{Number(lead.baseTotal).toLocaleString("en-IN")}</p>
                            </div>
                            <div className="grid grid-cols-2 divide-x divide-gray-100 border-b">
                                <div className="p-4 text-center">
                                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Total Locations</p>
                                    <p className="text-xl font-bold text-gray-900">{totalItems}</p>
                                </div>
                                <div className="p-4 text-center">
                                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Unique Cities</p>
                                    <p className="text-xl font-bold text-gray-900">{uniqueCities}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Avg. Price / Loc</span>
                                <span className="font-bold text-gray-900">₹{Math.round(avgPrice).toLocaleString("en-IN")}</span>
                            </div>
                        </Card>

                        {/* Discount Request Card */}
                        <DiscountCard
                            leadId={lead.id}
                            initialRequest={latestRequest}
                            baseTotal={Number(lead.baseTotal)}
                            finalTotal={Number(lead.finalTotal)}
                            discountAmount={Number(lead.discountAmount)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
