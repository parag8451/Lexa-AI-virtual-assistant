import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { 
  Sparkles, ArrowRight, Check, MessageSquare, Globe, Mic, Brain, 
  Shield, Zap, Image, Users, Star, ChevronDown, Play, 
  ArrowUpRight, Command, Cpu, Lock, Layers, Wand2, Search, 
  Video, BookOpen, GraduationCap, BarChart3, Settings2, Bot,
  Rocket, Crown, Diamond, Eye, Headphones, PenTool, Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import IntroVideoSplash from "@/components/IntroVideoSplash";

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Smart Conversations",
    description: "Context-aware AI chat that remembers your preferences and adapts to your communication style across sessions.",
    gradient: "from-blue-500 via-blue-400 to-cyan-400",
    glowColor: "hsl(217 91% 60% / 0.2)",
    delay: 0
  },
  {
    icon: Globe,
    title: "Real-time Web Search",
    description: "Access live information with verified citations. Get up-to-date answers powered by advanced web crawling.",
    gradient: "from-emerald-500 via-emerald-400 to-teal-400",
    glowColor: "hsl(160 91% 50% / 0.2)",
    delay: 0.1
  },
  {
    icon: Mic,
    title: "Voice Conversations",
    description: "Natural voice interactions with AI-powered speech recognition and ultra-realistic text-to-speech responses.",
    gradient: "from-violet-500 via-purple-400 to-fuchsia-400",
    glowColor: "hsl(270 91% 60% / 0.2)",
    delay: 0.2
  },
  {
    icon: Brain,
    title: "Persistent Memory",
    description: "An AI that truly knows you. Lexa learns your interests, preferences, and context for deeply personalized responses.",
    gradient: "from-amber-500 via-orange-400 to-yellow-400",
    glowColor: "hsl(35 91% 55% / 0.2)",
    delay: 0.3
  },
  {
    icon: Image,
    title: "Image & Video Generation",
    description: "Create stunning visuals with DALL-E 3 and cinematic videos with Veo 3.1 directly in your conversations.",
    gradient: "from-pink-500 via-rose-400 to-red-400",
    glowColor: "hsl(340 91% 55% / 0.2)",
    delay: 0.4
  },
  {
    icon: Users,
    title: "Team Workspaces",
    description: "Collaborate seamlessly with shared workspaces, conversation history, and team-wide knowledge bases.",
    gradient: "from-indigo-500 via-blue-400 to-violet-400",
    glowColor: "hsl(240 91% 60% / 0.2)",
    delay: 0.5
  }
];

const MODELS = [
  { 
    name: "Lexa Ultra", 
    badge: "Most Powerful", 
    description: "Our flagship model for the most complex tasks",
    icon: Crown,
    gradient: "from-amber-400 via-yellow-300 to-amber-500",
    stats: "200B+ params"
  },
  { 
    name: "Lexa Expert", 
    badge: "Deep Reasoning", 
    description: "Advanced chain-of-thought reasoning engine",
    icon: Diamond,
    gradient: "from-violet-400 via-purple-400 to-indigo-500",
    stats: "Chain-of-Thought"
  },
  { 
    name: "Lexa Pro", 
    badge: "Advanced", 
    description: "Perfect balance of speed and intelligence",
    icon: Zap,
    gradient: "from-blue-400 via-cyan-400 to-teal-400",
    stats: "Balanced"
  },
  { 
    name: "Lexa Fast", 
    badge: "Instant", 
    description: "Lightning-fast responses under 500ms",
    icon: Rocket,
    gradient: "from-green-400 via-emerald-400 to-teal-400",
    stats: "<500ms"
  }
];

const TESTIMONIALS = [
  {
    quote: "Lexa AI has completely transformed how I work. The memory feature alone saves me hours every week.",
    author: "Sarah Mitchell",
    role: "Product Manager at Stripe",
    avatar: "SM",
    rating: 5
  },
  {
    quote: "Finally an AI that actually remembers our previous conversations. It feels like working with a real colleague.",
    author: "James Kim",
    role: "Senior Engineer at Google",
    avatar: "JK",
    rating: 5
  },
  {
    quote: "The voice feature is incredibly natural. It's like having a brilliant assistant always by your side.",
    author: "Lisa Thompson",
    role: "CEO at TechVentures",
    avatar: "LT",
    rating: 5
  }
];

