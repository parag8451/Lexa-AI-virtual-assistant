import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight, MessageSquare, Globe, Mic, Brain,
  Image, Zap, ChevronDown, Bot,
  Sparkles, Lock, Code2, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useSEO } from "@/hooks/useSEO";
import Lanyard from "@/components/ui/Lanyard";
import { HeroTypingText } from "@/components/ui/HeroTypingText";

// GSAP Imports
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LogoIcon } from '@/components/ui/LogoIcon';

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
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);

  // Keep the original cinematic blue wave treatment, but clean up GSAP on unmount
  // and avoid extra positional motion for users who prefer reduced motion.
  useEffect(() => {
    const video = bgVideoRef.current;
    if (!video) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    video.playbackRate = prefersReducedMotion ? 1 : 3.5;

    if (prefersReducedMotion) return;

    const horizontalTween = gsap.fromTo(
      video,
      { x: "-12vw" },
      { x: "12vw", duration: 10, ease: "none", yoyo: true, repeat: -1 },
    );
    const verticalTween = gsap.fromTo(
      video,
      { y: "-4vh" },
      { y: "4vh", duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 },
    );

    return () => {
      horizontalTween.kill();
      verticalTween.kill();
      gsap.set(video, { clearProps: "transform" });
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) setIsAuthenticated(Boolean(session?.user));
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setIsAuthenticated(Boolean(session?.user));
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleGetStarted = () => navigate(isAuthenticated ? "/chat" : "/auth");

  const dismissIntro = () => setIsIntroVisible(false);

  const replayIntro = () => {
    const video = introVideoRef.current;
    setIsIntroVisible(true);
    if (!video) return;
    video.currentTime = 0;
    void video.play().catch(() => undefined);
  };

  useEffect(() => {
    const timer = window.setTimeout(dismissIntro, 5200);
    return () => window.clearTimeout(timer);
  }, []);

  // GSAP Animations
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // 1. Initial Load Hero Timeline
    const tl = gsap.timeline();

    tl.fromTo(".hero-badge",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2 }
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

      {/* ──────── Cinematic Lexa Intro ──────── */}
      <div
        className={cn(
          "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black transition-opacity duration-700",
          isIntroVisible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!isIntroVisible}
      >
        <video
          ref={introVideoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={dismissIntro}
          className="absolute inset-0 h-full w-full object-cover"
          poster="/icon-512.png"
        >
          <source src="/videos/Scene-1-Cinematic.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-black/70" />
        <div className="relative z-10 ml-auto mr-8 max-w-xs text-right text-white sm:mr-16 md:mr-24">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">A new intelligence layer</p>
          <p className="text-2xl font-semibold tracking-[-0.04em] sm:text-4xl">Think deeper.<br />Move faster.</p>
          <button onClick={dismissIntro} className="mt-7 rounded-full border border-white/25 bg-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/70 backdrop-blur transition hover:border-white/60 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            Enter Lexa <ArrowRight className="ml-1 inline h-3 w-3" />
          </button>
        </div>
        <button onClick={dismissIntro} aria-label="Skip cinematic intro" className="absolute bottom-6 right-6 z-10 rounded-full border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-white/45 transition hover:border-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          Skip intro
        </button>
      </div>

      {/* ──────── Header ──────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="absolute bottom-0 left-0 h-[1px] bg-primary/80 scroll-progress w-0" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoIcon className="w-8 h-8 rounded-xl" />
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
              <MagneticButton strength={20}>
                <InteractiveHoverButton onClick={() => navigate("/chat")} className="rounded-full h-10 px-5 font-medium shadow-sm transition-transform active:scale-95">
                  Open Chat <ArrowRight className="w-4 h-4 ml-1.5" />
                </InteractiveHoverButton>
              </MagneticButton>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")} className="hidden sm:flex rounded-full h-10 text-sm font-medium">
                  Log in
                </Button>
                <MagneticButton strength={20}>
                  <InteractiveHoverButton onClick={() => navigate("/auth")} className="rounded-full h-10 px-5 font-medium shadow-sm transition-transform active:scale-95">
                    Get Started <ArrowRight className="w-4 h-4 ml-1.5" />
                  </InteractiveHoverButton>
                </MagneticButton>
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
            aria-hidden="true"
            className="w-full h-full object-cover opacity-60 scale-x-[1.75] scale-y-[1.3] blur-[60px] pointer-events-none contrast-125 mix-blend-screen"
          >
            <source src="/videos/animation.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Colorizer to turn the white/gray waves into pure blue gas */}
        <div className="absolute inset-0 z-10 bg-[#346bf1] mix-blend-color opacity-60 pointer-events-none" />

        {/* Top and bottom fade for seamless blending into the black background */}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-black via-transparent via-50% to-black pointer-events-none" />

        <div className="hero-content-wrapper relative z-20 max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-muted/30 backdrop-blur-md text-xs font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-muted-foreground">Intelligence, redefined.</span>
            <button onClick={replayIntro} className="ml-1 rounded-full border border-border/50 px-2 py-0.5 text-[10px] text-muted-foreground transition hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Replay cinematic Lexa intro">
              Replay intro
            </button>
          </div>

          {/* Staggered Heading */}
          <div className="w-full flex justify-center mb-8 px-4 md:px-10" style={{ perspective: "1000px" }}>
            <HeroTypingText />
          </div>

          {/* Subtitle */}
          <p className="hero-subtitle text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Lexa is your personal AI workspace. Powered by the world's most advanced models,
            designed with meticulous attention to detail. Seamlessly switch between writing,
            coding, and creating.
          </p>

          {/* CTAs */}
          <div className="hero-ctas flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <MagneticButton strength={30}>
              <InteractiveHoverButton size="lg" onClick={handleGetStarted} className="w-full sm:w-auto h-14 px-8 text-base rounded-full font-medium shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95">
                Start Building Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </InteractiveHoverButton>
            </MagneticButton>
            <InteractiveHoverButton variant="outline" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto h-14 px-8 text-base rounded-full border-border/60 hover:bg-muted/50 transition-colors">
              Explore Features
            </InteractiveHoverButton>
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
                        <br />
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
                <InteractiveHoverButton
                  onClick={handleGetStarted}
                  variant={plan.highlighted ? "default" : "outline"}
                  className={cn("w-full rounded-full h-12 text-base font-medium", plan.highlighted ? "shadow-lg shadow-primary/25" : "")}
                >
                  {plan.cta}
                </InteractiveHoverButton>
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
              <MagneticButton strength={40}>
                <InteractiveHoverButton size="lg" onClick={handleGetStarted} className="bg-background text-foreground hover:bg-background/90 h-14 px-10 rounded-full text-lg font-semibold shadow-2xl transition-transform active:scale-95">
                  Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
                </InteractiveHoverButton>
              </MagneticButton>
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
                <LogoIcon className="w-8 h-8 rounded-xl" />
                <span className="font-bold tracking-tight text-xl">Lexa</span>
              </div>
              <p className="text-muted-foreground font-light max-w-sm leading-relaxed text-sm">
                The most advanced, beautifully designed AI assistant built for modern professionals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Product</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#models" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                    Models
                  </a>
                </li>
                <li>
                  <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Company</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground font-medium">
            <p>© {new Date().getFullYear()} Lexa AI. All rights reserved.</p>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs">
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
