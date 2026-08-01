import { Sparkles, MessageSquare, Globe, Mic, Brain, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const FEATURES = [
  { 
    icon: MessageSquare, 
    title: "Smart Memory", 
    description: "Contextual AI that remembers preferences",
    gradient: "from-blue-500 to-cyan-500",
    glowColor: "group-hover:shadow-blue-500/20"
  },
  { 
    icon: Globe, 
    title: "Web Search", 
    description: "Real-time insights with citations",
    gradient: "from-emerald-500 to-teal-500",
    glowColor: "group-hover:shadow-emerald-500/20"
  },
  { 
    icon: Mic, 
    title: "Voice AI", 
    description: "Natural speech processing",
    gradient: "from-violet-500 to-purple-500",
    glowColor: "group-hover:shadow-violet-500/20"
  },
  { 
    icon: Brain, 
    title: "Multi-Model", 
    description: "GPT-4o, Claude 3.5, Gemini Pro",
    gradient: "from-amber-500 to-orange-500",
    glowColor: "group-hover:shadow-amber-500/20"
  },
];

const STATS = [
  { value: "5+", label: "AI Models" },
  { value: "<1s", label: "Response" },
  { value: "99.9%", label: "Uptime" },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } }
};

export function FeatureGrid() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-lg w-full"
    >
      {/* Logo & Title */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
        <div className="relative">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="w-12 h-12 rounded-xl gradient-aurora flex items-center justify-center shadow-lg"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
        </div>
        <div>
          <span className="text-xl font-bold text-foreground block">Lexa AI</span>
          <span className="text-xs text-muted-foreground">The Intelligent Assistant</span>
        </div>
      </motion.div>

      <motion.h1 variants={itemVariants} className="text-3xl xl:text-4xl font-extrabold text-foreground mb-4 leading-tight tracking-tight">
        Next-Generation <br />
        <span className="gradient-text">Conversations</span>
      </motion.h1>
      
      <motion.p variants={itemVariants} className="text-sm text-muted-foreground mb-8 max-w-sm">
        Experience a faster, smarter, and infinitely capable AI workspace designed for professionals.
      </motion.p>

      {/* Stats row */}
      <motion.div variants={itemVariants} className="flex gap-8 mb-8 pb-8 border-b border-border/20">
        {STATS.map((stat, index) => (
          <div key={index}>
            <div className="text-2xl font-extrabold gradient-text">{stat.value}</div>
            <div className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mt-1 font-medium">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Feature cards */}
      <div className="grid grid-cols-2 gap-3">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -2, scale: 1.02 }}
            className={cn(
              "group relative p-4 rounded-2xl glass-card cursor-default overflow-hidden",
              "hover:shadow-lg transition-all duration-300 border border-border/40",
              feature.glowColor
            )}
          >
            {/* Subtle Gradient accent */}
            <div className={cn(
              "absolute top-0 left-0 w-full h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r",
              feature.gradient
            )} />
            
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                "bg-gradient-to-br",
                feature.gradient
              )}>
                <feature.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-[13px] mb-0.5 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[11px] text-muted-foreground leading-snug">{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
