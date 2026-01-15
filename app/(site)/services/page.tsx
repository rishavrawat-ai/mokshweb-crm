import CartFooter from "@/components/CartFooter"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function ServicesPage() {
    const services = [
        {
            title: "Fuel Station Media",
            description: "High-visibility advertising at premium fuel stations across the region.",
            link: "/petrolpump-media"
        },
        {
            title: "BTL / ATL",
            description: "Integrated marketing strategies combining broad reach and targeted engagement.",
            link: "/services/btl-atl"
        },
        {
            title: "Display Space",
            description: "Prime locations for static and digital displays to capture attention.",
            link: "/services/display-space"
        },
        {
            title: "Brandings",
            description: "Creative branding solutions to elevate your corporate identity.",
            link: "/services/brandings"
        }
    ]

    return (
        <main className="min-h-screen bg-[#032D52] py-20 pb-24 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                <h1 className="text-4xl font-bold mb-4">Our Services</h1>
                <p className="text-xl text-gray-300 mb-12 max-w-3xl">
                    Discover our wide range of promotional and media solutions designed to help your business grow.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {services.map((service) => (
                        <Link
                            key={service.title}
                            href={service.link}
                            className="bg-[#002147] p-8 rounded-xl border border-white/10 hover:border-white/30 hover:bg-[#002a5c] transition-all group"
                        >
                            <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-300 transition-colors">
                                {service.title}
                            </h2>
                            <p className="text-gray-400 mb-6">
                                {service.description}
                            </p>
                            <span className="flex items-center gap-2 text-sm font-medium text-blue-400 group-hover:text-blue-300">
                                Learn More <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
            <CartFooter />
        </main>
    )
}
