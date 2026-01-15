import CartFooter from "@/components/CartFooter"

export default function BtlAtlPage() {
    return (
        <main className="min-h-screen bg-[#032D52] py-20 pb-24 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                <h1 className="text-4xl font-bold mb-6">BTL / ATL Services</h1>
                <p className="text-xl text-gray-300 mb-8">
                    Comprehensive Below-The-Line and Above-The-Line marketing solutions tailored for your brand's growth.
                </p>
                <div className="bg-[#002147] p-8 rounded-lg border border-white/10">
                    <p className="text-gray-400">Detailed service offerings and packages will be available shortly.</p>
                </div>
            </div>
            <CartFooter />
        </main>
    )
}
