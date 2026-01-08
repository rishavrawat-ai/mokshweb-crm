"use client"

import { useState } from "react"
import Papa from "papaparse"
import readXlsxFile from 'read-excel-file'
import { useRouter } from "next/navigation"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Trash2, Download } from "lucide-react"

export default function InventoryUploader() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const postData = async (data: any[]) => {
        try {
            const response = await fetch("/api/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data }),
            })

            if (!response.ok) {
                throw new Error("Failed to import data")
            }

            const resData = await response.json()
            setSuccess(`Successfully imported ${resData.count} items.`)
            router.refresh()
        } catch (err) {
            setError("Failed to upload inventory. Please check the file format.")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.target
        const file = target.files?.[0]
        if (!file) return

        setLoading(true)
        setError("")
        setSuccess("")

        const fileExt = file.name.split('.').pop()?.toLowerCase()

        if (fileExt === 'xlsx' || fileExt === 'xls') {
            try {
                // First, get list of sheets
                const sheets = await readXlsxFile(file, { getSheets: true } as any) as unknown as any[]
                let allData: any[] = []

                for (const sheet of sheets) {
                    // Read each sheet
                    const rows = await readXlsxFile(file, { sheet: sheet.name })

                    if (rows.length < 2) continue // Skip empty sheets

                    const headers = rows[0] as string[]
                    const sheetData = rows.slice(1).map(row => {
                        const obj: any = {}
                        headers.forEach((header, index) => {
                            obj[header] = row[index]
                        })
                        return obj
                    })
                    allData = [...allData, ...sheetData]
                }

                if (allData.length === 0) {
                    throw new Error("No valid data found in any sheet")
                }

                await postData(allData)
            } catch (err: any) {
                setError("Error parsing Excel file: " + err.message)
                setLoading(false)
            }
        } else {
            // CSV Fallback
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    await postData(results.data)
                },
                error: (err) => {
                    setError("Error parsing CSV file: " + err.message)
                    setLoading(false)
                }
            })
        }

        // Reset input so same file can be selected again
        target.value = ""
    }

    const handleClearData = async () => {
        if (!confirm("Are you sure you want to DELETE ALL inventory data? This cannot be undone.")) return

        setLoading(true)
        setError("")
        setSuccess("")

        try {
            const response = await fetch("/api/inventory", {
                method: "DELETE",
            })

            if (!response.ok) throw new Error("Failed to delete data")

            setSuccess("All inventory data deleted successfully. Page will refresh...")
            // Force reload to clear all states
            window.location.reload()
        } catch (err) {
            setError("Failed to clear inventory.")
            console.error(err)
            setLoading(false)
        }
    }

    const handleExportData = async () => {
        setLoading(true)
        setError("")
        setSuccess("")
        try {
            const response = await fetch("/api/inventory")
            if (!response.ok) throw new Error("Failed to fetch data")

            const data = await response.json()
            const csv = Papa.unparse(data)

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'inventory_export.csv')
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            setSuccess("Inventory exported successfully.")
        } catch (err) {
            setError("Failed to export inventory.")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                Inventory Management
            </h3>

            <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                    <input
                        type="file"
                        accept=".csv, .xlsx, .xls"
                        onChange={handleFileUpload}
                        disabled={loading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col items-center justify-center space-y-2">
                        {loading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        ) : (
                            <Upload className="w-8 h-8 text-gray-400" />
                        )}
                        <p className="text-sm text-gray-500">
                            {loading ? "Processing..." : "Click or drag CSV/Excel file to Import"}
                        </p>
                        <p className="text-xs text-gray-400">
                            Supports .csv, .xlsx, .xls
                        </p>
                    </div>
                </div>

                {/* Actions Row */}
                <div className="flex gap-4 pt-2">
                    <button
                        onClick={handleExportData}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button
                        onClick={handleClearData}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete All Data
                    </button>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded">
                        <CheckCircle className="w-4 h-4" />
                        {success}
                    </div>
                )}
            </div>
        </div>
    )
}
