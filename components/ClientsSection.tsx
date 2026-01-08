import Image from "next/image";

const clients = [
    { name: "Bank of Maharashtra", logo: "/images/clients/bank.png" },
    { name: "Cars24", logo: "/images/clients/cars24.webp" },
    { name: "SBI", logo: "/images/clients/sbi.png" },
    { name: "PNB", logo: "/images/clients/pnb.png" },
    { name: "Raymond", logo: "/images/clients/raymond.png" },
];

export default function ClientsSection() {
    return (
        <section className="py-24 bg-white text-gray-900 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
                <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-3 block">Trusted Partners</span>
                <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-6">
                    Powering Leading Brands
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
                    We take pride in our long-standing relationships with industry leaders across Banking, Retail, and Automobile sectors.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Logo Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 mb-24">
                    {clients.map((client, index) => (
                        <div key={index} className="group bg-white border border-gray-100 rounded-xl p-8 flex items-center justify-center hover:shadow-lg hover:border-blue-100 transition-all duration-300">
                            <div className="relative w-full h-16 opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                                <Image
                                    src={client.logo}
                                    alt={client.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats Section */}
                <div className="bg-[#002147] rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#FFFFFF" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.4C93.5,8.4,82.2,21.1,70.6,31.4C59,41.7,47.1,49.6,35.4,56.7C23.7,63.8,12.2,70.1,0.2,69.7C-11.8,69.3,-24.5,62.2,-37.2,55.4C-49.9,48.6,-62.6,42.1,-71.4,32.2C-80.2,22.3,-85.1,9,-82.7,-3.1C-80.3,-15.2,-70.6,-26.1,-60.7,-35.5C-50.8,-44.9,-40.7,-52.8,-29.9,-61.8C-19.1,-70.8,-7.6,-80.9,4.9,-89.4C17.4,-97.9,30.5,-101.9,44.7,-76.4Z" transform="translate(100 100)" />
                        </svg>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative z-10">
                        <div className="space-y-2">
                            <h3 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-200">95%</h3>
                            <p className="font-medium text-blue-200 uppercase tracking-widest text-sm">Client Satisfaction</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-200">120+</h3>
                            <p className="font-medium text-blue-200 uppercase tracking-widest text-sm">Campaigns Delivered</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-200">3x</h3>
                            <p className="font-medium text-blue-200 uppercase tracking-widest text-sm">Average ROI Growth</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
