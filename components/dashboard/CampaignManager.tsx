
"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Trash, Check, MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

type InventoryItem = {
    id: number
    state: string
    city: string
    location: string
    netTotal: number
}

type CampaignItem = {
    id: number
    inventoryHoarding: InventoryItem
    total: number
}

type Props = {
    leadId: number
    initialItems: CampaignItem[]
}

export default function CampaignManager({ leadId, initialItems }: Props) {
    const router = useRouter()
    const [items, setItems] = useState<CampaignItem[]>(initialItems)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<InventoryItem[]>([])
    const [searching, setSearching] = useState(false)
    const [adding, setAdding] = useState<number | null>(null)
    const [removing, setRemoving] = useState<number | null>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // New state for hierarchical selection
    const [availableStates, setAvailableStates] = useState<string[]>([])
    const [selectedState, setSelectedState] = useState<string | null>(null)
    const [districtsInState, setDistrictsInState] = useState<{ district: string, count: number }[]>([])
    const [districtSearchQuery, setDistrictSearchQuery] = useState("")
    const [loadingStates, setLoadingStates] = useState(false)
    const [loadingDistricts, setLoadingDistricts] = useState(false)

    // Filter districts based on search query
    const filteredDistricts = districtsInState.filter(d =>
        d.district.toLowerCase().includes(districtSearchQuery.toLowerCase())
    )

    // Sync state with props when parent refreshes
    useEffect(() => {
        setItems(initialItems)
    }, [initialItems])

    // Load available states on mount
    useEffect(() => {
        loadStates()
    }, [])

    const loadStates = async () => {
        setLoadingStates(true)
        try {
            const res = await fetch('/api/inventory/states')
            const data = await res.json()
            setAvailableStates(data)
        } catch (error) {
            console.error('Error loading states:', error)
        } finally {
            setLoadingStates(false)
        }
    }

    const handleStateClick = async (state: string) => {
        if (selectedState === state) {
            // Toggle off
            setSelectedState(null)
            setDistrictsInState([])
            return
        }

        setSelectedState(state)
        setLoadingDistricts(true)
        try {
            const res = await fetch(`/api/inventory/districts?state=${encodeURIComponent(state)}`)
            const data = await res.json()
            setDistrictsInState(data)
        } catch (error) {
            console.error('Error loading districts:', error)
        } finally {
            setLoadingDistricts(false)
        }
    }

    const handleDistrictClick = async (district: string) => {
        setSearching(true)
        try {
            const res = await fetch(`/api/inventory?state=${encodeURIComponent(selectedState!)}&district=${encodeURIComponent(district)}`)
            const data = await res.json()
            setSearchResults(data)
            setIsMenuOpen(true)
        } catch (error) {
            console.error(error)
        } finally {
            setSearching(false)
        }
    }

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length > 2) {
                performSearch()
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const performSearch = async () => {
        setSearching(true)
        try {
            const res = await fetch(`/api/inventory?q=${searchQuery}`)
            const data = await res.json()
            setSearchResults(data)
            setIsMenuOpen(true)
        } catch (error) {
            console.error(error)
        } finally {
            setSearching(false)
        }
    }

    const addItem = async (invItem: InventoryItem) => {
        setAdding(invItem.id)
        try {
            const res = await fetch(`/api/leads/${leadId}/campaign-items`, {
                method: "POST",
                body: JSON.stringify({ inventoryId: invItem.id })
            })
            if (!res.ok) throw new Error("Failed")

            router.refresh()
            setTimeout(() => window.location.reload(), 500)
        } catch (error) {
            alert("Error adding item")
        } finally {
            setAdding(null)
            setIsMenuOpen(false)
            setSearchQuery("")
        }
    }

    const removeItem = async (itemId: number) => {
        setRemoving(itemId)
        try {
            const res = await fetch(`/api/leads/${leadId}/campaign-items?itemId=${itemId}`, {
                method: "DELETE"
            })
            if (!res.ok) throw new Error("Failed")

            setItems(prev => prev.filter(i => i.id !== itemId))
            router.refresh()
        } catch (error) {
            alert("Error removing item")
        } finally {
            setRemoving(null)
        }
    }

    // Filter out items already added from search results
    const availableResults = searchResults.filter(
        res => !items.some(existing => existing.inventoryHoarding.id === res.id)
    )

    const totalCost = items.reduce((sum, item) => sum + Number(item.total), 0)

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b pb-3">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Campaign / Inventory</h2>
                    <p className="text-xs text-gray-500">Manage locations effectively</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Total Inventory Cost</p>
                    <p className="text-xl font-bold text-green-600">₹{totalCost.toLocaleString("en-IN")}</p>
                </div>
            </div>

            {/* Search Box */}
            <div className="relative z-10">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by City, State or Location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => { if (searchResults.length > 0) setIsMenuOpen(true) }}
                        className="pl-9 h-9 text-sm shadow-sm"
                    />
                    {searching && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />}
                </div>

                {isMenuOpen && searchQuery.length > 2 && (
                    <div className="absolute top-full mt-1 w-full bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto ring-1 ring-black/5">
                        {availableResults.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-xs">No new locations found matching your query.</div>
                        ) : (
                            availableResults.map(res => (
                                <div key={res.id} className="p-2.5 hover:bg-blue-50/50 flex justify-between items-center border-b last:border-0 cursor-pointer transition-colors group" onClick={() => addItem(res)}>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm mb-0.5">{res.location}</p>
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                {res.city || 'No District'}
                                            </span>
                                            <span className="text-gray-400">•</span>
                                            <span>{res.state}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-700 text-sm">₹{Number(res.netTotal).toLocaleString("en-IN")}</span>
                                        <Button
                                            size="sm"
                                            disabled={adding === res.id}
                                            className="h-6 w-6 p-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm group-hover:scale-105 transition-all"
                                        >
                                            {adding === res.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* State Selection */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Browse by State</h3>
                    {loadingStates && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
                </div>

                <div className="flex flex-wrap gap-2">
                    {availableStates.map(state => (
                        <button
                            key={state}
                            onClick={() => handleStateClick(state)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedState === state
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {state}
                        </button>
                    ))}
                </div>

                {/* Districts in Selected State - Enhanced Card with Search */}
                {selectedState && (
                    <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Districts in {selectedState}
                                </h4>
                                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                                    {districtsInState.length} districts
                                </Badge>
                            </div>
                        </div>

                        {/* Search Box */}
                        <div className="p-3 bg-gray-50 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search districts..."
                                    value={districtSearchQuery}
                                    onChange={(e) => setDistrictSearchQuery(e.target.value)}
                                    className="pl-9 h-9 text-sm bg-white"
                                />
                            </div>
                        </div>

                        {/* District List - Scrollable */}
                        {loadingDistricts ? (
                            <div className="p-8 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            </div>
                        ) : (
                            <div className="max-h-80 overflow-y-auto">
                                {filteredDistricts.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 text-sm">
                                        No districts found matching "{districtSearchQuery}"
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {filteredDistricts.map(({ district, count }) => (
                                            <button
                                                key={district}
                                                onClick={() => handleDistrictClick(district)}
                                                className="w-full px-4 py-3 hover:bg-blue-50 text-left transition-colors group flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                                        <MapPin className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                                                            {district}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {count} location{count !== 1 ? 's' : ''} available
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Plus className="h-5 w-5" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Selected Items List */}
            <div className="space-y-3">
                <div className="flex justify-between items-end border-b border-gray-100 pb-1.5">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
                        Selected Inventory
                        <span className="bg-blue-100 text-blue-700 text-[10px] py-0.5 px-1.5 rounded-full font-bold">{items.length}</span>
                    </h3>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-2">
                            <MapPin className="h-4 w-4 text-gray-300" />
                        </div>
                        <h4 className="text-gray-900 font-medium text-sm mb-0.5">No locations selected</h4>
                        <p className="text-xs text-gray-500 max-w-xs mx-auto">Use the search bar above to add locations.</p>
                    </div>
                ) : (
                    <div className="grid gap-2 max-h-[420px] overflow-y-auto pr-2">
                        {items.map(item => (
                            <div key={item.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                                <div className="flex items-start gap-3 mb-2 sm:mb-0">
                                    <div className="mt-0.5 w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600 shadow-sm border border-blue-100">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-900 text-sm leading-tight max-w-sm">
                                            {(item.inventoryHoarding as any).outletName || (item.inventoryHoarding as any).name || (item.inventoryHoarding as any).locationName || item.inventoryHoarding.location}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                                            <span>{(item.inventoryHoarding as any).locationName || item.inventoryHoarding.location}</span>
                                            <span className="text-gray-300">•</span>
                                            <span>{item.inventoryHoarding.city}</span>
                                            <span className="text-gray-300">•</span>
                                            <Badge variant="secondary" className="h-4 px-1.5 font-normal bg-gray-100 text-gray-600 hover:bg-gray-200">
                                                {item.inventoryHoarding.state}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 pl-11 sm:pl-0 w-full sm:w-auto mt-1 sm:mt-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-dashed border-gray-100">
                                    <div className="text-right">
                                        {/* <p className="text-[10px] text-gray-400 uppercase font-medium mb-0">Price</p> */}
                                        <span className="font-bold text-gray-900 text-sm">₹{Number(item.total).toLocaleString("en-IN")}</span>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        disabled={removing === item.id}
                                        className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all ml-1"
                                        title="Remove location"
                                    >
                                        {removing === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash className="h-3 w-3" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Overlay to close menu when clicking outside */}
            {isMenuOpen && <div className="fixed inset-0 z-0" onClick={() => setIsMenuOpen(false)}></div>}
        </div>
    )
}
