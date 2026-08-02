import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ArrowUpRight, MessageSquare, Bot } from "lucide-react";
import { CustomCursor } from "@/components/ui/CustomCursor";

interface AuthLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export function AuthLayout({ leftPanel, rightPanel }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden font-sans bg-background text-foreground selection:bg-[#FF8A65]/30 selection:text-[#752305]">
      {/* Interactive Mix-blend Cursor */}
      <CustomCursor />

      {/* ─── Background Layer: Soft Atmospheric Ethereal Gradients ─── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Top Sky Blue & Soft Violet Ambient Wash */}
        <div className="absolute top-0 left-0 right-0 h-[650px] bg-gradient-to-b from-[#38BDF8]/20 via-[#C084FC]/10 to-transparent" />
        
        {/* Soft Radial Ambient Glow Orbs */}
        <div className="absolute top-[15%] left-[10%] w-[450px] h-[450px] rounded-full bg-[#38BDF8]/15 blur-[120px]" />
        <div className="absolute top-[25%] right-[15%] w-[500px] h-[500px] rounded-full bg-[#C084FC]/15 blur-[140px]" />
        <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full bg-[#FF5E3A]/10 blur-[130px]" />

        {/* Delicate Horizon Dot Pattern */}
        <div
          className="absolute inset-0 opacity-[0.25] dark:opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(circle, #a855f7 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ─── Floating Horizon Pill Navigation ─── */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 w-[94%] max-w-6xl rounded-full border border-white/60 dark:border-white/10 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] z-50 flex justify-between items-center py-2.5 px-5 transition-all">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group transition-transform active:scale-95"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#38BDF8] via-[#C084FC] to-[#FF5E3A] p-[1.5px] shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#FF5E3A] group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <span className="font-extrabold text-lg tracking-tight text-foreground font-sans">
            Lexa<span className="text-[#FF5E3A] font-semibold">.ai</span>
          </span>
        </Link>

        {/* Center Pill Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#models" className="hover:text-foreground transition-colors">Models</a>
          <a href="#security" className="hover:text-foreground transition-colors">Security</a>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            to="/chat"
            className="inline-flex items-center gap-1.5 bg-white/60 dark:bg-white/10 border border-white/80 dark:border-white/20 text-foreground text-xs font-semibold px-4 py-2 rounded-full shadow-sm hover:bg-white/90 dark:hover:bg-white/20 transition-all active:scale-95"
          >
            <span>Open Chat</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </Link>
        </div>
      </header>

      {/* ─── Main Content Split Layout ─── */}
      <main className="flex-1 max-w-7xl mx-auto w-full pt-28 pb-12 px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Panel: Horizon Interactive App Showcase */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 flex flex-col justify-center py-4"
          >
            {leftPanel}
          </motion.div>

          {/* Right Panel: Frosted Glass Form Container */}
          <motion.div
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex justify-center py-4"
          >
            {rightPanel}
          </motion.div>
        </div>
      </main>

      {/* ─── Minimalist Footer ─── */}
      <footer className="w-full py-6 text-center text-xs text-muted-foreground/80 border-t border-border/10 z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Lexa AI. Built for the next era of intelligent interaction.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
