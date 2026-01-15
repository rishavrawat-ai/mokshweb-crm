
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import ClientsSection from "@/components/ClientsSection";
import WorkSkillsSection from "@/components/WorkSkillsSection";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-white min-h-screen relative overflow-hidden">
      {/* Hero Section */}
      {/* Full Screen Video Section */}
      <section className="relative w-full h-screen overflow-hidden bg-black">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/videos/Black.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </section>

      {/* Hero Content Section */}
      <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 bg-[#002147] text-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-50"></div>
          <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Content */}
            <div className="space-y-8 animate-fade-in-up flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/50 text-blue-200 text-xs font-medium uppercase tracking-wider backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Leading OOH Media Agency
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight text-white">
                Strategic Media. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                  Lasting Impact.
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-200 max-w-2xl leading-relaxed font-light">
                Empowering brands through innovative Petrol Pump OOH campaigns and powerful media solutions across India.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                <Link
                  href="/petrolpump-media"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-lg transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  Start Campaign <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/case-study"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm text-white rounded-lg font-medium text-lg transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" /> View Case Studies
                </Link>
              </div>

              <div className="pt-8 flex items-center gap-8 text-sm text-gray-300 justify-center">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-white">2000+</span>
                  <span>Hoardings</span>
                </div>
                <div className="h-8 w-px bg-white/20"></div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-white">100+</span>
                  <span>Cities</span>
                </div>
                <div className="h-8 w-px bg-white/20"></div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-white">99%</span>
                  <span>Satisfaction</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <ServicesSection />

      {/* About Section */}
      <AboutSection />

      {/* Clients Section */}
      <ClientsSection />

      {/* Work Skills Section */}
      <WorkSkillsSection />

      {/* WhatsApp Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <a
          href="https://wa.me/919643316767"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform hover:shadow-xl cursor-pointer ring-4 ring-white/20"
          aria-label="Chat on WhatsApp"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="currentColor"
            className="text-white"
            viewBox="0 0 16 16"
          >
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
          </svg>
        </a>
      </div>
    </main>
  );
}
