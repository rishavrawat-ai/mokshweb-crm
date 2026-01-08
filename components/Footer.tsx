import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-[#00152e] text-white pt-20 pb-10 border-t border-white/5 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Column 1: Logo & Info */}
                    <div className="space-y-6">
                        <div className="bg-white p-3 rounded-lg w-fit transition-transform hover:scale-105">
                            <Image
                                src="/images/logo.png"
                                alt="Moksh Promotion Limited"
                                width={160}
                                height={55}
                                className="h-10 w-auto object-contain"
                            />
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            Empowering brands through innovative OOH campaigns and powerful media solutions across India.
                        </p>

                        <div className="space-y-4 pt-2">
                            <a href="tel:+919643316767" className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors group">
                                <div className="p-2 bg-white/5 rounded-full group-hover:bg-blue-600 transition-colors">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <span>+91 9643316767</span>
                            </a>
                            <a href="mailto:info@mokshpromotion.com" className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors group">
                                <div className="p-2 bg-white/5 rounded-full group-hover:bg-blue-600 transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span>info@mokshpromotion.com</span>
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Menu */}
                    <div>
                        <h3 className="text-sm font-bold mb-6 uppercase tracking-widest text-blue-400">Explore</h3>
                        <ul className="space-y-4">
                            {[
                                { name: "Home", path: "/" },
                                { name: "PetrolPump Media", path: "/petrolpump-media" },
                                { name: "Our Services", path: "/services" },
                                { name: "Case Studies", path: "/case-study" },
                                { name: "Latest Blog", path: "/blog" }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.path} className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                        <span className="group-hover:translate-x-1 transition-transform">{item.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Legal */}
                    <div>
                        <h3 className="text-sm font-bold mb-6 uppercase tracking-widest text-blue-400">Legal</h3>
                        <ul className="space-y-4">
                            {["About Us", "Terms & Conditions", "Privacy Policy", "Contact Support"].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm hover:underline decoration-blue-500 decoration-2 underline-offset-4">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div>
                        <h3 className="text-sm font-bold mb-6 uppercase tracking-widest text-blue-400">Stay Updated</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Subscribe to our newsletter for the latest updates and media insights.
                        </p>
                        <form className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white/5 border border-white/10 rounded-md px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                                Subscribe <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>

                        <div className="mt-8 flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                                <Link key={idx} href="#" className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-blue-600 transition-all">
                                    <Icon className="w-4 h-4" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm text-center md:text-left">
                        &copy; {new Date().getFullYear()} Moksh Promotion Limited. All Rights Reserved.
                    </p>
                    <div className="flex gap-6 text-xs text-gray-500">
                        <Link href="#" className="hover:text-blue-400 transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-blue-400 transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-blue-400 transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
