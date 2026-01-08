import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, Target, Layout, Monitor } from "lucide-react";

// Added icons for extra visual flair alongside images
const services = [
    {
        title: "Fuel Stations Media",
        description: "Engage vehicle owners with high-impact product sampling and branding at premium fuel stations across India.",
        image: "/images/services/fuel-station.jpg",
        link: "/services/fuel-stations-media",
        icon: <Zap className="w-5 h-5" />
    },
    {
        title: "BTL / ATL Activations",
        description: "Integrated marketing campaigns designed for mass reach (ATL) and direct consumer engagement (BTL).",
        image: "/images/services/btl-atl.jpg",
        link: "/services/btl-atl",
        icon: <Target className="w-5 h-5" />
    },
    {
        title: "Display Space",
        description: "Secure premium advertising spaces in high-traffic locations for maximum brand visibility and recall.",
        image: "/images/services/display-space.jpg",
        link: "/services/display-space",
        icon: <Monitor className="w-5 h-5" />
    },
    {
        title: "Pillar Branding",
        description: "Transform urban pillars into powerful branding canvases that capture attention in key city areas.",
        image: "/images/services/pillar-branding.jpg",
        link: "/services/pillar-branding",
        icon: <Layout className="w-5 h-5" />
    }
];

export default function ServicesSection() {
    return (
        <section className="py-24 bg-gray-50 text-gray-900 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-3 block">What We Do</span>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        Our Specialized Services
                    </h2>
                    <p className="text-lg text-gray-500 font-light">
                        Comprehensive OOH and media solutions tailored for maximum impact.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <Link
                            href={service.link}
                            key={index}
                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 flex flex-col"
                        >
                            <div className="relative h-56 w-full overflow-hidden">
                                <Image
                                    src={service.image}
                                    alt={service.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
                                <div className="absolute bottom-4 left-4 text-white flex items-center gap-2">
                                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                                        {service.icon}
                                    </div>
                                    <span className="font-semibold">{service.title}</span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <p className="text-gray-600 font-light text-sm leading-relaxed mb-6 flex-grow">
                                    {service.description}
                                </p>
                                <span className="inline-flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
