
"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface StateCityGridProps {
    data: Record<string, string[]>
}

export default function StateCityGrid({ data }: StateCityGridProps) {
    // Sort states alphabetically
    const sortedStates = Object.keys(data).sort()

    // State to track which state is expanded
    const [expandedState, setExpandedState] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    const toggleState = (state: string) => {
        if (expandedState === state) {
            setExpandedState(null)
        } else {
            setExpandedState(state)
            setSearchQuery("") // Reset search when opening a new state
        }
    }

    // Filter cities based on search query
    const getFilteredCities = (state: string) => {
        if (!searchQuery) return data[state]
        return data[state].filter(city =>
            city.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-white mb-12 uppercase tracking-wide">States</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sortedStates.map((state) => (
                    <div key={state} className="bg-white rounded-lg overflow-hidden shadow-lg h-fit border border-gray-100">
                        {/* State Header */}
                        <button
                            onClick={() => toggleState(state)}
                            className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-all font-bold text-[#032D52] hover:bg-blue-50
                                ${expandedState === state ? 'bg-blue-50 border-b border-blue-100' : 'bg-white'}`}
                        >
                            <span className="text-sm uppercase tracking-wide">{state}</span>
                            <span className={`text-blue-600 transition-transform duration-300 ${expandedState === state ? 'rotate-180' : ''}`}>
                                {expandedState === state ? <Minus size={18} /> : <Plus size={18} />}
                            </span>
                        </button>

                        {/* City List (Accordion Content) */}
                        <AnimatePresence>
                            {expandedState === state && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-[#0f3456]"
                                >
                                    {/* Search Box */}
                                    <div className="p-3 bg-[#0a2540] border-b border-[#1a456e]">
                                        <input
                                            type="text"
                                            placeholder={`Search in ${state}...`}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full px-3 py-1.5 text-sm bg-[#1a456e] text-white placeholder-blue-300 rounded border border-transparent focus:border-blue-400 focus:outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Scrollable List */}
                                    <div className="flex flex-col max-h-60 overflow-y-auto custom-scrollbar">
                                        {getFilteredCities(state).length === 0 ? (
                                            <div className="px-4 py-6 text-center text-blue-300 text-sm">
                                                No matches found
                                            </div>
                                        ) : (
                                            getFilteredCities(state).map((city) => (
                                                <Link
                                                    key={`${state}-${city}`}
                                                    href={`/petrolpump-media/${encodeURIComponent(city)}`}
                                                    className="block px-4 py-2.5 text-sm font-medium text-gray-100 border-b border-[#1a456e] last:border-0 hover:bg-blue-600 hover:text-white transition-colors"
                                                >
                                                    {city}
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    )
}
