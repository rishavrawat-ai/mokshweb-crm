import Image from "next/image";
import { BarChart3, Target, Layout, Wallet } from "lucide-react";

export default function WorkSkillsSection() {
    return (
        <section className="py-20 bg-[#002147] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center mb-6">
                    <span className="bg-[#1e3a8a] text-white px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm shadow-lg">
                        Work Skills
                    </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 max-w-3xl mx-auto">
                    Boost your brand with performance-based reach
                </h2>

                <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* Left Content - Skills List */}
                    <div className="flex-1 space-y-12">
                        {[
                            {
                                icon: <BarChart3 className="w-8 h-8" />,
                                title: "Performance Tracking & Optimization",
                                description: "We gather feedback and analyze campaign performance data to refine our strategies, ensuring continuous improvement and higher ROI for every client"
                            },
                            {
                                icon: <Target className="w-8 h-8" />,
                                title: "Strategic Planning",
                                description: "We craft targeted marketing strategies grounded in data-driven insights, ensuring every campaign achieves its objectives with precision and impact."
                            },
                            {
                                icon: <Layout className="w-8 h-8" />,
                                title: "Integrated Campaign Management",
                                description: "From design to deployment, we manage end-to-end hoarding campaigns to ensure consistent brand messaging and timely execution across all locations."
                            },
                            {
                                icon: <Wallet className="w-8 h-8" />,
                                title: "Cost-Effective Brand Visibility",
                                description: "Petrol pump hoardings offer prolonged exposure at a fraction of traditional advertising costs, making them a smart investment for sustained brand recall."
                            }
                        ].map((skill, index) => (
                            <div key={index} className="flex gap-6">
                                <div className="flex-shrink-0 w-16 h-16 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#002147] transition-all duration-300">
                                    {skill.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-3">{skill.title}</h3>
                                    <p className="text-gray-300 font-light leading-relaxed text-sm pr-4">
                                        {skill.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Image/Illustration */}
                    <div className="flex-1 w-full flex justify-end">
                        <div className="relative w-full max-w-lg aspect-[4/5] bg-blue-900/20 rounded-2xl overflow-hidden p-8">
                            <Image
                                src="/images/general/work-skills.jpg"
                                alt="Work Skills Illustration"
                                fill
                                className="object-contain" // Using contain as it looks like an illustration
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
