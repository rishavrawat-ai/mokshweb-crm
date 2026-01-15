import CartFooter from "@/components/CartFooter"

export default function DisplaySpacePage() {
    return (
        <main className="min-h-screen bg-[#032D52] py-20 pb-24 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                <h1 className="text-4xl font-bold mb-6">Display Space</h1>
                <p className="text-xl text-gray-300 mb-8">
                    Premium display spaces strategically located to maximize your brand's visibility.
                </p>
                <div className="bg-[#002147] p-8 rounded-lg border border-white/10">
                    <p className="text-gray-400">Inventory and location details coming soon.</p>
                </div>
            </div>
            <CartFooter />
        </main>
    )
}
