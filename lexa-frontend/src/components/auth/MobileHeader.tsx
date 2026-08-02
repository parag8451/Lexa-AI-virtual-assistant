import { Sparkles, Zap, Globe, Brain } from "lucide-react";

export function MobileHeader() {
  return (
    <div className="lg:hidden mb-6 text-center">
      {/* Brand icon */}
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#38BDF8] via-[#C084FC] to-[#FF5E3A] p-[2px] mb-3 shadow-md">
        <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-[#FF5E3A]" />
        </div>
      </div>

      <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
        Lexa<span className="text-[#FF5E3A]">.ai</span>
      </h1>
      <p className="text-xs text-muted-foreground mt-0.5 mb-4">
        Autonomous Intelligent AI Workspace
      </p>
      
      {/* Quick pill features row */}
      <div className="flex items-center justify-center gap-2 pb-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-white/40 dark:bg-zinc-800/40 px-2.5 py-1 rounded-full border border-white/60 dark:border-white/10">
          <Zap className="w-3 h-3 text-[#FF5E3A]" /> Fast
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-white/40 dark:bg-zinc-800/40 px-2.5 py-1 rounded-full border border-white/60 dark:border-white/10">
          <Globe className="w-3 h-3 text-[#38BDF8]" /> Search
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-white/40 dark:bg-zinc-800/40 px-2.5 py-1 rounded-full border border-white/60 dark:border-white/10">
          <Brain className="w-3 h-3 text-[#C084FC]" /> Reasoning
        </span>
      </div>
    </div>
  );
}
