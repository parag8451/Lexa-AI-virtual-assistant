import { Sparkles, Check, Zap, Globe, Brain } from "lucide-react";

export function MobileHeader() {
  return (
    <div className="lg:hidden mb-8">
      {/* Logo section */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 glow-blue float">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-background">
            <Check className="w-3 h-3 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold gradient-text">Lexa AI</h1>
        <p className="text-sm text-muted-foreground mt-1">Next-gen AI Assistant</p>
      </div>
      
      {/* Quick features row */}
      <div className="flex justify-center gap-4 pb-4 mb-4 border-b border-border/30">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Zap className="w-3 h-3 text-blue-500" />
          </div>
          <span>Fast</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Globe className="w-3 h-3 text-emerald-500" />
          </div>
          <span>Web Search</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Brain className="w-3 h-3 text-violet-500" />
          </div>
          <span>Memory</span>
        </div>
      </div>
    </div>
  );
}
