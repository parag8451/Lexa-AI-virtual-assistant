import { Image, BookOpen, Sparkles, Video, Search, LayoutDashboard, GraduationCap, Layout, Beaker, PenTool } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
  userName?: string;
}

const QUICK_ACTIONS = [
  {
    icon: Search,
    label: "Deep Research",
    prompt: "Conduct deep research on the latest advancements in AI and provide a comprehensive analysis with sources",
    gradient: "from-blue-500 to-cyan-400",
    glowColor: "group-hover:shadow-blue-500/20",
  },
  {
    icon: Video,
    label: "Create video (Veo 3.1)",
    prompt: "Generate a cinematic video of a futuristic cityscape with flying vehicles at golden hour",
    gradient: "from-pink-500 to-rose-400",
    glowColor: "group-hover:shadow-pink-500/20",
  },
  {
    icon: Image,
    label: "Create images",
    prompt: "Generate a stunning high-resolution image of a magical forest with bioluminescent plants",
    gradient: "from-amber-500 to-yellow-400",
    glowColor: "group-hover:shadow-amber-500/20",
  },
  {
    icon: LayoutDashboard,
    label: "Canvas",
    prompt: "Open a creative canvas workspace where I can brainstorm ideas, create diagrams, and organize my thoughts visually",
    gradient: "from-purple-500 to-violet-400",
    glowColor: "group-hover:shadow-purple-500/20",
  },
  {
    icon: GraduationCap,
    label: "Guided Learning",
    prompt: "Create a personalized step-by-step learning path for mastering a new skill. Ask me what I want to learn.",
    gradient: "from-green-500 to-emerald-400",
    glowColor: "group-hover:shadow-green-500/20",
  },
  {
    icon: Layout,
    label: "Visual layout",
    prompt: "Help me design a beautiful visual layout for a landing page or presentation with modern UI/UX principles",
    gradient: "from-cyan-500 to-teal-400",
    glowColor: "group-hover:shadow-cyan-500/20",
  },
  {
    icon: Beaker,
    label: "Labs",
    prompt: "Take me to the experimental features lab where I can try cutting-edge AI capabilities",
    gradient: "from-orange-500 to-amber-400",
    glowColor: "group-hover:shadow-orange-500/20",
  },
  {
    icon: PenTool,
    label: "Creative writing",
    prompt: "Help me write engaging creative content - stories, poetry, or compelling narratives",
    gradient: "from-rose-500 to-pink-400",
    glowColor: "group-hover:shadow-rose-500/20",
  },
  {
    icon: BookOpen,
    label: "Help me learn",
    prompt: "Teach me something interesting and useful today in an engaging way",
    gradient: "from-indigo-500 to-blue-400",
    glowColor: "group-hover:shadow-indigo-500/20",
  },
  {
    icon: Sparkles,
    label: "Surprise me",
    prompt: "Surprise me with something amazing - a fun fact, creative idea, or unexpected insight",
    gradient: "from-yellow-400 to-orange-400",
    glowColor: "group-hover:shadow-yellow-500/20",
  },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: easeOut },
  },
};

