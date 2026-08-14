import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoIcon } from '@/components/ui/LogoIcon';
import { 
   Bot, User, CheckCircle2, ShieldCheck, 
  Cpu, ArrowUp, Activity, Zap, MessageSquare, Terminal, Mic
} from "lucide-react";

export function FeatureGrid() {
  const [activeTab, setActiveTab] = useState<"chat" | "code" | "voice">("chat");

  return (
    <div className="w-full space-y-6">
      {/* ─── Top Pill Badge & Headline ─── */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-full px-3.5 py-1.5 shadow-sm">
          <span className="bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wider uppercase">
            LEXA 2.0
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Next-generation autonomous AI companion
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
          Conversations that <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            evolve as you think.
          </span>
        </h1>

        <p className="text-sm text-muted-foreground max-w-lg leading-relaxed font-normal">
          Lexa turns complex reasoning into lightning-fast answers, code synthesis, live web search, and voice interactions.
        </p>
      </div>

      {/* ─── Horizon Frosted Interactive Mockup Card ─── */}
      <div className="w-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-white/70 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-5 sm:p-6 overflow-hidden relative group">
        {/* Soft internal gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#38BDF8]/5 via-transparent to-indigo-500/5 pointer-events-none" />

        {/* Card Header with Pill Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/5 dark:border-white/5 relative z-10">
          <div className="flex items-center gap-1.5 p-1 rounded-full border border-white/80 dark:border-white/10 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md shadow-sm">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeTab === "chat"
                  ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-blue-400" />
                Chat
              </span>
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeTab === "code"
                  ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-1">
                <Terminal className="w-3 h-3 text-cyan-400" />
                Code
              </span>
            </button>
            <button
              onClick={() => setActiveTab("voice")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeTab === "voice"
                  ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-1">
                <Mic className="w-3 h-3 text-indigo-400" />
                Voice
              </span>
            </button>
          </div>

          {/* Model Status Badge */}
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-semibold font-mono text-muted-foreground uppercase tracking-wider">
              Gemini 2.5 Flash • 0.3s
            </span>
          </div>
        </div>

        {/* Dynamic Simulated Content Based on Selected Tab */}
        <div className="pt-4 space-y-3.5 relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                {/* User Message */}
                <div className="flex gap-2.5 flex-row-reverse">
                  <div className="w-7 h-7 rounded-full bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/15 rounded-2xl rounded-tr-none px-3.5 py-2 text-xs max-w-[80%] text-foreground">
                    Build a real-time full-stack dashboard with Supabase auth and AI streaming.
                  </div>
                </div>

                {/* AI Assistant Message */}
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm">
                    <LogoIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md rounded-2xl rounded-tl-none border border-white/80 dark:border-white/10 px-3.5 py-2 text-xs space-y-1.5 max-w-[85%] text-foreground shadow-sm">
                    <p className="font-semibold text-[11px] text-indigo-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Lexa Intelligence Engine
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Configured React 18, Vite, Supabase JWT tokens, and token-by-token SSE streaming.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "code" && (
              <motion.div
                key="code"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="bg-zinc-950/90 text-zinc-200 rounded-2xl p-3 font-mono text-[11px] space-y-1 border border-zinc-800 shadow-inner"
              >
                <div className="flex items-center justify-between text-[10px] text-zinc-500 pb-1 border-b border-zinc-800/80">
                  <span>auth-stream.ts</span>
                  <span className="text-emerald-400">● Compiled</span>
                </div>
                <p className="text-purple-400">const <span className="text-blue-300">lexa</span> = <span className="text-yellow-300">createClient</span>();</p>
                <p className="text-zinc-400">await lexa.stream({"{"} model: <span className="text-emerald-300">'gpt-5-turbo'</span> {"}"});</p>
              </motion.div>
            )}

            {activeTab === "voice" && (
              <motion.div
                key="voice"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="bg-white/60 dark:bg-zinc-800/60 rounded-2xl p-4 flex items-center justify-between border border-white/80 dark:border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center animate-pulse">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Natural Neural Voice</p>
                    <p className="text-[10px] text-muted-foreground">ElevenLabs Ultra-HD Synthesis</p>
                  </div>
                </div>
                {/* Waveform bars */}
                <div className="flex items-center gap-1">
                  {[40, 75, 50, 90, 60, 85, 30].map((h, idx) => (
                    <div
                      key={idx}
                      className="w-1 bg-indigo-400 rounded-full animate-pulse"
                      style={{ height: `${h * 0.25}px`, animationDelay: `${idx * 120}ms` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Horizon Metrics & Edge Runtime Bar ─── */}
          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Multi-Model Router Ready</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-mono font-medium text-[10px] border border-blue-500/20">
                GPT-5
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono font-medium text-[10px] border border-cyan-500/20">
                Gemini 2.5
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono font-medium text-[10px] border border-indigo-500/20">
                Claude 3.5
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
