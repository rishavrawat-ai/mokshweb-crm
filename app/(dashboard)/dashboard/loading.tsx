
export default function Loading() {
    return (
        <div className="flex h-full w-full items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                <p className="text-sm font-medium text-gray-500 animate-pulse">Loading...</p>
            </div>
        </div>
    )
}