const CAPABILITIES = [
  { icon: Code2, label: "Code Generation", color: "text-blue-400" },
  { icon: Search, label: "Deep Research", color: "text-emerald-400" },
  { icon: Video, label: "Video Creation", color: "text-pink-400" },
  { icon: Image, label: "Image Generation", color: "text-amber-400" },
  { icon: PenTool, label: "Creative Writing", color: "text-violet-400" },
  { icon: GraduationCap, label: "Learning", color: "text-green-400" },
  { icon: BarChart3, label: "Data Analysis", color: "text-cyan-400" },
  { icon: Headphones, label: "Voice Chat", color: "text-rose-400" },
];

const STATS = [
  { value: "5M+", label: "Messages Sent", suffix: "" },
  { value: "99.9", label: "Uptime", suffix: "%" },
  { value: "50+", label: "AI Models", suffix: "" },
  { value: "<1", label: "Avg Response", suffix: "s" },
];

/* ═══════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════ */

const easeOut = [0.22, 1, 0.36, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: easeOut }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay, ease: easeOut }
  })
};

/* ═══════════════════════════════════════════
   FLOATING PARTICLES COMPONENT
   ═══════════════════════════════════════════ */

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `hsl(${200 + Math.random() * 80} 91% 60% / ${0.1 + Math.random() * 0.3})`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 50, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 5 + Math.random() * 8,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════ */

function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <span ref={ref}>
      {isInView ? (
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {value}{suffix}
        </motion.span>
      ) : "0"}
    </span>
  );
}

/* ═══════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════ */

