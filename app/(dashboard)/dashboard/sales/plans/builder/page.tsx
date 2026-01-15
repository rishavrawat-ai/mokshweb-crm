"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Trash2, ArrowRight, Loader2 } from "lucide-react"

export default function PlanBuilderPage() {
    const router = useRouter()

    // Inventory State
    const [states, setStates] = useState<string[]>([])
    const [districts, setDistricts] = useState<string[]>([])

    const [selectedState, setSelectedState] = useState("")
    const [selectedDistricts, setSelectedDistricts] = useState<string[]>([])
    const [keyword, setKeyword] = useState("")

    const [searchResults, setSearchResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)

    // Plan State
    const [selectedItems, setSelectedItems] = useState<any[]>([])

    // Pricing State
    const [discountType, setDiscountType] = useState<"PERCENT" | "FLAT">("PERCENT")
    const [discountValue, setDiscountValue] = useState(0)

    // Client State
    const [clientDetails, setClientDetails] = useState({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        notes: ""
    })

    const [submitting, setSubmitting] = useState(false)


    // Initial Fetch
    useEffect(() => {
        fetch("/api/locations?type=states")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setStates(data)
            })
            .catch(err => console.error(err))
    }, [])

    // Fetch Districts when State changes
    useEffect(() => {
        if (!selectedState) {
            setDistricts([])
            setSelectedDistricts([])
            return
        }
        fetch(`/api/locations?type=districts&state=${encodeURIComponent(selectedState)}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setDistricts(data)
            })
            .catch(err => console.error(err))
    }, [selectedState])

    // Auto-search when filters change
    useEffect(() => {
        if (selectedState || selectedDistricts.length > 0) {
            handleSearch()
        }
    }, [selectedState, selectedDistricts])

    // --- Search Logic ---
    const handleSearch = async () => {
        if (!selectedState && !keyword) return

        setSearching(true)
        try {
            const params = new URLSearchParams()
            if (selectedState) params.append("state", selectedState)
            if (selectedDistricts.length > 0) params.append("districts", selectedDistricts.join(","))
            if (keyword) params.append("search", keyword)

            const res = await fetch(`/api/inventory?${params.toString()}`)
            const data = await res.json()
            if (Array.isArray(data)) {
                setSearchResults(data)
            } else if (data.items && Array.isArray(data.items)) {
                setSearchResults(data.items)
            } else {
                setSearchResults([])
            }
        } catch (e) {
            console.error(e)
            setSearchResults([])
        } finally {
            setSearching(false)
        }
    }

    const toggleDistrict = (d: string) => {
        if (selectedDistricts.includes(d)) {
            setSelectedDistricts(selectedDistricts.filter(id => id !== d))
        } else {
            setSelectedDistricts([...selectedDistricts, d])
        }
    }

    const toggleAllDistricts = () => {
        if (selectedDistricts.length === districts.length) {
            setSelectedDistricts([])
        } else {
            setSelectedDistricts([...districts])
        }
    }

    // --- Cart Logic ---
    const addItem = (item: any) => {
        if (selectedItems.find(i => i.id === item.id)) return
        setSelectedItems([...selectedItems, { ...item, qty: 1 }])
    }

    const removeItem = (id: any) => {
        setSelectedItems(selectedItems.filter(i => i.id !== id))
    }

    const addAllResults = () => {
        // Filter out items already selected to avoid duplicates
        const newItems = searchResults.filter(item => !selectedItems.find(i => i.id === item.id))
        if (newItems.length === 0) return
        setSelectedItems([...selectedItems, ...newItems.map(i => ({ ...i, qty: 1 }))])
    }

    // --- Calculation Logic ---
    const calculateTotals = () => {
        const baseTotal = selectedItems.reduce((acc, item) => acc + (Number(item.netTotal) || 0), 0)

        let discountAmount = 0
        if (discountType === "PERCENT") {
            discountAmount = (baseTotal * discountValue) / 100
        } else {
            discountAmount = discountValue
        }

        const finalTotal = Math.max(0, baseTotal - discountAmount)

        return { baseTotal, discountAmount, finalTotal }
    }

    const { baseTotal, discountAmount, finalTotal } = calculateTotals()

    // --- Submit Logic ---
    const handleSubmit = async () => {
        if (!selectedItems.length) return alert("Select at least one item")
        if (!clientDetails.clientName || !clientDetails.clientEmail) return alert("Client Name and Email required")

        setSubmitting(true)
        try {
            const res = await fetch("/api/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: selectedItems,
                    baseTotal,
                    discountType,
                    discountValue,
                    finalTotal,
                    ...clientDetails
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            router.push(`/dashboard/sales/plans/${data.planId}`)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden">
            {/* Left: Inventory Selection */}
            <div className="w-1/2 p-4 border-r flex flex-col bg-gray-50/50">
                <h2 className="text-xl font-bold mb-4">1. Find Inventory</h2>

                {/* Filters */}
                <div className="bg-white p-4 rounded border shadow-sm mb-4 space-y-4">
                    {/* State Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Select State</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                        >
                            <option value="">-- Choose State --</option>
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* District Selector */}
                    {selectedState && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-semibold text-gray-500 uppercase">
                                    Select Districts ({selectedDistricts.length}/{districts.length})
                                </label>
                                <button
                                    onClick={toggleAllDistricts}
                                    className="text-xs text-blue-600 hover:underline font-medium"
                                >
                                    {selectedDistricts.length === districts.length ? "Deselect All" : "Select All"}
                                </button>
                            </div>

                            <div className="border rounded h-32 overflow-y-auto p-2 bg-gray-50 grid grid-cols-2 gap-2">
                                {districts.map(d => (
                                    <label key={d} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white p-1 rounded">
                                        <input
                                            type="checkbox"
                                            checked={selectedDistricts.includes(d)}
                                            onChange={() => toggleDistrict(d)}
                                            className="rounded text-blue-600"
                                        />
                                        <span className="truncate" title={d}>{d}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Keyword Search */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Or Keyword Search</label>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 p-2 border rounded text-sm"
                                placeholder="Search location, outlet name..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button
                                onClick={handleSearch}
                                className="bg-blue-600 text-white px-6 py-2 rounded font-medium flex items-center gap-2 hover:bg-blue-700"
                                disabled={searching}
                            >
                                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Header */}
                <div className="flex justify-between items-end mb-2 px-1">
                    <h3 className="font-semibold text-sm text-gray-500">
                        RESULTS ({searchResults.length})
                    </h3>
                    {searchResults.length > 0 && (
                        <button
                            onClick={addAllResults}
                            className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200 hover:bg-green-100 flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" /> Add All Results
                        </button>
                    )}
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto border rounded bg-white p-2">
                    {searchResults.length === 0 ? (
                        <div className="text-center text-gray-500 py-10 flex flex-col items-center justify-center h-full">
                            {searching ? (
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                            ) : (
                                <>
                                    <Search className="w-8 h-8 text-gray-300 mb-2" />
                                    <p className="text-sm">Select filters and search to find inventory</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {searchResults.map((item) => {
                                const isSelected = selectedItems.find(i => i.id === item.id)
                                return (
                                    <div key={item.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50 transition group">
                                        <div className="flex-1 min-w-0 mr-2">
                                            <div className="font-semibold truncate text-gray-900" title={item.outletName || item.name}>
                                                {item.outletName || item.name}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                                <span className="font-medium text-gray-700">{item.city || item.district}</span>
                                                <span>•</span>
                                                <span title={item.locationName || item.location}>{item.locationName || item.location}</span>
                                            </div>
                                            <div className="text-sm font-medium text-blue-600 mt-1">₹{Number(item.netTotal).toLocaleString('en-IN')}</div>
                                        </div>
                                        <button
                                            onClick={() => addItem(item)}
                                            disabled={!!isSelected}
                                            className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wide transition-colors ${isSelected
                                                ? 'bg-green-100 text-green-700 cursor-default'
                                                : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'
                                                }`}
                                        >
                                            {isSelected ? 'Added' : 'Add +'}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Plan Summary */}
            <div className="w-1/2 p-6 flex flex-col bg-white">
                <h2 className="text-xl font-bold mb-4">2. Plan Summary</h2>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto mb-4 border rounded p-4 bg-gray-50">
                    <h3 className="font-semibold text-sm text-gray-500 mb-2">SELECTED ITEMS ({selectedItems.length})</h3>
                    {selectedItems.length === 0 ? (
                        <div className="text-sm text-gray-400 italic">No items selected yet.</div>
                    ) : (
                        <div className="space-y-2">
                            {selectedItems.map((item) => (
                                <div key={item.id} className="flex justify-between items-center bg-white p-2 border rounded shadow-sm">
                                    <div className="text-sm truncate max-w-[200px]">{item.outletName || item.name}</div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium">₹{Number(item.netTotal).toLocaleString()}</span>
                                        <button onClick={() => removeItem(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pricing & Client */}
                <div className="border-t pt-4 space-y-4">

                    {/* Discount Controls */}
                    <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded border border-blue-100">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">DISCOUNT TYPE</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDiscountType("PERCENT")}
                                    className={`flex-1 py-1 text-sm rounded border ${discountType === 'PERCENT' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}
                                >
                                    % Percent
                                </button>
                                <button
                                    onClick={() => setDiscountType("FLAT")}
                                    className={`flex-1 py-1 text-sm rounded border ${discountType === 'FLAT' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}
                                >
                                    ₹ Flat
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">VALUE</label>
                            <input
                                type="number"
                                value={discountValue}
                                onChange={(e) => setDiscountValue(Number(e.target.value))}
                                className="w-full p-1.5 border rounded"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 p-4 bg-gray-100 rounded">
                        <div className="flex justify-between text-sm">
                            <span>Base Total</span>
                            <span>₹{baseTotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-red-600">
                            <span>Discount</span>
                            <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                            <span>Final Total</span>
                            <span className="text-blue-700">₹{finalTotal.toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    {/* Client Details */}
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            placeholder="Client Name *"
                            className="border p-2 rounded text-sm"
                            value={clientDetails.clientName}
                            onChange={e => setClientDetails({ ...clientDetails, clientName: e.target.value })}
                        />
                        <input
                            placeholder="Client Email *"
                            className="border p-2 rounded text-sm"
                            value={clientDetails.clientEmail}
                            onChange={e => setClientDetails({ ...clientDetails, clientEmail: e.target.value })}
                        />
                        <input
                            placeholder="Phone (Optional)"
                            className="border p-2 rounded text-sm"
                            value={clientDetails.clientPhone}
                            onChange={e => setClientDetails({ ...clientDetails, clientPhone: e.target.value })}
                        />
                        <input
                            placeholder="Notes..."
                            className="border p-2 rounded text-sm"
                            value={clientDetails.notes}
                            onChange={e => setClientDetails({ ...clientDetails, notes: e.target.value })}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting || selectedItems.length === 0}
                        className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                        Create Plan & Proceed
                    </button>

                </div>
            </div>
        </div>
    )
}
