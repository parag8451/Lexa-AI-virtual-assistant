import { Sparkles, MessageSquare, Globe, Mic, FileText, Check, Zap, Brain, Shield, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const FEATURES = [
  { 
    icon: MessageSquare, 
    title: "Smart Conversations", 
    description: "Natural AI chat with context memory that remembers your preferences",
    gradient: "from-blue-500 to-cyan-500",
    glowColor: "group-hover:shadow-blue-500/20"
  },
  { 
    icon: Globe, 
    title: "Web Search", 
    description: "Real-time web search with verified citations and sources",
    gradient: "from-emerald-500 to-teal-500",
    glowColor: "group-hover:shadow-emerald-500/20"
  },
  { 
    icon: Mic, 
    title: "Voice Support", 
    description: "Speak naturally and listen to AI-generated responses",
    gradient: "from-violet-500 to-purple-500",
    glowColor: "group-hover:shadow-violet-500/20"
  },
  { 
    icon: Brain, 
    title: "Memory System", 
    description: "AI learns your preferences across all conversations",
    gradient: "from-amber-500 to-orange-500",
    glowColor: "group-hover:shadow-amber-500/20"
  },
];

const STATS = [
  { value: "5+", label: "AI Models" },
  { value: "<1s", label: "Response" },
  { value: "99.9%", label: "Uptime" },
];

const BENEFITS = [
  { icon: Zap, text: "GPT-5, Gemini 2.5 Pro & more" },
  { icon: Shield, text: "Enterprise-grade security" },
  { icon: FileText, text: "Analyze documents & images" },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } }
};

export function FeatureGrid() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-xl"
    >
      {/* Logo */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
        <div className="relative">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="w-14 h-14 rounded-2xl gradient-aurora flex items-center justify-center shadow-xl"
          >
            <Sparkles className="w-7 h-7 text-white" />
          </motion.div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
            <Check className="w-3 h-3 text-white" />
          </div>
        </div>
        <div>
          <span className="text-2xl font-bold text-foreground block">Lexa AI</span>
          <span className="text-xs text-muted-foreground">Next-gen AI Assistant</span>
        </div>
      </motion.div>

      <motion.h1 variants={itemVariants} className="text-3xl xl:text-4xl font-extrabold text-foreground mb-4 leading-tight tracking-tight">
        Your Intelligent
        <br />
        <span className="gradient-text">AI Assistant</span>
      </motion.h1>
      
      <motion.p variants={itemVariants} className="text-base text-muted-foreground mb-8">
        Experience next-gen AI conversations with memory, search, and voice.
      </motion.p>

      {/* Stats row */}
      <motion.div variants={itemVariants} className="flex gap-8 mb-10 pb-8 border-b border-border/20">
        {STATS.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl font-extrabold gradient-text">{stat.value}</div>
            <div className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mt-1 font-medium">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Feature cards */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className={cn(
              "group relative p-5 rounded-2xl glass-card cursor-default overflow-hidden",
              "hover:shadow-xl transition-shadow duration-300",
              feature.glowColor
            )}
          >
            {/* Gradient accent at top */}
            <div className={cn(
              "absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              feature.gradient
            )} />
            
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center mb-3 relative shadow-lg",
                "bg-gradient-to-br",
                feature.gradient
              )}
            >
              <feature.icon className="w-5 h-5 text-white" />
            </motion.div>
            <h3 className="font-semibold text-foreground text-sm mb-1.5 group-hover:text-primary transition-colors">
              {feature.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Benefits with icons */}
      <div className="space-y-3">
        {BENEFITS.map((benefit, index) => (
          <motion.div 
            key={index}
            variants={itemVariants}
            whileHover={{ x: 4 }}
            className="flex items-center gap-3 text-sm text-muted-foreground group cursor-default"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
              <benefit.icon className="w-4 h-4 text-primary" />
            </div>
            <span className="group-hover:text-foreground transition-colors font-medium">{benefit.text}</span>
            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0 transition-all" />
          </motion.div>
        ))}
      </div>

      {/* Chat Preview Mock */}
      <motion.div variants={itemVariants} className="mt-10 relative">
        <div className="absolute -top-3 left-4 px-2 py-0.5 bg-background text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          Live Preview
        </div>
        <div className="rounded-2xl glass-strong border border-border/30 overflow-hidden shadow-2xl">
          {/* Chat header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/20 bg-card/30">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-foreground">Lexa AI</span>
            <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full ml-auto font-medium border border-primary/10">Online</span>
          </div>
          
          {/* Chat messages */}
          <div className="p-4 space-y-3">
            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-br-md gradient-primary text-white text-xs shadow-md">
                Explain quantum computing simply
              </div>
            </div>
            
            {/* AI response */}
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-lg gradient-aurora flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1">
                <div className="max-w-[95%] px-3 py-2 rounded-2xl rounded-tl-md glass-card text-foreground text-xs leading-relaxed">
                  <span className="text-primary font-semibold">Quantum computing</span> uses quantum bits (qubits) that can exist in multiple states simultaneously, unlike classical bits...
                </div>
                <div className="flex items-center gap-2 mt-1.5 px-1">
                  <span className="text-[9px] text-muted-foreground font-medium">Gemini 2.5 Pro</span>
                  <span className="text-[9px] text-emerald-500 font-medium">● 0.8s</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Input area */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/20 border border-border/20">
              <span className="text-xs text-muted-foreground/60 flex-1">Message Lexa AI...</span>
              <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center shadow-sm">
                <ArrowRight className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
