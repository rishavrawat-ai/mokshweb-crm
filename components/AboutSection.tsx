import Image from "next/image";
import { CheckCircle2, TrendingUp, MapPin } from "lucide-react";

export default function AboutSection() {
    return (
        <section className="py-24 bg-white text-gray-900 border-b border-gray-100 overflow-hidden relative">
            {/* Background Texture */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-100 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    {/* Left Image Area */}
                    <div className="flex-1 w-full order-2 lg:order-1 relative flex justify-center lg:justify-end pr-0 lg:pr-8">
                        <div className="relative w-full max-w-lg">
                            {/* Main Image */}
                            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border-[8px] border-white z-10 bg-white">
                                <Image
                                    src="/images/petrol-pump-demo.png"
                                    alt="Moksh Promotions Office"
                                    fill
                                    className="object-cover hover:scale-110 transition-transform duration-1000"
                                />
                            </div>

                            {/* Decorative Floating Card 1 */}
                            <div className="absolute -top-8 -left-8 md:-left-12 bg-white p-4 rounded-2xl shadow-xl z-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 hidden sm:block">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Growth</p>
                                        <p className="text-xl font-bold text-gray-900">10x ROI</p>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Floating Card 2 */}
                            <div className="absolute -bottom-8 -right-8 md:-right-12 bg-white p-4 rounded-2xl shadow-xl z-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 hidden sm:block">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-50 p-3 rounded-xl text-green-600">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Locations</p>
                                        <p className="text-xl font-bold text-gray-900">Pan India</p>
                                    </div>
                                </div>
                            </div>

                            {/* Dot Pattern Graphic behind */}
                            <div className="absolute -z-10 -bottom-10 -left-10 opacity-20">
                                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <pattern id="dot-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                        <circle cx="2" cy="2" r="2" className="text-blue-600" fill="currentColor" />
                                    </pattern>
                                    <rect width="100" height="100" fill="url(#dot-pattern)" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Right Text */}
                    <div className="flex-1 space-y-8 order-1 lg:order-2">
                        <div>
                            <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-2 block">Who We Are</span>
                            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                                Leading Media Brand Solutions
                            </h2>
                        </div>

                        <div className="space-y-6 text-gray-600 text-lg leading-relaxed font-light">
                            <p>
                                <strong className="text-gray-900 font-medium">Moksh Promotion Limited</strong> is a premier Media solution company with a commanding presence in Delhi, Mumbai, and Bangalore. We specialize in decoding client needs to deliver tailor-made solutions that exceed expectations.
                            </p>
                            <p>
                                We believe in creating impactful brand experiences through strategic media planning. With a proven track record, we maintain strong relationships with top corporates, MNCs, and the <span className="text-blue-600 font-medium">Petroleum Sector</span> across India.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            {[
                                "Pan-India Presence",
                                "Strategic Planning",
                                "Petroleum Sector Experts",
                                "Data-Driven Results"
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-1 rounded-full text-blue-600">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <span className="text-gray-700 font-medium text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
