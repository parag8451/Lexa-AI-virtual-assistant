import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, MessageSquare, Globe, Mic, Brain, 
  Image, Zap, ChevronDown, Bot,
  Sparkles, Lock, Code2, Search, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useSEO } from "@/hooks/useSEO";

// GSAP Imports
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ─── Data ─── */
const FEATURES = [
  { icon: MessageSquare, title: "Smart AI Conversations", description: "Context-aware AI virtual assistant that remembers your preferences, adapts to your writing style, and handles complex reasoning tasks seamlessly." },
  { icon: Globe, title: "Real-time Web Search", description: "Access live information with verified citations. Lexa AI browses the web to give you up-to-date answers for research and fact-checking." },
  { icon: Mic, title: "Voice AI Interactions", description: "Natural voice interactions with lightning-fast speech recognition. Speak to your AI assistant just like a human." },
  { icon: Brain, title: "Persistent Memory Workspace", description: "An AI that learns your interests for deeply personalized, continuous conversations across your entire productivity workspace." },
  { icon: Image, title: "Image & Video Generation", description: "Create stunning visuals with DALL-E 3 and generate cinematic AI videos seamlessly from text prompts within your dashboard." },
  { icon: Code2, title: "Advanced Code Generation", description: "Write, debug, and explain complex code across dozens of programming languages. A perfect AI assistant for developers." },
];

