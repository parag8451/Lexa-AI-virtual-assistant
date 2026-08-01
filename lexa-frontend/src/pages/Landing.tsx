import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { 
  ArrowRight, MessageSquare, Globe, Mic, Brain, 
  Image, Zap, ChevronDown, Bot,
  Sparkles, Lock, Shield, Code2, Search,
  Check, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import Aurora from "@/components/ui/Aurora";
import SplitText from "@/components/ui/SplitText";

/* ─── Data ─── */

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Smart Conversations",
    description: "Context-aware AI that remembers your preferences and adapts to your style.",
  },
  {
    icon: Globe,
    title: "Real-time Web Search",
    description: "Access live information with verified citations and up-to-date answers.",
  },
  {
    icon: Mic,
    title: "Voice Conversations",
    description: "Natural voice interactions with AI-powered speech recognition.",
  },
  {
    icon: Brain,
    title: "Persistent Memory",
    description: "An AI that learns your interests for deeply personalized responses.",
  },
  {
    icon: Image,
    title: "Image & Video Generation",
    description: "Create stunning visuals with DALL-E 3 and cinematic videos with Veo.",
  },
  {
    icon: Code2,
    title: "Code Generation",
    description: "Write, debug, and explain code across dozens of programming languages.",
  },
];

const MODELS = [
  { name: "GPT-5", badge: "OpenAI", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  { name: "Gemini 2.5 Pro", badge: "Google", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  { name: "Claude 4", badge: "Anthropic", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { name: "Lexa Ultra", badge: "Custom", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" },
];

const STATS = [
  { value: "5M+", label: "Messages processed" },
  { value: "99.9%", label: "Uptime" },
  { value: "50+", label: "AI Models" },
  { value: "<1s", label: "Avg. response" },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with AI",
    features: ["100 messages/day", "GPT-4o mini", "Web search", "Voice input"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$20",
    period: "/month",
    description: "For power users",
    features: ["Unlimited messages", "All premium models", "Image & video generation", "Priority support", "Custom instructions"],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$15",
    period: "/user/month",
    description: "For organizations",
    features: ["Everything in Pro", "Shared workspaces", "Admin dashboard", "SSO & SAML", "API access"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

/* ─── Animation Helpers ─── */

const ease = [0.22, 1, 0.36, 1] as const;

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Landing Page ─── */

export default function Landing() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setIsAuthenticated(true);
    });
  }, []);

  const handleGetStarted = () => navigate(isAuthenticated ? "/chat" : "/auth");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      
      {/* ──────── Header ──────── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-3">
          <div className="glass-strong rounded-2xl px-5 h-14 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-background" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Lexa AI</span>
              <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border border-primary/20 text-primary bg-primary/5">
                Beta
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {["Features", "Models", "Pricing"].map((item) => (
                <button
                  key={item}
                  onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg"
                >
                  {item}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <Button onClick={() => navigate("/chat")} size="sm" className="rounded-lg h-9 px-4 font-medium">
                  Open Chat <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="hidden sm:flex rounded-lg h-9 text-sm">
                    Log in
                  </Button>
                  <Button size="sm" onClick={() => navigate("/auth")} className="rounded-lg h-9 px-4 font-medium">
                    Get Started <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* ──────── Hero ──────── */}
      <section className="relative pt-36 pb-24 px-4 overflow-hidden">
        {/* Subtle ambient background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0, opacity: 0.7 }}>
          <Aurora 
            colorStops={["#7cff67","#B497CF","#5227FF"]}
            blend={0.5}
            amplitude={1.0}
            speed={1}
          />
        </div>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/[0.03] blur-[100px]" />
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/60 backdrop-blur-sm text-sm mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-muted-foreground">Now powered by</span>
            <span className="font-medium text-foreground">GPT-5, Gemini 2.5 & Claude 4</span>
          </motion.div>

          {/* Heading */}
          <SplitText
            text="Your AI assistant for everything"
            tag="h1"
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
            delay={50}
            duration={1.25}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Chat with the world's most powerful AI models. Search the web, generate images, 
            write code, and more — all with persistent memory that makes every conversation smarter.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
          >
            <Button size="lg" onClick={handleGetStarted} className="h-12 px-8 text-base rounded-xl font-medium shadow-lg shadow-primary/20">
              Start for Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="h-12 px-8 text-base rounded-xl">
              See Features
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xs text-muted-foreground"
          >
            No credit card required · Free plan available
          </motion.p>

          {/* Chat Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.7, ease }}
            className="relative mt-16 max-w-3xl mx-auto"
          >
            {/* Glow behind card */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-violet-500/10 blur-xl opacity-60" />
            
            <div className="relative bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-muted/30">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" /> chat.lexa.ai
                  </div>
                </div>
              </div>

              {/* Chat content */}
              <div className="p-6 space-y-5 min-h-[280px]">
                {/* User message */}
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                  className="flex justify-end"
                >
                  <div className="max-w-[72%] px-4 py-2.5 rounded-2xl rounded-br-md bg-primary text-primary-foreground text-sm">
                    Explain quantum computing simply and suggest practical applications
                  </div>
                </motion.div>

                {/* AI response */}
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5, duration: 0.4 }}
                  className="flex gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-background" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="text-sm leading-relaxed text-foreground/90">
                      <p className="mb-2">Think of quantum computing like a <strong>maze solver</strong>. A classical computer tries one path at a time. A quantum computer explores <em>all paths simultaneously</em>.</p>
                      <p className="text-muted-foreground text-xs">This is possible through <strong className="text-foreground">qubits</strong> — which can be both 0 and 1 at once (superposition)...</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> 1.2s</span>
                      <span className="flex items-center gap-1"><Search className="w-3 h-3" /> 4 sources</span>
                    </div>
                  </div>
                </motion.div>

                {/* Input mock */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.9 }}
                  className="pt-2"
                >
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-muted/20">
                    <span className="text-sm text-muted-foreground/50 flex-1">Message Lexa...</span>
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                      <ArrowRight className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="flex justify-center mt-16"
        >
          <motion.button
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </section>

      {/* ──────── Stats ──────── */}
      <section id="stats" className="py-16 px-4 border-y border-border/40">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <FadeIn key={i} delay={i * 0.08} className="text-center">
              <div className="text-3xl md:text-4xl font-bold tracking-tight mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ──────── Features ──────── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Features</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need,<br />nothing you don't
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Powerful AI capabilities designed to help you think faster, create better, and work smarter.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div className="group p-6 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-md cursor-default h-full">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── Models ──────── */}
      <section id="models" className="py-24 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">AI Models</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Powered by the world's best AI
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Access multiple state-of-the-art models through a single, unified interface.
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MODELS.map((model, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="p-4 rounded-xl border border-border bg-card text-center hover:shadow-md transition-all duration-200 cursor-default">
                  <span className={cn("inline-block text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border mb-3", model.color)}>
                    {model.badge}
                  </span>
                  <h3 className="font-semibold text-sm">{model.name}</h3>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── Pricing ──────── */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Pricing</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Start free, upgrade when you need more.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRICING.map((plan, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className={cn(
                  "relative p-6 rounded-xl border h-full flex flex-col",
                  plan.highlighted 
                    ? "border-primary bg-primary/[0.03] shadow-lg shadow-primary/5" 
                    : "border-border bg-card"
                )}>
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-medium uppercase tracking-wider px-3 py-0.5 rounded-full bg-primary text-primary-foreground">
                      Popular
                    </span>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={handleGetStarted}
                    variant={plan.highlighted ? "default" : "outline"} 
                    className="w-full rounded-lg h-10"
                  >
                    {plan.cta}
                  </Button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── Final CTA ──────── */}
      <section className="py-24 px-4">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center p-12 md:p-16 rounded-2xl bg-foreground text-background relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Ready to work smarter?
              </h2>
              <p className="text-background/70 text-lg mb-8 max-w-lg mx-auto">
                Join thousands of professionals using Lexa AI every day. Start for free.
              </p>
              <Button size="lg" onClick={handleGetStarted} className="bg-background text-foreground hover:bg-background/90 h-12 px-8 rounded-xl text-base font-medium">
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ──────── Footer ──────── */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-background" />
                </div>
                <span className="font-semibold">Lexa AI</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                The most advanced AI assistant built for professionals.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "Models", "Pricing", "Changelog"] },
              { title: "Resources", links: ["Documentation", "API", "Blog", "Community"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security"] },
            ].map((group) => (
              <div key={group.title}>
                <h4 className="font-medium text-sm mb-3">{group.title}</h4>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Lexa AI. All rights reserved.</p>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
