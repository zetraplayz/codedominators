import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-base-bg)] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background decorations */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--color-base-mint)] opacity-50 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[var(--color-base-yellow)] opacity-40 blur-[100px] pointer-events-none"></div>

      <div className="z-10 w-full max-w-6xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* Left Content */}
        <div className="flex-1 flex flex-col items-start text-left max-w-2xl">
          <div className="flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-[var(--color-base-mint)] shadow-clay-btn border border-white/40">
            <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-bold tracking-wide text-[var(--color-base-text)]">MESH AI IS ONLINE</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-[var(--color-base-text)] leading-[1.1] mb-6">
            Intelligent <br />
            Resource Hub <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6a716e] to-[#9ba39f]">for Faculty.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[var(--color-base-text)] opacity-80 font-medium mb-10 max-w-xl leading-relaxed">
            Connect Plus unifies department resources, teaching kits, and approval workflows into a single, AI-powered workspace. Built exclusively for HODs and Staff.
          </p>

          <Link href="/login" className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-btn hover:shadow-clay-pressed text-[var(--color-base-text)] font-bold text-lg transition-all duration-300">
            Access Dashboard
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
        </div>

        {/* Right Content - Feature Cards */}
        <div className="flex-1 w-full max-w-md relative perspective-1000">
          <div className="grid grid-cols-1 gap-6 relative z-10">
            
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-[var(--color-base-bg)] shadow-clay-card border border-white/60 flex items-start gap-4 transform transition-all duration-500 hover:-translate-y-1 hover:shadow-clay-btn">
              <div className="p-3 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-btn">
                <BookOpen size={24} className="text-[var(--color-base-text)]" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--color-base-text)] text-lg">Centralized Vault</h3>
                <p className="text-[var(--color-base-text)] opacity-70 text-sm font-medium mt-1">Organize lecture notes, lab manuals, and question banks securely.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-[var(--color-base-bg)] shadow-clay-card border border-white/60 flex items-start gap-4 transform transition-all duration-500 hover:-translate-y-1 hover:shadow-clay-btn ml-8">
              <div className="p-3 rounded-2xl bg-[var(--color-base-yellow)] shadow-clay-btn">
                <ShieldCheck size={24} className="text-[var(--color-base-text)]" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--color-base-text)] text-lg">HOD Approvals</h3>
                <p className="text-[var(--color-base-text)] opacity-70 text-sm font-medium mt-1">Seamless workflows for sharing content across departments.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-[var(--color-base-bg)] shadow-clay-card border border-white/60 flex items-start gap-4 transform transition-all duration-500 hover:-translate-y-1 hover:shadow-clay-btn">
              <div className="p-3 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-btn">
                <Zap size={24} className="text-[var(--color-base-text)]" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--color-base-text)] text-lg">MESH AI Assistant</h3>
                <p className="text-[var(--color-base-text)] opacity-70 text-sm font-medium mt-1">Semantic search and auto-summarization for all materials.</p>
              </div>
            </div>

          </div>
          
          {/* Decorative Logo Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-5 pointer-events-none z-0">
             <img src="/logo.png" alt="" className="w-full h-full object-contain filter grayscale" />
          </div>
        </div>

      </div>
    </main>
  );
}