export default function Landing() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/videos/lexaai.mp4';
    video.oncanplay = () => setVideoLoaded(true);
    video.onerror = () => setShowIntro(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setIsAuthenticated(true);
    });
  }, []);

  const handleGetStarted = () => {
    navigate(isAuthenticated ? "/chat" : "/auth");
  };

  return (
    <>
      {showIntro && videoLoaded && (
        <IntroVideoSplash videoSrc="/videos/lexaai.mp4" onComplete={() => setShowIntro(false)} />
      )}

      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        {/* ═══════════════ PREMIUM HEADER ═══════════════ */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <div className="mx-4 mt-4">
            <div className="glass-strong rounded-2xl px-6 h-16 flex items-center justify-between max-w-7xl mx-auto shadow-lg">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 rounded-xl gradient-aurora flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <span className="text-xl font-bold tracking-tight">Lexa AI</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Beta
                </span>
              </div>

              <nav className="hidden md:flex items-center gap-1">
                {["Features", "Models", "Pricing"].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      const el = document.getElementById(item.toLowerCase());
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
                  >
                    {item}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                {isAuthenticated ? (
                  <Button onClick={() => navigate("/chat")} className="gradient-primary btn-premium rounded-xl px-6 h-10 font-semibold shadow-lg">
                    Go to Chat
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" onClick={() => navigate("/auth")} className="hidden sm:flex text-sm font-medium rounded-xl">
                      Sign In
                    </Button>
                    <Button onClick={() => navigate("/auth")} className="gradient-primary btn-premium rounded-xl px-6 h-10 font-semibold shadow-lg">
                      Get Started Free
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.header>

        {/* ═══════════════ HERO SECTION ═══════════════ */}
        <section ref={heroRef} className="relative pt-40 pb-32 px-4 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
            <div className="orb orb-4" />
            <FloatingParticles />
            <div className="absolute inset-0 grid-pattern-subtle" />
          </div>

          <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center">
              {/* Announcement badge */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm font-medium mb-8 hover-lift cursor-default"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <span className="text-muted-foreground">Powered by</span>
                <span className="gradient-text font-semibold">GPT-5, Gemini 2.5 Pro & Claude 4</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
              </motion.div>

              {/* Main heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[0.95] tracking-tight"
              >
                <span className="block">The Future of</span>
                <span className="block mt-2">
                  <span className="gradient-text">AI Conversation</span>
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-balance"
              >
                Experience next-generation AI with persistent memory, real-time web search,
                voice conversations, and multi-model intelligence — all in one beautiful interface.
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
              >
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="gradient-primary btn-premium text-lg px-10 h-14 rounded-2xl shadow-xl hover:shadow-2xl font-semibold group"
                >
                  Start Free Today
                  <motion.span
                    className="ml-2 inline-flex"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById('features');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-lg px-8 h-14 rounded-2xl glass border-border/50 hover:bg-muted/50 font-medium group"
                >
                  <Play className="w-5 h-5 mr-2 text-primary group-hover:scale-110 transition-transform" />
                  See How It Works
                </Button>
              </motion.div>

              {/* Capabilities pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="flex flex-wrap justify-center gap-3 mb-16"
              >
                {CAPABILITIES.map((cap, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm hover-lift cursor-default"
                  >
                    <cap.icon className={cn("w-4 h-4", cap.color)} />
                    <span className="text-muted-foreground font-medium">{cap.label}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Chat preview mockup */}
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative max-w-4xl mx-auto"
              >
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-2xl opacity-60" />
                <div className="relative glass-strong rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
                  {/* Browser bar */}
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/30 bg-card/50">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg bg-muted/30 text-xs text-muted-foreground max-w-xs mx-auto">
                        <Lock className="w-3 h-3" />
                        chat.lexa.ai
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-medium text-emerald-500">Live</span>
                    </div>
                  </div>

                  {/* Chat content */}
                  <div className="p-6 space-y-4 bg-gradient-to-b from-background/50 to-background/80 min-h-[320px]">
                    {/* User message */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2, duration: 0.5 }}
                      className="flex justify-end"
                    >
                      <div className="max-w-[75%] px-5 py-3 rounded-2xl rounded-br-md bg-primary text-primary-foreground text-sm font-medium shadow-lg">
                        Explain quantum computing in simple terms and create a visualization
                      </div>
                    </motion.div>

                    {/* AI thinking */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.5, duration: 0.5 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">Lexa AI</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 font-medium">
                            Lexa Ultra
                          </span>
                        </div>
                        <div className="glass-card rounded-xl p-4 text-sm text-foreground/80 leading-relaxed">
                          <p className="mb-3">Think of quantum computing like this: 🎲</p>
                          <p className="mb-3">A classical computer uses <strong className="text-foreground">bits</strong> — tiny switches that are either ON (1) or OFF (0). A quantum computer uses <strong className="gradient-text-static">qubits</strong> that can be both ON and OFF at the same time!</p>
                          <p>This is called <em>superposition</em>, and it lets quantum computers explore millions of possibilities simultaneously...</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-primary" />
                            Generated in 1.2s
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Sources: 4
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Input bar mockup */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2, duration: 0.5 }}
                      className="mt-6"
                    >
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted/30 border border-border/30">
                        <span className="text-sm text-muted-foreground/60 flex-1">Ask Lexa AI anything...</span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                            <Mic className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-md">
                            <ArrowRight className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="flex justify-center mt-20"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2 text-muted-foreground/50 cursor-pointer"
              onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="text-xs font-medium tracking-wider uppercase">Scroll to explore</span>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════════════ STATS SECTION ═══════════════ */}
        <section id="stats" className="py-20 px-4 relative">
          <div className="absolute inset-0 dot-pattern opacity-50" />
          <div className="container mx-auto max-w-5xl relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {STATS.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  custom={index * 0.1}
                  className="text-center p-6 rounded-2xl glass-card hover-lift"
                >
                  <div className="text-4xl md:text-5xl font-extrabold gradient-text mb-2">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ FEATURES SECTION ═══════════════ */}
        <section id="features" className="py-28 px-4 relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="orb orb-2 opacity-30" />
            <div className="orb orb-3 opacity-20" />
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.div variants={fadeInUp} custom={0}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
                  <Layers className="w-3.5 h-3.5" />
                  Features
                </span>
              </motion.div>
              <motion.h2 variants={fadeInUp} custom={0.1} className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
                Everything You Need,
                <br />
                <span className="gradient-text">Nothing You Don't</span>
              </motion.h2>
              <motion.p variants={fadeInUp} custom={0.2} className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
                Powerful AI features designed for everyone — from creative professionals to researchers and developers.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: feature.delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="group relative p-7 rounded-2xl glass-card hover-lift cursor-default overflow-hidden"
                >
                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: `inset 0 0 60px ${feature.glowColor}` }}
                  />
                  
                  {/* Gradient line at top */}
                  <div className={cn("absolute top-0 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500", feature.gradient)} />

                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg bg-gradient-to-br", feature.gradient)}
                    >
                      <feature.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-bold mb-2.5 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ MODELS SECTION ═══════════════ */}
        <section id="models" className="py-28 px-4 relative">
          <div className="absolute inset-0 grid-pattern-subtle" />
          <div className="container mx-auto max-w-5xl relative z-10 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} custom={0}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
                  <Cpu className="w-3.5 h-3.5" />
                  AI Models
                </span>
              </motion.div>
              <motion.h2 variants={fadeInUp} custom={0.1} className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
                Powered by the
                <br />
                <span className="gradient-text">World's Best AI</span>
              </motion.h2>
              <motion.p variants={fadeInUp} custom={0.2} className="text-lg text-muted-foreground mb-14 max-w-xl mx-auto">
                Access multiple state-of-the-art AI models in one unified interface. Each optimized for different tasks.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {MODELS.map((model, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="group relative p-6 rounded-2xl glass-card text-left overflow-hidden cursor-default"
                >
                  {/* Top gradient bar */}
                  <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-60 group-hover:opacity-100 transition-opacity", model.gradient)} />
                  
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.15 }}
                      className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg shrink-0", model.gradient)}
                    >
                      <model.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground">{model.name}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                          {model.badge}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{model.description}</p>
                      <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">{model.stats}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ TESTIMONIALS SECTION ═══════════════ */}
        <section className="py-28 px-4 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="orb orb-1 opacity-20" />
            <div className="orb orb-4 opacity-15" />
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.div variants={fadeInUp} custom={0}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
                  <Star className="w-3.5 h-3.5" />
                  Testimonials
                </span>
              </motion.div>
              <motion.h2 variants={fadeInUp} custom={0.1} className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                Loved by <span className="gradient-text">Thousands</span>
              </motion.h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((test, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="p-7 rounded-2xl glass-card hover-lift"
                >
                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-5">
                    {Array.from({ length: test.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  
                  <p className="text-foreground/90 mb-6 leading-relaxed italic">
                    "{test.quote}"
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-aurora flex items-center justify-center text-sm font-bold text-white">
                      {test.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{test.author}</p>
                      <p className="text-xs text-muted-foreground">{test.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ CTA SECTION ═══════════════ */}
        <section id="pricing" className="py-28 px-4 relative">
          <div className="container mx-auto max-w-4xl relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Background glow */}
              <div className="absolute -inset-6 rounded-3xl gradient-aurora opacity-20 blur-3xl" />
              
              <div className="relative p-12 md:p-16 rounded-3xl glass-strong text-center overflow-hidden border border-border/30">
                {/* Grid overlay */}
                <div className="absolute inset-0 grid-pattern-subtle opacity-50" />
                
                <div className="relative z-10">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex mb-8"
                  >
                    <div className="w-20 h-20 rounded-3xl gradient-aurora flex items-center justify-center shadow-2xl glow-multi">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>

                  <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
                    Ready to Experience
                    <br />
                    <span className="gradient-text">the Future?</span>
                  </h2>
                  
                  <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto text-balance">
                    Join thousands of professionals already using Lexa AI to work smarter, create faster, and think bigger.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                      size="lg"
                      onClick={handleGetStarted}
                      className="gradient-primary btn-premium text-lg px-10 h-14 rounded-2xl shadow-xl font-semibold"
                    >
                      Get Started — It's Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-green-500" />
                      No credit card required
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-green-500" />
                      Free forever plan
                    </span>
                    <span className="flex items-center gap-1.5 hidden sm:flex">
                      <Check className="w-4 h-4 text-green-500" />
                      Cancel anytime
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <footer className="py-12 px-4 border-t border-border/30">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 rounded-xl gradient-aurora flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <span className="font-bold text-lg">Lexa AI</span>
                  <p className="text-xs text-muted-foreground">Next-Generation AI Assistant</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <button className="hover:text-foreground transition-colors">Privacy</button>
                <button className="hover:text-foreground transition-colors">Terms</button>
                <button className="hover:text-foreground transition-colors">Support</button>
              </div>

              <p className="text-sm text-muted-foreground">
                © 2025 Lexa AI. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