const MODELS = [
  { name: "GPT-4o", badge: "OpenAI", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  { name: "Gemini 1.5 Pro", badge: "Google", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  { name: "Claude 3.5 Sonnet", badge: "Anthropic", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { name: "Lexa Ultra", badge: "Custom AI", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" },
];

const FAQS = [
  { question: "What is Lexa AI?", answer: "Lexa AI is an intelligent virtual assistant designed for professionals. It combines the world's most advanced AI models, web search capabilities, and multimodal tools (voice, image, and video generation) into a single, unified workspace." },
  { question: "Who is Lexa AI for?", answer: "Lexa AI is built for professionals, developers, creators, and researchers who need a powerful AI productivity tool to automate tasks, write code, analyze data, and generate content faster." },
  { question: "Which AI models can I use?", answer: "With Lexa AI, you get access to multiple top-tier models including OpenAI's GPT-4o, Google's Gemini 1.5 Pro, and Anthropic's Claude 3.5 Sonnet, allowing you to choose the best intelligence for your specific task." },
  { question: "Does Lexa AI support web search?", answer: "Yes, Lexa AI features real-time web search capabilities. It browses the internet to provide you with the most up-to-date information, complete with verified citations and source links." },
  { question: "Can Lexa AI generate images and videos?", answer: "Absolutely. Our platform integrates advanced image generation models (like DALL-E 3) and AI video generation tools natively into your chat interface." },
  { question: "How do I get started?", answer: "You can get started completely free by clicking 'Start Building Free'. Create an account and immediately access our powerful AI tools." }
];

const STATS = [
  { value: "5M+", label: "Messages processed" },
  { value: "99.9%", label: "Uptime guarantee" },
  { value: "50+", label: "AI Models supported" },
  { value: "<1s", label: "Average response time" },
];

const PRICING = [
  { name: "Free", price: "$0", period: "forever", description: "Get started with AI", features: ["100 messages/day", "GPT-4o mini", "Web search", "Voice input"], cta: "Start Free", highlighted: false },
  { name: "Pro", price: "$20", period: "/month", description: "For power users", features: ["Unlimited messages", "All premium models", "Image & video generation", "Priority support", "Custom instructions"], cta: "Upgrade to Pro", highlighted: true },
  { name: "Team", price: "$15", period: "/user/month", description: "For organizations", features: ["Everything in Pro", "Shared workspaces", "Admin dashboard", "SSO & SAML", "API access"], cta: "Contact Sales", highlighted: false },
];

/* ─── Typing Effect for Chat Preview ─── */
function TypingText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState("");
  const [started, setStarted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);
  
  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [started, text]);
  
  return (
    <span>
      {displayText}
      {started && displayText.length < text.length && (
        <span className="inline-block w-[2px] h-[14px] bg-primary/60 ml-[1px] animate-pulse" />
      )}
    </span>
  );
}

/* ─── Landing Page ─── */
export default function Landing() {
  useSEO({
    title: "Lexa AI - The Intelligent Assistant for Professionals",
    description: "Chat with the world's most powerful AI models. A sleek, powerful, and natural interface for everything you need.",
    canonicalUrl: "/",
  });

  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  // Increase background video speed
  useEffect(() => {
    if (bgVideoRef.current) {
      bgVideoRef.current.playbackRate = 2.0;
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setIsAuthenticated(true);
    });
  }, []);

  const handleGetStarted = () => navigate(isAuthenticated ? "/chat" : "/auth");

  // GSAP Animations
  useGSAP(() => {
    // 1. Initial Load Hero Timeline
    const tl = gsap.timeline();

    tl.fromTo(".hero-badge", 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2 }
    )
    .to(".hero-char", 
      { display: "inline-block", duration: 0.01, stagger: 0.08 },
      "-=0.2"
    )
    .fromTo(".hero-subtitle", 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
      "-=0.2"
    )
    .fromTo(".hero-ctas", 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      "-=0.8"
    )
    .fromTo(".hero-chat-preview", 
      { opacity: 0, y: 80, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "expo.out" },
      "-=0.6"
    );

    // 2. Parallax Hero Scrub
    gsap.to(".hero-chat-preview", {
      y: 100,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: 1,
      }
    });

    gsap.to(".hero-content-wrapper", {
      y: 50,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });

    // 3. Reveal Stats (Staggered)
    gsap.fromTo(".stat-item", 
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        stagger: 0.1, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".stats-section",
          start: "top 85%",
        }
      }
    );

    // 4. Reveal Features using ScrollTrigger batch
    ScrollTrigger.batch(".feature-card", {
      onEnter: (elements) => {
        gsap.fromTo(elements, 
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", overwrite: true }
        );
      },
      start: "top 85%",
    });

    // 5. Reveal Models
    gsap.fromTo(".model-card", 
      { opacity: 0, scale: 0.95, y: 20 },
      { 
        opacity: 1, 
        scale: 1,
        y: 0, 
        duration: 0.6, 
        stagger: 0.05, 
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: ".models-section",
          start: "top 85%",
        }
      }
    );

    // 6. Pricing Cards
    ScrollTrigger.batch(".pricing-card", {
      onEnter: (elements) => {
        gsap.fromTo(elements, 
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out", overwrite: true }
        );
      },
      start: "top 80%",
    });

    // 7. Progress Bar
    gsap.to(".scroll-progress", {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
      }
    });

  }, { scope: containerRef });

  return (
    <main ref={containerRef} className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary/20">
      
      {/* ──────── Header ──────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="absolute bottom-0 left-0 h-[1px] bg-primary/80 scroll-progress w-0" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-foreground flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-background" />
            </div>
            <span className="text-xl font-bold tracking-tight">Lexa</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {["Features", "Models", "Pricing"].map((item) => (
              <button
                key={item}
                onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/chat")} className="rounded-full h-10 px-5 font-medium shadow-sm transition-transform active:scale-95">
                Open Chat <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")} className="hidden sm:flex rounded-full h-10 text-sm font-medium">
                  Log in
                </Button>
                <Button onClick={() => navigate("/auth")} className="rounded-full h-10 px-5 font-medium shadow-sm transition-transform active:scale-95">
                  Get Started <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ──────── Hero Section ──────── */}
      <section className="hero-section relative pt-40 pb-20 px-4 flex flex-col items-center justify-center min-h-[90vh] overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
          <video 
            ref={bgVideoRef}
            autoPlay 
            loop 
            muted 
            playsInline
            preload="metadata"
            poster="/icon-512.png"
            className="w-full h-full object-cover opacity-90 scale-125 blur-3xl pointer-events-none contrast-150 -translate-y-64"
          >
            <source src="/videos/animation.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Top and bottom fade for seamless blending */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black via-black/50 via-40% to-background pointer-events-none" />
        
        <div className="hero-content-wrapper relative z-20 max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-muted/30 backdrop-blur-md text-xs font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-muted-foreground">Intelligence, redefined.</span>
          </div>

          {/* Staggered Heading */}
          <div className="w-full flex justify-center mb-8 px-4 md:px-10" style={{ perspective: "1000px" }}>
            <h1 
              className="text-6xl sm:text-7xl md:text-[6rem] lg:text-[7.5rem] text-white font-medium tracking-tight leading-[1.05] text-center"
              style={{ fontFamily: "'Google Sans', sans-serif", minHeight: "2.2em" }}
            >
              <div className="hero-title-line text-[#346bf1]">
                {"Your Intelligent".split("").map((char, i) => (
                  <span key={`l1-${i}`} className="hero-char hidden">{char === " " ? "\u00A0" : char}</span>
                ))}
              </div>
              <div className="hero-title-line flex justify-center items-center">
                {"AI Assistant".split("").map((char, i) => (
                  <span key={`l2-${i}`} className={`hero-char hidden ${i < 2 ? "text-[#346bf1]" : ""}`}>
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
                <span className="inline-block w-[0.1em] h-[0.9em] bg-white ml-2 animate-pulse rounded-sm" />
              </div>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="hero-subtitle text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Lexa is your personal AI workspace. Powered by the world's most advanced models, 
            designed with meticulous attention to detail. Seamlessly switch between writing, 
            coding, and creating.
          </p>

          {/* CTAs */}
          <div className="hero-ctas flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Button size="lg" onClick={handleGetStarted} className="w-full sm:w-auto h-14 px-8 text-base rounded-full font-medium shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95">
              Start Building Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto h-14 px-8 text-base rounded-full border-border/60 hover:bg-muted/50 transition-colors">
              Explore Features
            </Button>
          </div>
        </div>

        {/* Chat Preview (Premium design) */}
        <div className="hero-chat-preview relative mt-20 w-full max-w-4xl mx-auto" style={{ perspective: "1200px" }}>
          {/* Subtle glow */}
          <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-2xl opacity-50 pointer-events-none" />
          
          <div className="relative bg-background border border-border/40 rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-white/5">
            {/* Minimalist Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/10 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-border" />
                <div className="w-3 h-3 rounded-full bg-border" />
                <div className="w-3 h-3 rounded-full bg-border" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 text-xs font-medium text-muted-foreground">
                <Lock className="w-3 h-3" /> lexa-ai.com
              </div>
              <div className="w-16" /> {/* spacer */}
            </div>

            {/* Chat Body */}
            <div className="p-6 md:p-8 space-y-6 bg-gradient-to-b from-muted/5 to-background min-h-[340px]">
              {/* User message */}
              <div className="flex justify-end">
                <div className="max-w-[80%] px-5 py-3.5 rounded-3xl rounded-tr-sm bg-muted text-foreground text-[15px] font-medium shadow-sm border border-border/40">
                  <TypingText text="Generate a React component for a highly animated data dashboard using GSAP." delay={1.5} />
                </div>
              </div>

              {/* AI response */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-foreground flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-5 h-5 text-background" />
                </div>
                <div className="space-y-3 flex-1 pt-1">
                  <div className="text-[15px] leading-relaxed text-muted-foreground">
                    <p className="mb-3 text-foreground font-medium">I can help with that. Here is a sophisticated, GSAP-powered dashboard layout with staggering entrance animations.</p>
                    
                    {/* Fake Code Block */}
                    <div className="rounded-xl bg-[#0d1117] border border-white/10 overflow-hidden mt-3 shadow-inner">
                      <div className="flex items-center px-4 py-2 border-b border-white/10 bg-black/40 text-xs font-mono text-zinc-400">
                        Dashboard.tsx
                      </div>
                      <div className="p-4 font-mono text-xs text-zinc-300 space-y-1">
                        <div><span className="text-pink-400">import</span> {'{'} useGSAP {'}'} <span className="text-pink-400">from</span> <span className="text-green-300">"@gsap/react"</span>;</div>
                        <div><span className="text-pink-400">import</span> gsap <span className="text-pink-400">from</span> <span className="text-green-300">"gsap"</span>;</div>
                        <br/>
                        <div><span className="text-pink-400">export default function</span> <span className="text-blue-300">Dashboard</span>() {'{'}</div>
                        <div className="pl-4 text-zinc-500">{"// GSAP timeline logic goes here"}</div>
                        <div>{'}'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground pt-2">
                    <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" /> 0.8s</span>
                    <span className="flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5" /> React / GSAP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-6 h-6 text-muted-foreground/30 animate-bounce" />
        </div>
      </section>

      {/* ──────── Stats Section ──────── */}
      <section id="stats" className="stats-section py-20 px-4 border-y border-border/20 bg-muted/10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-4">
          {STATS.map((stat, i) => (
            <div key={i} className="stat-item text-center">
              <div className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">{stat.value}</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────── Features ──────── */}
      <section id="features" className="py-32 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
              Designed for depth.<br />Built for speed.
            </h2>
            <p className="text-xl text-muted-foreground font-light leading-relaxed">
              Every detail is meticulously crafted to stay out of your way, giving you a seamless, distraction-free environment to do your best work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="feature-card p-8 rounded-3xl border border-border/40 bg-card hover:bg-muted/30 transition-colors duration-300 h-full">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-light">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── Models ──────── */}
      <section id="models" className="models-section py-32 px-4 bg-muted/20 border-y border-border/20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
            The world's best AI, unified.
          </h2>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto mb-20">
            Don't limit yourself to one provider. Instantly switch between the most capable models on the planet.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {MODELS.map((model, i) => (
              <div key={i} className="model-card p-6 rounded-3xl border border-border/40 bg-background shadow-sm hover:shadow-md transition-shadow">
                <span className={cn("inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border mb-4", model.color)}>
                  {model.badge}
                </span>
                <h3 className="font-bold text-lg tracking-tight">{model.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── Pricing ──────── */}
      <section id="pricing" className="py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
              Simple, transparent pricing.
            </h2>
            <p className="text-xl text-muted-foreground font-light max-w-xl mx-auto">
              Start completely free. Upgrade when you need the power of premium models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING.map((plan, i) => (
              <div key={i} className={cn(
                "pricing-card p-8 rounded-[2.5rem] border flex flex-col transition-all duration-300",
                plan.highlighted 
                  ? "border-primary/50 bg-primary/[0.02] shadow-2xl shadow-primary/10 relative" 
                  : "border-border/40 bg-card hover:border-border"
              )}>
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-primary text-primary-foreground shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold tracking-tight mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground font-light mb-6">{plan.description}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl font-bold tracking-tighter">{plan.price}</span>
                    <span className="text-muted-foreground font-medium">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={handleGetStarted}
                  variant={plan.highlighted ? "default" : "outline"} 
                  className={cn("w-full rounded-full h-12 text-base font-medium", plan.highlighted ? "shadow-lg shadow-primary/25" : "")}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── FAQ Section ──────── */}
      <section id="faq" className="py-24 px-4 border-y border-border/20 bg-muted/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg font-light">Everything you need to know about Lexa AI.</p>
          </div>
          <div className="grid gap-6">
            {FAQS.map((faq, i) => (
              <article key={i} className="p-6 rounded-2xl bg-background border border-border/40 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-foreground">{faq.question}</h3>
                <p className="text-muted-foreground font-light leading-relaxed">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── Final CTA ──────── */}
      <section className="py-24 px-4 pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-[3rem] bg-foreground text-background p-12 md:p-20 text-center overflow-hidden">
            {/* Subtle light effect */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
                Ready to transform your workflow?
              </h2>
              <p className="text-background/70 text-xl font-light mb-10 max-w-2xl mx-auto">
                Join thousands of forward-thinking professionals building the future with Lexa AI today.
              </p>
              <Button size="lg" onClick={handleGetStarted} className="bg-background text-foreground hover:bg-background/90 h-14 px-10 rounded-full text-lg font-semibold shadow-2xl transition-transform active:scale-95">
                Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── Footer ──────── */}
      <footer className="border-t border-border/40 py-16 px-4 bg-muted/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-foreground flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-background" />
                </div>
                <span className="font-bold tracking-tight text-xl">Lexa</span>
              </div>
              <p className="text-muted-foreground font-light max-w-sm leading-relaxed">
                The most advanced, beautifully designed AI assistant built for modern professionals.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "Models", "Pricing", "Changelog"] },
              { title: "Resources", links: ["Documentation", "API", "Blog", "Community"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
            ].map((group) => (
              <div key={group.title}>
                <h4 className="font-semibold text-foreground mb-4">{group.title}</h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground font-medium">
            <p>© {new Date().getFullYear()} Lexa AI. All rights reserved.</p>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