export function WelcomeScreen({
  onSuggestionClick,
  userName,
}: WelcomeScreenProps) {
  const displayName = userName || "there";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 relative overflow-hidden">
      {/* Dark Liquid Gradient Background - INTENSE & FAST */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#020617]">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0c1a30] to-[#020617]" />
        
        {/* Primary liquid blob - deep blue - SUPER BRIGHT */}
        <div 
          className="absolute w-[1000px] h-[1000px] -top-[100px] -left-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,1) 0%, rgba(37,99,235,0.8) 30%, rgba(30,64,175,0.4) 50%, transparent 70%)',
            animation: 'liquid-flow-1 8s ease-in-out infinite',
            filter: 'blur(30px)',
          }}
        />
        
        {/* Secondary liquid blob - vibrant blue - FAST */}
        <div 
          className="absolute w-[900px] h-[900px] -bottom-[50px] -right-[50px]"
          style={{
            background: 'radial-gradient(circle, rgba(96,165,250,1) 0%, rgba(59,130,246,0.8) 35%, rgba(37,99,235,0.3) 55%, transparent 75%)',
            animation: 'liquid-flow-2 10s ease-in-out infinite',
            filter: 'blur(35px)',
          }}
        />
        
        {/* Tertiary blob - cyan accent - PULSING */}
        <div 
          className="absolute w-[700px] h-[700px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(34,211,238,1) 0%, rgba(6,182,212,0.7) 35%, rgba(14,165,233,0.3) 55%, transparent 75%)',
            animation: 'liquid-flow-3 6s ease-in-out infinite, liquid-pulse 3s ease-in-out infinite',
            filter: 'blur(40px)',
          }}
        />
        
        {/* Deep purple accent blob - VIBRANT */}
        <div 
          className="absolute w-[800px] h-[800px] top-[10%] right-[0%]"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,1) 0%, rgba(124,58,237,0.7) 35%, rgba(88,28,135,0.3) 55%, transparent 75%)',
            animation: 'liquid-flow-1 9s ease-in-out infinite reverse',
            filter: 'blur(45px)',
          }}
        />
        
        {/* Bright moving light streaks - FAST MORPH */}
        <div 
          className="absolute w-[600px] h-[600px] bottom-[20%] left-[10%]"
          style={{
            background: 'radial-gradient(ellipse, rgba(147,197,253,1) 0%, rgba(96,165,250,0.6) 35%, transparent 60%)',
            animation: 'liquid-morph 5s ease-in-out infinite, liquid-glow 3s ease-in-out infinite',
          }}
        />
        
        {/* Intense center glow - PULSING */}
        <div 
          className="absolute w-[800px] h-[800px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(96,165,250,0.9) 0%, rgba(59,130,246,0.5) 25%, rgba(37,99,235,0.2) 45%, transparent 65%)',
            animation: 'liquid-pulse 4s ease-in-out infinite',
          }}
        />
        
        {/* Extra bright accent - FAST */}
        <div 
          className="absolute w-[500px] h-[500px] top-[25%] left-[35%]"
          style={{
            background: 'radial-gradient(circle, rgba(191,219,254,0.9) 0%, rgba(147,197,253,0.5) 30%, transparent 60%)',
            animation: 'liquid-flow-2 6s ease-in-out infinite reverse, liquid-glow 2s ease-in-out infinite',
            filter: 'blur(25px)',
          }}
        />
        
        {/* Additional moving glow - LEFT */}
        <div 
          className="absolute w-[600px] h-[600px] top-[40%] -left-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.9) 0%, rgba(37,99,235,0.4) 40%, transparent 65%)',
            animation: 'liquid-flow-3 7s ease-in-out infinite',
            filter: 'blur(50px)',
          }}
        />
        
        {/* Noise overlay for texture */}
        <div className="absolute inset-0 opacity-[0.008]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      </div>

      <div className="w-full max-w-3xl mx-auto relative z-10">
        {/* Greeting Section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 text-center"
        >
          {/* Lexa AI Branding */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-8"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.06, 1],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-40 animate-[breathe_3s_ease-in-out_infinite]" />
              <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold gradient-text tracking-tight">
              Lexa AI
            </h1>
          </motion.div>

          {/* Personalized greeting */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-xl text-muted-foreground mb-3"
          >
            Hi {displayName} 👋
          </motion.p>

          {/* Main question */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-2xl md:text-3xl font-semibold text-foreground leading-tight"
          >
            What can I help you with today?
          </motion.h2>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-8"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {QUICK_ACTIONS.map((action, index) => (
              <motion.button
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSuggestionClick(action.prompt)}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-2xl",
                  "glass-card cursor-pointer",
                  "hover:shadow-xl transition-shadow duration-300",
                  action.glowColor,
                  "text-center group relative overflow-hidden"
                )}
              >
                {/* Top gradient accent */}
                <div
                  className={cn(
                    "absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    action.gradient
                  )}
                />

                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center",
                    "bg-gradient-to-br shadow-lg",
                    action.gradient,
                    "group-hover:scale-110 group-hover:shadow-xl transition-all duration-300"
                  )}
                >
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground leading-tight transition-colors">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}