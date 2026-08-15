import { useState, useEffect, useRef, useCallback } from "react";
import type { RefObject } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight, MessageSquare, Globe, Mic, Brain,
  Image as ImageIcon, Zap, Bot,
  Lock, Code2, Check, Sparkles, Terminal, Activity,
  Cpu, Layers, ShieldCheck, ChevronRight, ChevronDown

} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useSEO } from "@/hooks/useSEO";
import { HeroTypingText } from "@/components/ui/HeroTypingText";

// GSAP Imports
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LogoIcon } from "@/components/ui/LogoIcon";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ─── Data ─── */
const FEATURES = [
  {
    id: "smart-ai",
    icon: MessageSquare,
    tag: "COGNITIVE CORE",
    title: "Smart AI Conversations",
    description: "Context-aware AI virtual assistant that remembers your preferences, adapts to your writing style, and handles complex reasoning tasks seamlessly.",
    preview: {
      type: "chat",
      prompt: "Synthesize quarterly metrics with multi-perspective analysis.",
      badge: "Deep Reasoning Mode",
      status: "Adaptive Context Active",
    }
  },
  {
    id: "web-search",
    icon: Globe,
    tag: "LIVE TELEMETRY",
    title: "Real-time Web Search",
    description: "Access live information with verified citations. Lexa AI browses the web to give you up-to-date answers for research and fact-checking.",
    preview: {
      type: "search",
      query: "global market trends Q3 live feeds",
      sources: ["Bloomberg Terminal", "Reuters API", "ArXiv Research"],
      status: "Verified 24ms ago",
    }
  },
  {
    id: "voice-ai",
    icon: Mic,
    tag: "ACOUSTIC SYNTHESIS",
    title: "Voice AI Interactions",
    description: "Natural voice interactions with lightning-fast speech recognition. Speak to your AI assistant just like a human.",
    preview: {
      type: "audio",
      waveform: [35, 60, 95, 45, 80, 100, 50, 75, 40, 90, 60, 30, 85, 45, 95],
      latency: "85ms Response Latency",
      status: "Neural Voice Stream Active",
    }
  },
  {
    id: "memory-workspace",
    icon: Brain,
    tag: "NEURAL GRAPH",
    title: "Persistent Memory Workspace",
    description: "An AI that learns your interests for deeply personalized, continuous conversations across your entire productivity workspace.",
    preview: {
      type: "memory",
      nodes: ["Design Systems", "TypeScript Architecture", "Brand Guidelines", "User Preferences"],
      status: "12,480 Tokens In Long-term Index",
    }
  },
  {
    id: "image-video",
    icon: ImageIcon,
    tag: "GENERATIVE MATRIX",
    title: "Image & Video Generation",
    description: "Create stunning visuals with DALL-E 3 and generate cinematic AI videos seamlessly from text prompts within your dashboard.",
    preview: {
      type: "render",
      resolution: "4K Cinema DCI",
      aspectRatio: "21:9 Widescreen",
      status: "Diffusion Pipeline Ready",
    }
  },
  {
    id: "code-gen",
    icon: Code2,
    tag: "SYNTACTIC ENGINE",
    title: "Advanced Code Generation",
    description: "Write, debug, and explain complex code across dozens of programming languages. A perfect AI assistant for developers.",
    preview: {
      type: "code",
      snippet: "const stream = await lexa.neural.pipeline({ target: 'production' });",
      status: "Zero Compiler Warnings",
    }
  },
];

const MODELS = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    badge: "Omni Engine",
    spec: "128k Context",
    speed: "Instantaneous",
    strengths: "Complex reasoning, multimodal synthesis, natural dialogue",
    latency: "320ms",
    tier: "Tier 1 Flagship"
  },
  {
    id: "gemini-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    badge: "Long Context",
    spec: "2M Context",
    speed: "High Velocity",
    strengths: "Massive document parsing, video analysis, code generation",
    latency: "290ms",
    tier: "Tier 1 Multimodal"
  },
  {
    id: "claude-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    badge: "Coding Titan",
    spec: "200k Context",
    speed: "Precision Stream",
    strengths: "Nuanced writing, complex software architecture, deep logic",
    latency: "310ms",
    tier: "Tier 1 Reasoning"
  },
  {
    id: "lexa-ultra",
    name: "Lexa Ultra",
    provider: "Custom AI",
    badge: "Neural Orchestrator",
    spec: "Adaptive Mesh",
    speed: "Sub-Second",
    strengths: "Multi-model ensemble voting, autonomous workflow routing",
    latency: "190ms",
    tier: "Lexa Proprietary"
  },
];

const FAQS = [
  {
    question: "What is Lexa AI?",
    answer: "Lexa AI is an intelligent virtual assistant designed for professionals. It combines the world's most advanced AI models, web search capabilities, and multimodal tools (voice, image, and video generation) into a single, unified cinematic workspace."
  },
  {
    question: "Who is Lexa AI for?",
    answer: "Lexa AI is built for professionals, developers, creators, and researchers who need a powerful AI productivity tool to automate tasks, write code, analyze data, and generate content faster."
  },
  {
    question: "Which AI models can I use?",
    answer: "With Lexa AI, you get access to multiple top-tier models including OpenAI's GPT-4o, Google's Gemini 1.5 Pro, and Anthropic's Claude 3.5 Sonnet, allowing you to choose the best intelligence for your specific task."
  },
  {
    question: "Does Lexa AI support web search?",
    answer: "Yes, Lexa AI features real-time web search capabilities. It browses the internet to provide you with the most up-to-date information, complete with verified citations and source links."
  },
  {
    question: "Can Lexa AI generate images and videos?",
    answer: "Absolutely. Our platform integrates advanced image generation models (like DALL-E 3) and AI video generation tools natively into your chat interface."
  },
  {
    question: "How do I get started?",
    answer: "You can get started completely free by clicking 'Start Building Free'. Create an account and immediately access our powerful AI tools."
  }
];

const DISCOVER_MENU = [
  { label: "Feature Suite", detail: "Explore the cognitive tools", href: "#features", icon: Layers },
  { label: "Intelligence Mesh", detail: "Switch between frontier models", href: "#intelligence", icon: Cpu },
  { label: "Pricing Architecture", detail: "Choose the right access tier", href: "#pricing", icon: Zap },
  { label: "Knowledge Base", detail: "Find concise product answers", href: "#faq", icon: MessageSquare },
] as const;

const STATS = [

  { value: "5M+", label: "Messages Processed", sub: "Global throughput" },
  { value: "99.9%", label: "Uptime SLA", sub: "Enterprise grade" },
  { value: "50+", label: "AI Models Supported", sub: "Unified catalog" },
  { value: "<1s", label: "Average Latency", sub: "Edge accelerated" },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Essential intelligence for personal exploration",
    features: ["100 messages/day", "GPT-4o mini access", "Real-time web search", "Voice speech synthesis", "Community support"],
    cta: "Start Free",
    highlighted: false
  },
  {
    name: "Pro",
    price: "$20",
    period: "/month",
    description: "Directorial power for builders and professionals",
    features: ["Unlimited messages", "All flagship AI models", "DALL-E 3 & Video generation", "Persistent memory graph", "Priority neural routing", "Custom instructions"],
    cta: "Upgrade to Pro",
    highlighted: true
  },
  {
    name: "Team",
    price: "$15",
    period: "/user/month",
    description: "Shared collective intelligence for organizations",
    features: ["Everything in Pro", "Shared team workspaces", "Centralized administrative console", "SSO & enterprise SAML", "Dedicated API keys", "99.9% uptime SLA"],
    cta: "Contact Sales",
    highlighted: false
  },
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
    }, 28);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span>
      {displayText}
      {started && displayText.length < text.length && (
        <span className="inline-block w-[2px] h-[14px] bg-[#346bf1] ml-[2px] animate-pulse" />
      )}
    </span>
  );
}

/* ─── Main Landing Component ─── */
export default function Landing() {
  useSEO({
    title: "Lexa AI - The Intelligent Workspace for Professionals",
    description: "A cinematic AI workspace powered by the world's most capable models. Seamlessly switch between writing, coding, and creating.",
    canonicalUrl: "/",
  });

  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [introPhase, setIntroPhase] = useState<"visible" | "exiting" | "done">("visible");
  const [activeModelIndex, setActiveModelIndex] = useState(0);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const discoverMenuRef = useRef<HTMLDivElement>(null);

  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const introDismissTimerRef = useRef<number | null>(null);
  const introExitTimerRef = useRef<number | null>(null);

  // Background wave drift animation
  useEffect(() => {
    const video = bgVideoRef.current;
    if (!video) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    video.playbackRate = prefersReducedMotion ? 1 : 0.85;

    if (prefersReducedMotion) return;

    const horizontalTween = gsap.fromTo(
      video,
      { x: "-10vw" },
      { x: "10vw", duration: 12, ease: "sine.inOut", yoyo: true, repeat: -1 },
    );
    const verticalTween = gsap.fromTo(
      video,
      { y: "-3vh" },
      { y: "3vh", duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1 },
    );

    return () => {
      horizontalTween.kill();
      verticalTween.kill();
      gsap.set(video, { clearProps: "transform" });
    };
  }, []);

  useEffect(() => {
    if (!isDiscoverOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (discoverMenuRef.current && !discoverMenuRef.current.contains(event.target as Node)) {
        setIsDiscoverOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsDiscoverOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isDiscoverOpen]);

  // Auth listener
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

  const dismissIntro = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e?.currentTarget) {
      e.currentTarget.blur();
    }
    if (introPhase !== "visible") return;
    if (introDismissTimerRef.current !== null) {
      window.clearTimeout(introDismissTimerRef.current);
      introDismissTimerRef.current = null;
    }
    if (introExitTimerRef.current !== null) {
      window.clearTimeout(introExitTimerRef.current);
    }

    introVideoRef.current?.pause();
    setIntroPhase("exiting");

    introExitTimerRef.current = window.setTimeout(() => {
      setIntroPhase("done");
      introExitTimerRef.current = null;
    }, 850);
  }, [introPhase]);

  const scheduleIntroDismiss = useCallback(() => {
    if (introDismissTimerRef.current !== null) {
      window.clearTimeout(introDismissTimerRef.current);
    }
    introDismissTimerRef.current = window.setTimeout(dismissIntro, 30_000);

  }, [dismissIntro]);

  const replayIntro = useCallback(() => {
    const video = introVideoRef.current;
    if (introExitTimerRef.current !== null) {
      window.clearTimeout(introExitTimerRef.current);
      introExitTimerRef.current = null;
    }
    setIntroPhase("visible");
    scheduleIntroDismiss();
    if (!video) return;
    video.currentTime = 0;
    void video.play().catch(() => undefined);
  }, [scheduleIntroDismiss]);

  useEffect(() => {
    scheduleIntroDismiss();
    return () => {
      if (introDismissTimerRef.current !== null) {
        window.clearTimeout(introDismissTimerRef.current);
      }
      if (introExitTimerRef.current !== null) {
        window.clearTimeout(introExitTimerRef.current);
      }
    };
  }, [scheduleIntroDismiss]);

  // GSAP Orchestration
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // 1. Initial Hero Film Reveal
    const heroTl = gsap.timeline({ delay: 0.1 });
    heroTl
      .fromTo(".hero-badge",
        { opacity: 0, y: 30, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1, ease: "expo.out" }
      )
      .fromTo(".hero-headline-wrap",
        { opacity: 0, y: 40, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "expo.out" },
        "-=0.9"
      )
      .fromTo(".hero-subtitle",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.0, ease: "expo.out" },
        "-=0.9"
      )
      .fromTo(".hero-actions",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.0, ease: "expo.out" },
        "-=0.8"
      )
      .fromTo(".hero-monolith",
        { opacity: 0, y: 90, scale: 0.94, filter: "blur(10px)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.4, ease: "expo.out" },
        "-=0.9"
      );

    // 2. Hero Parallax Scrub
    gsap.to(".hero-monolith", {
      y: 120,
      scale: 0.98,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: 1.2,
      }
    });

    // 3. Stats Telemetry Entrance (Horizontal staggered slide)
    gsap.fromTo(".stat-card",
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 1.0,
        stagger: 0.1,
        ease: "expo.out",
        scrollTrigger: {
          trigger: ".stats-section",
          start: "top 85%",
        }
      }
    );

    // 4. Scrollytelling Features (Triggering active feature state on scroll)
    const featureItems = gsap.utils.toArray<HTMLElement>(".feature-story-item");
    featureItems.forEach((item, index) => {
      ScrollTrigger.create({
        trigger: item,
        start: "top center",
        end: "bottom center",
        onEnter: () => setActiveFeatureIndex(index),
        onEnterBack: () => setActiveFeatureIndex(index),
      });
    });

    // 5. Model Switcher Stage Reveal
    gsap.fromTo(".model-stage-card",
      { opacity: 0, y: 50, filter: "blur(8px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: {
          trigger: ".models-section",
          start: "top 80%",
        }
      }
    );

    // 6. Monolithic Pricing Reveal
    gsap.fromTo(".pricing-column",
      { opacity: 0, y: 60, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.1,
        stagger: 0.14,
        ease: "expo.out",
        scrollTrigger: {
          trigger: ".pricing-section",
          start: "top 80%",
        }
      }
    );

    // 7. Scroll Progress Bar Scrub
    gsap.to(".scroll-progress-bar", {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.25,
      }
    });

  }, { scope: containerRef });

  useCinematicEnhancements(containerRef);

  return (
    <main
      ref={containerRef}
      className={cn(
        "lexa-cinematic-film min-h-screen bg-[#000000] text-[#FFFFFF] overflow-x-hidden selection:bg-[#346bf1]/30 selection:text-white font-inter",
        introPhase === "exiting" && "lexa-page-revealing"
      )}
    >
      <style>{`${CINEMATIC_DESIGN_SYSTEM_CSS}\n${LEXA_UI_UX_OVERLAY_CSS}\n${LEXA_AURORA_GAS_CSS}`}</style>
      <CinematicBackdrop />
      <div className="lexa-aurora-gas" aria-hidden="true">
        <span className="lexa-aurora-gas__ribbon lexa-aurora-gas__ribbon--one" />
        <span className="lexa-aurora-gas__ribbon lexa-aurora-gas__ribbon--two" />
        <span className="lexa-aurora-gas__ribbon lexa-aurora-gas__ribbon--three" />
        <span className="lexa-aurora-gas__ribbon lexa-aurora-gas__ribbon--four" />
        <span className="lexa-aurora-gas__cloud lexa-aurora-gas__cloud--blue" />
        <span className="lexa-aurora-gas__cloud lexa-aurora-gas__cloud--violet" />
      </div>

      {/* ──────── 1. Cinematic Video Intro ──────── */}
      {introPhase !== "done" && (
        <div
          className={cn(
            "lexa-cinematic-intro fixed inset-0 z-[100] overflow-hidden bg-[#000000] cursor-pointer",
            introPhase === "exiting" && "lexa-intro-exiting",
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Lexa Cinematic Product Intro"
          onClick={dismissIntro}
        >
          {/* Constrained video showcase */}
          <div className="absolute inset-y-0 left-0 w-full md:w-[62%] flex items-center justify-center p-8 md:p-16 overflow-hidden pointer-events-none">
            {/* Aspect ratio container to crop watermark */}
            <div className="relative w-full max-w-[800px] aspect-video overflow-hidden transform scale-[0.95] rounded-[32px] bg-[#0a0a0a] skeleton-shimmer">
              <video
                ref={introVideoRef}
                autoPlay
                muted
                playsInline
                preload="auto"
                onEnded={() => introVideoRef.current?.pause()}
                className="w-full h-full object-cover object-center transform scale-[1.08] translate-y-[-2%]"
                poster="/icon-512.png"
              >
                <source src="/videos/LEXAINTRO.mp4" type="video/mp4" />
              </video>
            </div>
            {/* Seamless edge fade into pure black */}
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent to-[#000000] pointer-events-none hidden md:block" />
          </div>

          {/* Solid pure black narrative panel */}
          <div className="absolute inset-y-0 right-0 w-full md:w-[42%] bg-gradient-to-t md:bg-gradient-to-l from-[#000000] via-[#000000]/95 to-transparent pointer-events-none" />

          {/* Intro Narrative Content */}
          <div className="lexa-intro-panel absolute right-0 inset-y-0 w-full md:w-[42%] flex flex-col justify-end md:justify-center p-8 md:pl-20 md:pr-12 text-white z-20 pointer-events-auto">
            <div className="inline-flex items-center gap-2 mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-[#346bf1]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#346bf1] animate-pulse" />
              A New Intelligence Layer
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.04em] leading-[1.05] mb-4 text-white">
              Think deeper.<br />Move faster.
            </h1>
            <p className="text-[#F3F4F6] text-sm md:text-base font-light mb-8 max-w-sm">
              Your autonomous AI workspace engineered for developers, creators, and professionals.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={dismissIntro}
                className="rounded-full bg-[#346bf1] hover:bg-[#2c5ad6] text-white px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] font-medium transition-all shadow-[0_1px_2px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#346bf1]"
              >
                Enter Lexa <ArrowRight className="ml-2 inline h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Skip CTA */}
          <button
            onClick={dismissIntro}
            aria-label="Skip intro"
            className="absolute bottom-6 right-6 z-30 rounded-full border border-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#F3F4F6] hover:text-white hover:border-white/30 backdrop-blur-[40px] transition-colors"
          >
            Skip Intro
          </button>
        </div>
      )}

      {/* ──────── 2. Directorial Navigation ──────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/60 backdrop-blur-[40px] border-b border-white/[0.08]">
        {/* Top Scroll Progress Line */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#346bf1] via-[#6e96ff] to-[#346bf1] scroll-progress-bar w-0 shadow-[0_0_12px_#346bf1]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-[16px] bg-[#346bf1]/30 blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
              <LogoIcon className="relative w-6 h-6 rounded-[16px] ring-1 ring-white/10 bg-[#202124] p-1" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white">Lexa</span>
            <span className="hidden sm:inline-block font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-[#346bf1]/10 text-[#6e96ff] border border-[#346bf1]/20">
              v2.4 Pro
            </span>
          </div>

          {/* Nav Anchors */}
          <nav className="hidden md:flex items-center gap-8">
            <div ref={discoverMenuRef} className="relative">
              <button
                type="button"
                aria-expanded={isDiscoverOpen}
                aria-haspopup="menu"
                onClick={() => setIsDiscoverOpen((open) => !open)}
                className={cn(
                  "inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.15em] text-[#F3F4F6] transition-colors",
                  isDiscoverOpen ? "text-white" : "hover:text-white"
                )}
              >
                Discover
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", isDiscoverOpen && "rotate-180 text-[#6e96ff]")} />
              </button>

              <div
                role="menu"
                aria-hidden={!isDiscoverOpen}
                className={cn(
                  "lexa-discover-menu absolute left-1/2 top-[calc(100%+18px)] w-[286px] -translate-x-1/2 origin-top rounded-[24px] border border-white/[0.1] bg-[#191A1F]/95 p-2 shadow-2xl backdrop-blur-[40px] transition-all duration-300",
                  isDiscoverOpen ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-95 opacity-0"
                )}
              >
                <div className="px-3 pb-2 pt-2 font-mono text-[9px] uppercase tracking-[0.24em] text-[#346bf1]">Explore the system</div>
                {DISCOVER_MENU.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      role="menuitem"
                      type="button"
                      onClick={() => {
                        document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" });
                        setIsDiscoverOpen(false);
                      }}
                      className="group flex w-full items-center gap-3 rounded-[18px] p-3 text-left transition-all duration-300 hover:bg-[#346bf1]/10"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-[#346bf1]/20 bg-[#346bf1]/10 text-[#6e96ff] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-sm font-semibold text-white">{item.label}</span>
                        <span className="mt-0.5 block truncate font-sans text-[11px] text-[#F3F4F6]/55">{item.detail}</span>
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#F3F4F6]/35 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#6e96ff]" />
                    </button>
                  );
                })}
              </div>
            </div>
            {[{
              label: "Features", href: "#features"
            }, {
              label: "Intelligence", href: "#intelligence"
            }, {
              label: "Pricing", href: "#pricing"
            }, {
              label: "FAQ", href: "#faq"
            }].map((item) => (
              <button
                key={item.label}
                onClick={() => document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" })}
                className="font-mono text-xs uppercase tracking-[0.15em] text-[#F3F4F6] transition-colors hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <MagneticButton strength={20}>
                <InteractiveHoverButton
                  onClick={() => navigate("/chat")}
                  className="rounded-full h-10 px-5 font-mono text-xs uppercase tracking-wider bg-[#346bf1] text-white shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                >
                  Open Workspace <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </InteractiveHoverButton>
              </MagneticButton>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="rounded-full h-10 px-4 text-xs font-mono uppercase tracking-wider text-[#F3F4F6] hover:text-white hover:bg-white/5"
                >
                  Sign In
                </Button>
                <MagneticButton strength={20}>
                  <InteractiveHoverButton
                    onClick={() => navigate("/auth")}
                    className="rounded-full h-10 px-5 font-mono text-xs uppercase tracking-wider bg-[#346bf1] text-white shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                  >
                    Start Free <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </InteractiveHoverButton>
                </MagneticButton>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ──────── 3. Cinematic Hero Film ──────── */}
      <section className="hero-section relative pt-40 md:pt-48 pb-24 px-4 flex flex-col items-center justify-center min-h-[92vh] overflow-hidden bg-transparent">
        {/* Background Cinematic Energy Wave */}
        <div className="absolute inset-0 z-0 w-full h-full overflow-hidden pointer-events-none">
          <video
            ref={bgVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/icon-512.png"
            aria-hidden="true"
            className="w-full h-full object-cover opacity-50 scale-x-[1.8] scale-y-[1.35] blur-[55px] contrast-125 mix-blend-screen"
          >
            <source src="/videos/LEXAINTRO.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Colorizer matrix converting video to signature #346bf1 blue */}
        <div className="absolute inset-0 z-10 bg-[#346bf1] mix-blend-color opacity-60 pointer-events-none" />

        {/* Edge Vignette */}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-[#000000] via-transparent via-50% to-[#000000] pointer-events-none" />

        <div className="relative z-20 max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Intelligence Badge */}
          <div className="hero-badge inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-[#202124]/40 backdrop-blur-[40px] text-xs font-medium mb-8 shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#346bf1] opacity-80" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#346bf1]" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#F3F4F6]">Intelligence, Redefined</span>
            {introPhase === "done" && (
              <button
                onClick={replayIntro}
                className="ml-2 rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[#F3F4F6] hover:text-white hover:border-[#346bf1]/50 transition-colors"
                aria-label="Replay Lexa intro film"
              >
                Replay Film
              </button>
            )}
          </div>

          {/* Director-Level Title */}
          <div className="hero-headline-wrap w-full flex justify-center mb-8 px-4" style={{ perspective: "1200px" }}>
            <HeroTypingText />
          </div>

          {/* Subtitle */}
          <p className="hero-subtitle font-sans text-lg md:text-xl text-[#F3F4F6] max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Lexa is your personal AI workspace. Powered by the world’s most advanced models,
            designed with meticulous attention to detail. Seamlessly switch between writing,
            coding, and creating.
          </p>

          {/* CTAs */}
          <div className="hero-actions flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <MagneticButton strength={30}>
              <InteractiveHoverButton
                size="lg"
                onClick={handleGetStarted}
                className="w-full sm:w-auto h-14 px-8 text-sm font-mono uppercase tracking-wider rounded-full bg-[#346bf1] text-white shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-all"
              >
                Start Building Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </InteractiveHoverButton>
            </MagneticButton>
            <InteractiveHoverButton
              variant="outline"
              size="lg"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto h-14 px-8 text-sm font-mono uppercase tracking-wider rounded-full border-white/15 bg-[#202124]/40 text-[#F3F4F6] hover:text-white hover:bg-[#28292A] backdrop-blur-[40px] shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
            >
              Explore Features
            </InteractiveHoverButton>
          </div>
        </div>

        {/* ──────── Monolithic Obsidian Chat Preview ──────── */}
        <div className="hero-monolith relative mt-16 md:mt-24 w-full max-w-5xl mx-auto" style={{ perspective: "1400px" }}>
          {/* Blue aura reflection */}
          <div className="absolute -inset-1.5 rounded-[40px] bg-gradient-to-b from-[#346bf1]/20 via-[#346bf1]/5 to-transparent blur-3xl opacity-70 pointer-events-none" />

          <div className="relative bg-[#202124]/90 border border-white/[0.08] rounded-[36px] shadow-2xl overflow-hidden backdrop-blur-[40px] ring-1 ring-white/5">
            {/* Minimalist Top Telemetry Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#191A1F]/80">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#28292A] border border-white/[0.06] font-mono text-[11px] text-[#F3F4F6]">
                <Lock className="w-3 h-3 text-[#346bf1]" />
                <span>lexa-ai.com</span>
                <span className="text-[#F3F4F6]/65">/</span>
                <span className="text-[#6e96ff]">neural-v2</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-[#F3F4F6]/65">
                <span className="w-1.5 h-1.5 rounded-full bg-[#346bf1] animate-pulse" />
                <span className="hidden sm:inline">LIVE</span>
              </div>
            </div>

            {/* Chat Body */}
            <div className="p-6 md:p-10 space-y-6 bg-gradient-to-b from-[#191A1F]/80 to-[#191A1F] min-h-[360px]">
              {/* User message */}
              <div className="flex justify-end">
                <div className="max-w-[85%] sm:max-w-[75%] px-6 py-4 rounded-[24px] rounded-tr-[8px] bg-[#28292A] border border-white/[0.08] text-white text-[15px] font-medium shadow-lg backdrop-blur-[40px]">
                  <TypingText text="Generate an enterprise-grade async workflow orchestrator with neural routing." delay={1.2} />
                </div>
              </div>

              {/* AI Response */}
              <div className="flex gap-4 sm:gap-5">
                <div className="w-10 h-10 rounded-[16px] bg-[#346bf1] flex items-center justify-center shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-4 flex-1 pt-1">
                  <div className="text-[15px] leading-relaxed text-[#F3F4F6]">
                    <p className="font-medium text-white mb-3">
                      Architecting distributed async neural orchestrator. Initialized with multi-model consensus and fallback resilience.
                    </p>

                    {/* Monolithic Code Terminal */}
                    <div className="rounded-[24px] bg-[#202124] border border-white/[0.08] overflow-hidden mt-3 shadow-2xl">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-[#191A1F] font-mono text-xs text-[#F3F4F6]/65">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-[#346bf1]" />
                          <span>orchestrator.ts</span>
                        </div>
                        <span className="text-[10px] text-[#F3F4F6]/65">TypeScript 5.4</span>
                      </div>
                      <div className="p-4 sm:p-5 font-mono text-xs text-[#F3F4F6] space-y-1.5 overflow-x-auto">
                        <div><span className="text-[#6e96ff]">import</span> {'{'} NeuralRouter, ConsensusEngine {'}'} <span className="text-[#6e96ff]">from</span> <span className="text-[#F3F4F6]/65">"@lexa/core"</span>;</div>
                        <br />
                        <div><span className="text-[#6e96ff]">export const</span> <span className="text-white font-semibold">pipeline</span> = <span className="text-[#346bf1]">new</span> NeuralRouter({'{'}</div>
                        <div className="pl-4 text-[#F3F4F6]/65">models: [<span className="text-emerald-400">"gpt-4o"</span>, <span className="text-emerald-400">"claude-3.5-sonnet"</span>, <span className="text-emerald-400">"gemini-1.5-pro"</span>],</div>
                        <div className="pl-4 text-[#F3F4F6]/65">strategy: <span className="text-emerald-400">"latency-optimized-consensus"</span>,</div>
                        <div className="pl-4 text-[#F3F4F6]/65">stream: <span className="text-amber-400">true</span></div>
                        <div>{'}'});</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#F3F4F6]/65 pt-2 border-t border-white/[0.04]">
                    <span className="flex items-center gap-1.5 text-[#F3F4F6]">
                      <Zap className="w-3.5 h-3.5 text-[#346bf1]" /> 0.8s Latency
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#346bf1]" /> 3 Models Ensembled
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Output
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wrap rest of the content in Stitch's #191A1F Frame Fill */}
      <div className="bg-[#191A1F] relative z-10 w-full pt-12 pb-24">
        {/* ──────── 4. Editorial Stats Film Strip ──────── */}
        <section id="stats" className="stats-section py-20 px-4 border-y border-white/[0.06] bg-[#202124] relative overflow-hidden max-w-[1536px] mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#346bf1]/[0.03] to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {STATS.map((stat, i) => (
              <div key={i} className="stat-card relative p-6 rounded-[24px] border border-white/[0.04] bg-[#28292A] hover:border-[#346bf1]/30 transition-all group">
                <div className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-2 text-white group-hover:text-[#6e96ff] transition-colors">
                  {stat.value}
                </div>
                <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#F3F4F6]/65 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-[#F3F4F6]/65 font-light">
                  {stat.sub}
                </div>
                <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#346bf1]/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </section>

        {/* ──────── 5. Scrollytelling Features Section ──────── */}
        <section id="features" className="py-32 px-4 relative overflow-hidden max-w-[1536px] mx-auto">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="max-w-3xl mb-24">
              <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#346bf1] mb-4">
                <Layers className="w-3.5 h-3.5" />
                Directorial Feature Suite
              </div>
              <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-[-0.04em] text-white mb-6">
                Designed for depth.<br />Built for speed.
              </h2>
              <p className="text-[#F3F4F6]/65 text-lg font-light leading-relaxed">
                Every tool is engineered as an autonomous extension of your thought process—distraction-free, hyper-responsive, and endlessly extensible.
              </p>
            </div>

            {/* Scrollytelling Layout: Sticky Interactive Left Stage + Scrolling Right Narrative */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              {/* Sticky Left Stage */}
              <div className="lg:col-span-6 lg:sticky lg:top-28">
                <div className="relative rounded-[32px] border border-white/[0.08] bg-[#202124] p-8 md:p-10 shadow-2xl overflow-hidden min-h-[460px] flex flex-col justify-between">
                  {/* Background ambient glow */}
                  <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#346bf1]/15 rounded-full blur-3xl pointer-events-none" />

                  {/* Top Status */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = FEATURES[activeFeatureIndex].icon;
                        return (
                          <div className="w-10 h-10 rounded-[16px] bg-[#346bf1]/10 border border-[#346bf1]/20 flex items-center justify-center text-[#6e96ff]">
                            <Icon className="w-5 h-5" />
                          </div>
                        );
                      })()}
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#346bf1]">
                          {FEATURES[activeFeatureIndex].tag}
                        </div>
                        <div className="font-display font-semibold text-white text-base">
                          {FEATURES[activeFeatureIndex].title}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#28292A] text-[#F3F4F6] border border-white/[0.06]">
                      0{activeFeatureIndex + 1} / 06
                    </span>
                  </div>

                  {/* Dynamic Feature Simulation Canvas */}
                  <div className="my-8 py-6 flex-1 flex flex-col justify-center">
                    {FEATURES[activeFeatureIndex].preview.type === "chat" && (
                      <div className="space-y-3 bg-[#191A1F]/40 p-5 rounded-[24px] border border-white/[0.04]">
                        <div className="text-xs font-mono text-[#F3F4F6]/65 uppercase tracking-widest">Active Context Stream</div>
                        <div className="text-sm font-medium text-white">{FEATURES[activeFeatureIndex].preview.prompt}</div>
                        <div className="inline-flex items-center gap-2 text-xs text-[#6e96ff] font-mono bg-[#346bf1]/10 px-3 py-1 rounded-full border border-[#346bf1]/20">
                          <Sparkles className="w-3 h-3" />
                          {FEATURES[activeFeatureIndex].preview.badge}
                        </div>
                      </div>
                    )}

                    {FEATURES[activeFeatureIndex].preview.type === "search" && (
                      <div className="space-y-4 bg-[#191A1F]/40 p-5 rounded-[24px] border border-white/[0.04]">
                        <div className="flex items-center justify-between text-xs font-mono text-[#F3F4F6]">
                          <span className="text-[#F3F4F6]/65">QUERY:</span>
                          <span className="text-white">{FEATURES[activeFeatureIndex].preview.query}</span>
                        </div>
                        <div className="space-y-2">
                          {FEATURES[activeFeatureIndex].preview.sources?.map((s, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs font-mono p-2 rounded-[16px] bg-[#28292A] border border-white/[0.04]">
                              <span className="text-[#F3F4F6]">{s}</span>
                              <span className="text-emerald-400 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Indexed
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {FEATURES[activeFeatureIndex].preview.type === "audio" && (
                      <div className="space-y-6 bg-[#191A1F]/40 p-6 rounded-[24px] border border-white/[0.04]">
                        <div className="flex items-end justify-center gap-1.5 h-20">
                          {FEATURES[activeFeatureIndex].preview.waveform?.map((height, idx) => (
                            <div
                              key={idx}
                              style={{ height: `${height}%` }}
                              className="w-2 rounded-full bg-gradient-to-t from-[#346bf1] to-[#6e96ff] transition-all duration-300 animate-pulse"
                            />
                          ))}
                        </div>
                        <div className="text-center font-mono text-xs text-[#6e96ff]">
                          {FEATURES[activeFeatureIndex].preview.latency}
                        </div>
                      </div>
                    )}

                    {FEATURES[activeFeatureIndex].preview.type === "memory" && (
                      <div className="grid grid-cols-2 gap-3 bg-[#191A1F]/40 p-5 rounded-[24px] border border-white/[0.04]">
                        {FEATURES[activeFeatureIndex].preview.nodes?.map((node, idx) => (
                          <div key={idx} className="p-3 rounded-[16px] bg-[#346bf1]/[0.04] border border-[#346bf1]/20 font-mono text-xs text-[#F3F4F6] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#346bf1]" />
                            {node}
                          </div>
                        ))}
                      </div>
                    )}

                    {FEATURES[activeFeatureIndex].preview.type === "render" && (
                      <div className="space-y-4 bg-[#191A1F]/40 p-5 rounded-[24px] border border-white/[0.04] text-center">
                        <div className="w-full h-28 rounded-[16px] border border-dashed border-[#346bf1]/40 flex flex-col items-center justify-center bg-[#346bf1]/[0.02]">
                          <ImageIcon className="w-8 h-8 text-[#346bf1] mb-2" />
                          <div className="font-mono text-xs text-[#F3F4F6]">{FEATURES[activeFeatureIndex].preview.resolution}</div>
                        </div>
                        <div className="font-mono text-xs text-[#F3F4F6]/65">
                          Ratio: {FEATURES[activeFeatureIndex].preview.aspectRatio}
                        </div>
                      </div>
                    )}

                    {FEATURES[activeFeatureIndex].preview.type === "code" && (
                      <div className="bg-[#191A1F] p-4 rounded-[24px] border border-white/[0.08] font-mono text-xs text-[#F3F4F6]">
                        <div className="text-[#F3F4F6]/65 mb-2">// Executing hot code generation</div>
                        <div className="text-[#6e96ff]">{FEATURES[activeFeatureIndex].preview.snippet}</div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Telemetry Footer */}
                  <div className="flex items-center justify-between font-mono text-xs text-[#F3F4F6]/65 border-t border-white/[0.06] pt-4">
                    <span className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-[#346bf1]" />
                      {FEATURES[activeFeatureIndex].preview.status}
                    </span>
                    <span className="text-[#346bf1]">READY</span>
                  </div>
                </div>
              </div>

              {/* Scrolling Right Narrative List */}
              <div className="lg:col-span-6 space-y-12 lg:space-y-24 py-8">
                {FEATURES.map((feature, idx) => (
                  <div
                    key={feature.id}
                    className={cn(
                      "feature-story-item p-8 sm:p-10 rounded-[32px] border transition-all duration-500",
                      activeFeatureIndex === idx
                        ? "border-[#346bf1]/50 bg-[#28292A] shadow-2xl shadow-[#346bf1]/10"
                        : "border-white/[0.04] bg-transparent opacity-50 hover:opacity-80"
                    )}
                    onClick={() => setActiveFeatureIndex(idx)}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-mono text-xs text-[#346bf1] font-semibold">0{idx + 1}.</span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#F3F4F6]/65">{feature.tag}</span>
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-[#F3F4F6]/65 leading-relaxed font-light text-base sm:text-lg">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ──────── 6. Signature Moment: Intelligence Stage ──────── */}
        <section id="intelligence" className="models-section py-32 px-4 border-y border-white/[0.06] bg-[#202124] relative overflow-hidden max-w-[1536px] mx-auto">
          {/* Dynamic Blue Energy Field corresponding to model switching */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#346bf1]/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#346bf1] mb-4">
              <Cpu className="w-3.5 h-3.5" />
              Model Intelligence Mesh
            </div>
            <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-[-0.04em] text-white mb-6">
              The world's best AI, unified.
            </h2>
            <p className="text-[#F3F4F6]/65 text-lg font-light max-w-2xl mx-auto mb-16">
              Don't limit yourself to one provider. Instantly switch between the most capable models on the planet with shared memory and context.
            </p>

            {/* Interactive Model Selector Tabs */}
            <div className="inline-flex flex-wrap justify-center gap-2 p-1.5 rounded-full bg-[#28292A] border border-white/[0.08] backdrop-blur-[40px] mb-12 shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              {MODELS.map((model, idx) => (
                <button
                  key={model.id}
                  onClick={() => setActiveModelIndex(idx)}
                  className={cn(
                    "px-5 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-300",
                    activeModelIndex === idx
                      ? "bg-[#346bf1] text-white shadow-lg shadow-[#346bf1]/30 font-medium"
                      : "text-[#F3F4F6]/65 hover:text-white hover:bg-[#191A1F]"
                  )}
                >
                  {model.name}
                </button>
              ))}
            </div>

            {/* Active Model Stage Display */}
            <div className="model-stage-card relative max-w-4xl mx-auto rounded-[32px] border border-white/[0.08] bg-[#191A1F] p-8 sm:p-12 shadow-2xl backdrop-blur-[40px] text-left overflow-hidden">
              {/* Ambient edge glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#346bf1]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-7 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#346bf1]/10 text-[#6e96ff] border border-[#346bf1]/20">
                      {MODELS[activeModelIndex].provider}
                    </span>
                    <span className="font-mono text-xs text-[#F3F4F6]/65">
                      {MODELS[activeModelIndex].tier}
                    </span>
                  </div>

                  <h3 className="font-display text-3xl sm:text-4xl font-bold text-white">
                    {MODELS[activeModelIndex].name}
                  </h3>

                  <p className="text-[#F3F4F6]/65 text-base leading-relaxed font-light">
                    {MODELS[activeModelIndex].strengths}
                  </p>

                  <div className="pt-4 flex flex-wrap items-center gap-6 font-mono text-xs">
                    <div>
                      <div className="text-[#F3F4F6]/65 uppercase tracking-widest text-[10px] mb-1">Context Window</div>
                      <div className="text-white font-medium text-sm">{MODELS[activeModelIndex].spec}</div>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10" />
                    <div>
                      <div className="text-[#F3F4F6]/65 uppercase tracking-widest text-[10px] mb-1">Streaming Latency</div>
                      <div className="text-[#6e96ff] font-medium text-sm">{MODELS[activeModelIndex].latency}</div>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10" />
                    <div>
                      <div className="text-[#F3F4F6]/65 uppercase tracking-widest text-[10px] mb-1">Throughput</div>
                      <div className="text-emerald-400 font-medium text-sm">{MODELS[activeModelIndex].speed}</div>
                    </div>
                  </div>
                </div>

                {/* Right Side Visual Benchmark Matrix */}
                <div className="md:col-span-5 bg-[#202124] rounded-[24px] border border-white/[0.06] p-6 space-y-4 font-mono text-xs">
                  <div className="text-[#F3F4F6]/65 uppercase tracking-widest text-[10px] pb-2 border-b border-white/[0.06] flex items-center justify-between">
                    <span>Capability Metric</span>
                    <span className="text-[#346bf1]">Rank</span>
                  </div>
                  {[
                    { label: "Deep Reasoning", score: "98.4%" },
                    { label: "Code Synthesis", score: "96.2%" },
                    { label: "Context Retention", score: "99.1%" },
                    { label: "Instruction Following", score: "97.8%" }
                  ].map((metric, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-[#F3F4F6] text-[11px]">
                        <span>{metric.label}</span>
                        <span className="text-white font-medium">{metric.score}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#346bf1] to-[#6e96ff] transition-all duration-700"
                          style={{ width: metric.score }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────── 7. Monolithic Pricing Architecture ──────── */}
        <section id="pricing" className="pricing-section py-32 px-4 relative overflow-hidden max-w-[1536px] mx-auto">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#346bf1] mb-4">
                Transparent Access
              </div>
              <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-[-0.04em] text-white mb-6">
                Simple, transparent pricing.
              </h2>
              <p className="text-[#F3F4F6]/65 text-lg font-light leading-relaxed">
                Start completely free. Upgrade when you need the power of unconstrained flagship models.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {PRICING.map((plan, i) => (
                <div
                  key={i}
                  className={cn(
                    "pricing-column relative p-8 sm:p-10 rounded-[36px] border flex flex-col justify-between transition-all duration-500",
                    plan.highlighted
                      ? "border-[#346bf1] bg-gradient-to-b from-[#346bf1]/[0.08] to-transparent shadow-[0_1px_2px_rgba(0,0,0,0.5)] ring-1 ring-[#346bf1]/40"
                      : "border-white/[0.08] bg-[#202124] hover:border-white/20"
                  )}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full bg-[#346bf1] text-white shadow-lg shadow-[#346bf1]/40">
                      Signature Choice
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-2xl font-bold text-white">{plan.name}</h3>
                      {plan.highlighted && (
                        <span className="w-2 h-2 rounded-full bg-[#346bf1] animate-ping" />
                      )}
                    </div>
                    <p className="text-[#F3F4F6]/65 text-sm font-light mb-8">{plan.description}</p>

                    <div className="flex items-baseline gap-2 mb-10 pb-8 border-b border-white/[0.06]">
                      <span className="font-display text-5xl sm:text-6xl font-bold tracking-tight text-white">{plan.price}</span>
                      <span className="font-mono text-xs uppercase tracking-widest text-[#F3F4F6]/65">{plan.period}</span>
                    </div>

                    <ul className="space-y-4 mb-10">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-3.5 text-sm text-[#F3F4F6] font-light">
                          <div className="w-4 h-4 rounded-full bg-[#346bf1]/10 border border-[#346bf1]/30 flex items-center justify-center shrink-0 mt-0.5 text-[#6e96ff]">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <InteractiveHoverButton
                    onClick={handleGetStarted}
                    variant={plan.highlighted ? "default" : "outline"}
                    className={cn(
                      "w-full rounded-full h-12 font-mono text-xs uppercase tracking-wider font-medium transition-all",
                      plan.highlighted
                        ? "bg-[#346bf1] hover:bg-[#2c5ad6] text-white shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                        : "border-white/15 text-[#F3F4F6] hover:text-white hover:bg-white/5"
                    )}
                  >
                    {plan.cta}
                  </InteractiveHoverButton>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────── 8. Editorial FAQ Section ──────── */}
        <section id="faq" className="py-28 px-4 border-y border-white/[0.06] bg-[#202124] relative overflow-hidden max-w-[1536px] mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#346bf1] mb-4">
                Knowledge Base
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-[-0.04em] text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-[#F3F4F6]/65 text-base font-light">
                Everything you need to know about Lexa AI.
              </p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <article
                  key={i}
                  className="rounded-[24px] border border-white/[0.06] bg-[#28292A] overflow-hidden transition-all duration-300 hover:border-white/15"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-display font-semibold text-lg text-white"
                  >
                    <span>{faq.question}</span>
                    <ChevronRight
                      className={cn(
                        "w-5 h-5 text-[#346bf1] transition-transform duration-300 shrink-0",
                        expandedFaq === i && "rotate-90 text-white"
                      )}
                    />
                  </button>
                  {expandedFaq === i && (
                    <div className="px-6 pb-6 text-[#F3F4F6]/65 text-[15.3px] font-light leading-relaxed border-t border-white/[0.04] pt-4">
                      {faq.answer}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ──────── 9. Final Cinematic Act: Portal CTA ──────── */}
        <section className="py-28 px-4 pb-36 relative overflow-hidden max-w-[1536px] mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-[40px] border border-[#346bf1]/30 bg-gradient-to-b from-[#191A1F] to-[#000000] p-12 sm:p-20 text-center overflow-hidden shadow-2xl shadow-[#346bf1]/15">
              {/* Cinematic Radial Portal Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#346bf1]/20 rounded-full blur-[120px] pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#6e96ff] mb-6 px-4 py-1.5 rounded-full bg-[#346bf1]/10 border border-[#346bf1]/20 shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                  <Sparkles className="w-3.5 h-3.5 text-[#346bf1]" />
                  Next Generation Workspace
                </div>

                <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-[-0.04em] text-white mb-6">
                  Ready to transform your workflow?
                </h2>

                <p className="text-[#F3F4F6]/65 text-lg sm:text-xl font-light mb-12 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of forward-thinking professionals building the future with Lexa AI today.
                </p>

                <MagneticButton strength={40}>
                  <InteractiveHoverButton
                    size="lg"
                    onClick={handleGetStarted}
                    className="bg-[#346bf1] hover:bg-[#2c5ad6] text-white h-14 px-10 rounded-full font-mono text-sm uppercase tracking-wider font-semibold shadow-2xl shadow-[#346bf1]/40 transition-all hover:scale-105"
                  >
                    Get Started Now <ArrowRight className="w-4 h-4 ml-2" />
                  </InteractiveHoverButton>
                </MagneticButton>
              </div>
            </div>
          </div>
        </section>

        {/* ──────── 10. Monolithic Footer ──────── */}
        <footer className="border-t border-white/[0.06] py-16 px-4 bg-[#000000]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
              <div className="col-span-2">
                <div className="flex items-center gap-2 shrink-0 mb-4">
                  <LogoIcon className="w-6 h-6 rounded-[16px] ring-1 ring-white/10 bg-[#202124] p-1" />
                  <span className="font-display font-bold tracking-tight text-lg text-white">Lexa</span>
                </div>
                <p className="text-[#F3F4F6]/65 font-light max-w-sm leading-relaxed text-sm">
                  The most advanced, beautifully designed AI assistant built for modern professionals.
                </p>
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-4">Product</h4>
                <ul className="space-y-3">
                  <li>
                    <a href="#features" className="text-[#F3F4F6]/65 hover:text-white transition-colors text-sm font-light">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#intelligence" className="text-[#F3F4F6]/65 hover:text-white transition-colors text-sm font-light">
                      Models
                    </a>
                  </li>
                  <li>
                    <Link to="/pricing" className="text-[#F3F4F6]/65 hover:text-white transition-colors text-sm font-light">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-4">Company</h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/about" className="text-[#F3F4F6]/65 hover:text-white transition-colors text-sm font-light">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-[#F3F4F6]/65 hover:text-white transition-colors text-sm font-light">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-white mb-4">Legal</h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/privacy" className="text-[#F3F4F6]/65 hover:text-white transition-colors text-sm font-light">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-[#F3F4F6]/65 hover:text-white transition-colors text-sm font-light">
                      Terms & Conditions
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#F3F4F6]/65 font-light">
              <p>© {new Date().getFullYear()} Lexa AI. All rights reserved.</p>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#346bf1]/10 text-[#6e96ff] border border-[#346bf1]/20 font-mono text-xs shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#346bf1] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#346bf1]" />
                </span>
                All systems operational
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CINEMATIC DESIGN SYSTEM & CANVAS ENGINE
   Self-contained visual enhancement layer for Lexa AI product film.
   ═══════════════════════════════════════════════════════════════════════════ */

const CINEMATIC_BLUE = "#346bf1";
const CINEMATIC_TAU = Math.PI * 2;

type Particle = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  drift: number;
  speed: number;
  phase: number;
};

type WaveRibbon = {
  amplitude: number;
  frequency: number;
  speed: number;
  offset: number;
  thickness: number;
  alpha: number;
};

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, index) => ({
    x: Math.random(),
    y: Math.random(),
    radius: 0.5 + Math.random() * 1.6,
    alpha: 0.05 + Math.random() * 0.25,
    drift: 0.003 + Math.random() * 0.01,
    speed: 0.1 + Math.random() * 0.25,
    phase: index * 0.31 + Math.random() * CINEMATIC_TAU,
  }));
}

function makeRibbons(count: number): WaveRibbon[] {
  return Array.from({ length: count }, (_, index) => ({
    amplitude: 0.12 + index * 0.04, // Increased amplitude
    frequency: 0.0015 + index * 0.0003,
    speed: 0.0003 + index * 0.00008, // Increased speed
    offset: index * 0.3,
    thickness: 16 + index * 6,
    alpha: 0.018 + index * 0.008,
  }));
}

function drawRibbon(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  ribbon: WaveRibbon,
) {
  const center = height * (0.5 + Math.sin(time * ribbon.speed + ribbon.offset) * 0.05);
  const amplitude = height * ribbon.amplitude;
  const gradient = context.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, "rgba(52,107,241,0)");
  gradient.addColorStop(0.25, `rgba(52,107,241,${ribbon.alpha})`);
  gradient.addColorStop(0.5, `rgba(110,150,255,${ribbon.alpha * 1.5})`);
  gradient.addColorStop(0.75, `rgba(52,107,241,${ribbon.alpha})`);
  gradient.addColorStop(1, "rgba(52,107,241,0)");

  context.beginPath();
  for (let x = -40; x <= width + 40; x += 12) {
    const wave = Math.sin(x * ribbon.frequency + time * ribbon.speed * 4 + ribbon.offset) * amplitude;
    const secondary = Math.sin(x * ribbon.frequency * 0.5 - time * ribbon.speed * 2) * amplitude * 0.35;
    const y = center + wave + secondary;
    if (x === -40) context.moveTo(x, y);
    else context.lineTo(x, y);
  }

  context.strokeStyle = gradient;
  context.lineWidth = ribbon.thickness;
  context.lineCap = "round";
  context.shadowColor = CINEMATIC_BLUE;
  context.shadowBlur = 24 + ribbon.thickness;
  context.stroke();
  context.shadowBlur = 0;
}

function drawParticle(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  particle: Particle,
) {
  const x = particle.x * width + Math.sin(time * particle.speed + particle.phase) * 16;
  const y = particle.y * height + Math.cos(time * particle.drift + particle.phase) * 12;
  const pulse = 0.65 + Math.sin(time * particle.speed + particle.phase) * 0.35;
  const radius = particle.radius * (0.85 + pulse * 0.3);

  context.beginPath();
  context.arc(x, y, radius, 0, CINEMATIC_TAU);
  context.fillStyle = `rgba(110,150,255,${particle.alpha * pulse})`;
  context.fill();
}

function useCinematicReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  return reduced;
}

function useCinematicCanvas(canvasRef: RefObject<HTMLCanvasElement | null>, disabled: boolean) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || disabled) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const particles = makeParticles(28);
    const ribbons = makeRibbons(6);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let frame = 0;
    let active = true;
    let lastTime = 0;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const render = (time: number) => {
      if (!active) return;
      const elapsed = time * 0.12;
      const delta = Math.min(time - lastTime, 50);
      lastTime = time;
      if (delta >= 0) {
        context.clearRect(0, 0, width, height);
        context.globalCompositeOperation = "screen";
        ribbons.forEach((ribbon) => drawRibbon(context, width, height, elapsed, ribbon));
        particles.forEach((particle) => drawParticle(context, width, height, elapsed, particle));
        context.globalCompositeOperation = "source-over";
      }
      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      context.clearRect(0, 0, width, height);
    };
  }, [canvasRef, disabled]);
}

function useCinematicPointerLight(lightRef: RefObject<HTMLDivElement | null>, disabled: boolean) {
  useEffect(() => {
    const light = lightRef.current;
    if (!light || disabled) return;

    const xTo = gsap.quickTo(light, "x", { duration: 0.7, ease: "power3.out" });
    const yTo = gsap.quickTo(light, "y", { duration: 0.7, ease: "power3.out" });

    const handlePointerMove = (event: MouseEvent) => {
      xTo(event.clientX - 160);
      yTo(event.clientY - 160);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [disabled, lightRef]);
}

function CinematicBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerLightRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useCinematicReducedMotion();

  useCinematicCanvas(canvasRef, reducedMotion);
  useCinematicPointerLight(pointerLightRef, reducedMotion);

  return (
    <div className="dot-grid-bg pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="flame-wave-container pointer-events-none">
        <div className="flame-wave-layer-1" />
        <div className="flame-wave-layer-2" />
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-60 mix-blend-screen" />
      <div
        ref={pointerLightRef}
        className="pointer-events-none absolute h-[320px] w-[320px] rounded-full bg-[#346bf1]/[0.08] blur-[80px] transition-opacity duration-300"
      />
    </div>
  );
}

function useCinematicEnhancements(_scopeRef: RefObject<HTMLElement | null>) {
  // Enhancements attached directly to GSAP & canvas systems
}

const CINEMATIC_DESIGN_SYSTEM_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

.dot-grid-bg {
  position: relative;
  background-color: #000000;
}

.dot-grid-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.18) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
  pointer-events: none;
}

.skeleton-shimmer {
  background: linear-gradient(90deg, #0a0a0a 25%, #1a1a1a 50%, #0a0a0a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.flame-wave-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: -1;
  mix-blend-mode: screen;
}

.flame-wave-layer-1 {
  position: absolute;
  top: -30%; bottom: -30%; left: 0; right: 0;
  background: linear-gradient(90deg, rgba(30,64,175,0.15) 0%, rgba(52,107,241,0.3) 25%, rgba(110,150,255,0.5) 50%, rgba(52,107,241,0.3) 75%, rgba(30,64,175,0.15) 100%);
  background-size: 200% 100%;
  animation: flame-pan-right 5s linear infinite;
  filter: blur(80px);
}

.flame-wave-layer-2 {
  position: absolute;
  top: 5%; bottom: 5%; left: 0; right: 0;
  background: linear-gradient(90deg, rgba(30,64,175,0.1) 0%, rgba(30,64,175,0.35) 33%, rgba(52,107,241,0.55) 66%, rgba(30,64,175,0.1) 100%);
  background-size: 200% 100%;
  animation: flame-pan-right 8s linear infinite reverse;
  filter: blur(120px);
}

@keyframes flame-pan-right {
  0% { background-position: 200% 50%; }
  100% { background-position: 0% 50%; }
}

.font-display {
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -0.045em;
}

.font-sans, .font-inter {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.font-mono {
  font-family: 'JetBrains Mono', monospace;
}

.lexa-cinematic-film {
  background-color: #000000 !important;
  color: #f4f5f8;
}

.lexa-cinematic-intro {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  transition: transform 1.6s cubic-bezier(0.65, 0, 0.35, 1), opacity 1.6s cubic-bezier(0.65, 0, 0.35, 1);
  will-change: transform, opacity;
}

.lexa-cinematic-intro.lexa-intro-exiting {
  opacity: 0.9; /* Slight fade but keep mostly visible during slide */
  transform: translate3d(0, -100vh, 0);
  pointer-events: none;
}

.lexa-page-revealing {
  animation: lexa-film-unveil 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes lexa-film-unveil {
  0% {
    opacity: 0.4;
    transform: scale(1.02);
    filter: blur(6px);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *:before, *:after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
  .lexa-cinematic-intro.lexa-intro-exiting {
    opacity: 0;
    transform: none;
  }
}

/* ─── Reference-inspired Lexa surface system ─── */
.lexa-cinematic-film {
  --lexa-reference-surface: #111214;
  --lexa-reference-panel: #1a1b1f;
  --lexa-reference-panel-raised: #222327;
  --lexa-reference-border: rgba(255,255,255,.1);
  --lexa-reference-muted: rgba(241,243,244,.64);
  --lexa-reference-blue: #346bf1;
  background: #000 !important;
  color: #f1f3f4;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.lexa-cinematic-film h1,
.lexa-cinematic-film h2,
.lexa-cinematic-film h3,
.lexa-cinematic-film h4 {
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  font-weight: 600;
  letter-spacing: -.045em;
  line-height: 1.06;
  text-wrap: balance;
}

.lexa-cinematic-film p {
  line-height: 1.68;
}

.lexa-cinematic-film header {
  background: rgba(0,0,0,.68);
  border-color: rgba(255,255,255,.09);
  box-shadow: 0 12px 46px rgba(0,0,0,.24);
}

.lexa-cinematic-film header:after {
  position: absolute;
  inset: 0;
  content: "";
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(52,107,241,.05), transparent);
  opacity: .8;
}

.lexa-cinematic-film .hero-section {
  min-height: min(960px, 100vh);
  padding-top: clamp(8rem, 16vh, 12rem);
  background: transparent;
}

.lexa-cinematic-film .hero-section:before {
  position: absolute;
  top: 4%;
  left: 50%;
  width: min(74vw, 900px);
  aspect-ratio: 1;
  content: "";
  border-radius: 999px;
  background: radial-gradient(circle at 50% 44%, rgba(52,107,241,.21), rgba(52,107,241,.08) 32%, transparent 70%);
  filter: blur(34px);
  transform: translateX(-50%);
  animation: lexa-reference-bloom 14s ease-in-out infinite;
  pointer-events: none;
}

.lexa-cinematic-film .hero-section:after {
  position: absolute;
  inset: 0;
  content: "";
  pointer-events: none;
  background: linear-gradient(180deg, rgba(0,0,0,.3), transparent 24%, transparent 70%, #000 100%), radial-gradient(circle at 50% 20%, rgba(255,255,255,.035), transparent 38%);
}

.lexa-cinematic-film .hero-section > .relative.z-20,
.lexa-cinematic-film .hero-section > .hero-monolith {
  width: min(100%, 1160px);
}

.lexa-cinematic-film .hero-section .hero-badge {
  margin-bottom: clamp(1.75rem, 4vw, 3.25rem);
  border-color: rgba(255,255,255,.14);
  background: rgba(17,18,20,.58);
  box-shadow: 0 0 0 1px rgba(52,107,241,.08), 0 16px 70px rgba(0,0,0,.3);
}

.lexa-cinematic-film .hero-section .hero-headline-wrap {
  margin-bottom: clamp(1.25rem, 3vw, 2rem);
}

.lexa-cinematic-film .hero-section .hero-subtitle {
  max-width: 42rem;
  color: var(--lexa-reference-muted);
  font-size: clamp(1rem, 1.5vw, 1.22rem);
  text-wrap: balance;
}

.lexa-cinematic-film .hero-section .hero-actions {
  gap: .75rem;
  margin-top: clamp(.25rem, 1vw, .8rem);
}

.lexa-cinematic-film .hero-section .hero-actions button {
  min-height: 3.25rem;
  padding-inline: 1.55rem;
  border-radius: 999px;
  letter-spacing: .1em;
  box-shadow: 0 12px 30px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.1);
  transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s cubic-bezier(.22,1,.36,1), background-color .35s ease, border-color .35s ease;
}

.lexa-cinematic-film .hero-section .hero-actions button:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 48px rgba(52,107,241,.2), inset 0 1px 0 rgba(255,255,255,.2);
}

.lexa-cinematic-film .hero-monolith {
  margin-top: clamp(3.5rem, 8vw, 7rem);
}

.lexa-cinematic-film .hero-monolith > div.relative {
  border: 1px solid var(--lexa-reference-border);
  border-radius: 32px;
  background: rgba(17,18,20,.86);
  box-shadow: 0 30px 120px rgba(0,0,0,.5), 0 0 0 1px rgba(52,107,241,.06);
}

.lexa-cinematic-film .hero-monolith .rounded-\[24px\],
.lexa-cinematic-film .hero-monolith .rounded-\[36px\] {
  border-color: rgba(255,255,255,.08);
}

.lexa-cinematic-film > div.bg-\[\#191A1F\] {
  background: #0a0b0d;
}

.lexa-cinematic-film section {
  scroll-margin-top: 6rem;
}

.lexa-cinematic-film .stats-section,
.lexa-cinematic-film .models-section,
.lexa-cinematic-film .pricing-section,
.lexa-cinematic-film #features,
.lexa-cinematic-film #faq {
  max-width: 1440px;
  margin-inline: auto;
  border-color: rgba(255,255,255,.08);
}

.lexa-cinematic-film .stats-section,
.lexa-cinematic-film .models-section,
.lexa-cinematic-film #faq {
  background: #111214;
}

.lexa-cinematic-film .stat-card,
.lexa-cinematic-film .feature-story-item,
.lexa-cinematic-film .model-stage-card,
.lexa-cinematic-film .pricing-column,
.lexa-cinematic-film article.rounded-\[24px\] {
  border-color: rgba(255,255,255,.1);
  background: rgba(26,27,31,.82);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.035), 0 24px 80px rgba(0,0,0,.16);
  transition: transform .45s cubic-bezier(.22,1,.36,1), border-color .45s ease, background-color .45s ease, box-shadow .45s ease;
}

.lexa-cinematic-film .stat-card:hover,
.lexa-cinematic-film .feature-story-item:hover,
.lexa-cinematic-film .pricing-column:hover,
.lexa-cinematic-film article.rounded-\[24px\]:hover {
  transform: translateY(-6px);
  border-color: rgba(52,107,241,.42);
  background: rgba(34,35,39,.9);
  box-shadow: 0 28px 80px rgba(0,0,0,.28), 0 0 40px rgba(52,107,241,.09);
}

.lexa-cinematic-film .feature-story-item {
  min-height: 220px;
}

.lexa-cinematic-film .feature-story-item h3,
.lexa-cinematic-film .pricing-column h3,
.lexa-cinematic-film .model-stage-card h3 {
  letter-spacing: -.04em;
}

.lexa-cinematic-film .model-stage-card {
  border-radius: 32px;
  background: #111214;
}

.lexa-cinematic-film .pricing-column {
  border-radius: 30px;
}

.lexa-cinematic-film .pricing-column button,
.lexa-cinematic-film .model-stage-card button {
  border-radius: 999px;
  min-height: 3rem;
}

.lexa-cinematic-film footer {
  background: #000;
  border-color: rgba(255,255,255,.08);
}

.lexa-cinematic-film a,
.lexa-cinematic-film button {
  -webkit-tap-highlight-color: transparent;
}

.lexa-cinematic-film button:focus-visible,
.lexa-cinematic-film a:focus-visible {
  outline: 2px solid #6e96ff;
  outline-offset: 3px;
}

@keyframes lexa-reference-bloom {
  0%, 100% { opacity: .7; transform: translateX(-50%) scale(.96); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.04); }
}

@media (max-width: 768px) {
  .lexa-cinematic-film .hero-section {
    min-height: auto;
    padding-top: 8rem;
  }
  .lexa-cinematic-film .hero-section .hero-actions {
    width: 100%;
    max-width: 22rem;
  }
  .lexa-cinematic-film .hero-section .hero-actions > * {
    width: 100%;
  }
  .lexa-cinematic-film .hero-section .hero-actions button {
    width: 100%;
  }
  .lexa-cinematic-film .hero-monolith {
    margin-top: 4rem;
  }
  .lexa-cinematic-film .feature-story-item {
    min-height: auto;
  }
}
`;

/*
  UI/UX enhancement overlay
  -----------------------------------------------------------------------------
  This layer deliberately overrides presentation only. The original component,
  data, navigation, authentication, animations, and section order are preserved.
  It adds depth, hierarchy, contrast, accessible states, and responsive polish.
*/
const LEXA_UI_UX_OVERLAY_CSS = `
/* ─── 1. Cool-toned surface tokens ─────────────────────────────────────── */
.lexa-cinematic-film {
  --lexa-void: #05070d;
  --lexa-night: #0a1020;
  --lexa-surface: #101827;
  --lexa-surface-raised: #152136;
  --lexa-blue: #4d7dff;
  --lexa-blue-bright: #82a7ff;
  --lexa-cyan: #78e6ff;
  --lexa-mint: #82e6c8;
  --lexa-gold: #ffd180;
  --lexa-text: #f7faff;
  --lexa-body: rgba(225, 235, 255, 0.72);
  --lexa-soft: rgba(151, 178, 221, 0.7);
  --lexa-line: rgba(161, 192, 255, 0.14);
  background:
    radial-gradient(circle at 72% -8%, rgba(77, 125, 255, 0.2), transparent 31rem),
    radial-gradient(circle at 14% 28%, rgba(120, 230, 255, 0.06), transparent 28rem),
    var(--lexa-void) !important;
  color: var(--lexa-text);
}

.lexa-cinematic-film .dot-grid-bg {
  background:
    radial-gradient(ellipse at 70% 7%, rgba(77, 125, 255, 0.22), transparent 29%),
    radial-gradient(ellipse at 22% 34%, rgba(120, 230, 255, 0.09), transparent 24%),
    linear-gradient(180deg, #04060c 0%, #070d19 62%, #101827 100%);
}

.lexa-cinematic-film .dot-grid-bg::after {
  opacity: 0.55;
  background-image: radial-gradient(circle, rgba(170, 199, 255, 0.24) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 0.62) 52%, transparent 92%);
}

.lexa-cinematic-film .flame-wave-layer-1 {
  background: linear-gradient(90deg, rgba(42, 77, 177, 0.06), rgba(77, 125, 255, 0.28), rgba(120, 230, 255, 0.34), rgba(77, 125, 255, 0.28), rgba(42, 77, 177, 0.06));
  filter: blur(95px);
}

.lexa-cinematic-film .flame-wave-layer-2 {
  background: linear-gradient(90deg, rgba(23, 49, 121, 0.05), rgba(77, 125, 255, 0.26), rgba(151, 130, 255, 0.19), rgba(77, 125, 255, 0.25), rgba(23, 49, 121, 0.05));
  filter: blur(128px);
}

/* ─── 2. Navigation: clearer hierarchy and tactile actions ─────────────── */
.lexa-cinematic-film header.fixed {
  height: 76px;
  border-color: rgba(161, 192, 255, 0.12);
  background: rgba(5, 7, 13, 0.68) !important;
  box-shadow: 0 13px 40px rgba(0, 0, 0, 0.16);
}

.lexa-cinematic-film header.fixed:after {
  opacity: 1;
  background: linear-gradient(90deg, transparent 14%, rgba(120, 230, 255, 0.07) 48%, transparent 85%);
}

.lexa-cinematic-film .scroll-progress-bar {
  height: 2px !important;
  background: linear-gradient(90deg, var(--lexa-blue), var(--lexa-cyan), var(--lexa-blue-bright)) !important;
  box-shadow: 0 0 17px rgba(120, 230, 255, 0.75) !important;
}

.lexa-cinematic-film .font-display {
  font-family: Outfit, ui-sans-serif, system-ui, sans-serif;
}

.lexa-cinematic-film .font-mono {
  font-family: "DM Mono", "JetBrains Mono", monospace;
}

.lexa-cinematic-film header.fixed .font-display.text-lg {
  letter-spacing: -0.045em;
}

.lexa-cinematic-film header.fixed .rounded-full.bg-\[\#346bf1\] {
  background: linear-gradient(135deg, var(--lexa-blue), #3165e8) !important;
  box-shadow: 0 10px 27px rgba(48, 101, 232, 0.3), inset 0 1px 0 rgba(255,255,255,0.22) !important;
}

.lexa-cinematic-film header.fixed .rounded-full.bg-\[\#346bf1\]:hover {
  background: linear-gradient(135deg, #5b8aff, #2f5ee0) !important;
  transform: translateY(-1px);
}

.lexa-cinematic-film .lexa-discover-menu {
  border-color: rgba(161, 192, 255, 0.2) !important;
  background: rgba(13, 21, 36, 0.94) !important;
  box-shadow: 0 22px 65px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.06) !important;
}

.lexa-cinematic-film .lexa-discover-menu button:hover {
  background: linear-gradient(90deg, rgba(77,125,255,0.18), rgba(120,230,255,0.05)) !important;
}

/* ─── 3. Hero: retain the same composition with a stronger visual thesis ── */
.lexa-cinematic-film .hero-section {
  min-height: min(970px, 100vh);
  isolation: isolate;
}

.lexa-cinematic-film .hero-section::before {
  width: min(83vw, 1080px);
  background:
    radial-gradient(circle at 50% 42%, rgba(77, 125, 255, 0.25), rgba(77,125,255,0.08) 32%, transparent 68%),
    radial-gradient(circle at 67% 60%, rgba(120,230,255,0.1), transparent 31%);
  filter: blur(27px);
}

.lexa-cinematic-film .hero-section::after {
  background:
    linear-gradient(180deg, rgba(4, 6, 12, 0.32), transparent 26%, transparent 70%, #0f1827 100%),
    radial-gradient(circle at 50% 24%, rgba(255,255,255,0.05), transparent 34%);
}

.lexa-cinematic-film .hero-badge {
  border-color: rgba(130, 167, 255, 0.28) !important;
  background: rgba(16, 24, 39, 0.66) !important;
  box-shadow: 0 0 0 1px rgba(120, 230, 255, 0.06), 0 16px 70px rgba(0,0,0,.24) !important;
}

.lexa-cinematic-film .hero-badge .bg-\[\#346bf1\] {
  background: var(--lexa-cyan) !important;
  box-shadow: 0 0 13px rgba(120, 230, 255, 0.8);
}

.lexa-cinematic-film .hero-subtitle {
  max-width: 45rem !important;
  color: var(--lexa-body) !important;
  font-size: clamp(1rem, 1.5vw, 1.18rem) !important;
}

.lexa-cinematic-film .hero-actions button {
  min-height: 3.45rem !important;
  letter-spacing: 0.09em !important;
}

.lexa-cinematic-film .hero-actions button:first-child {
  background: linear-gradient(135deg, var(--lexa-blue), #3566ea) !important;
  box-shadow: 0 16px 40px rgba(52,107,241,.27), inset 0 1px 0 rgba(255,255,255,.19) !important;
}

.lexa-cinematic-film .hero-actions button:last-child {
  border-color: rgba(161, 192, 255, 0.22) !important;
  background: rgba(15, 24, 39, 0.52) !important;
}

.lexa-cinematic-film .hero-actions button:last-child:hover {
  border-color: rgba(120, 230, 255, 0.5) !important;
  background: rgba(77, 125, 255, 0.12) !important;
}

/* ─── 4. Workspace preview: clearer layering and calmer code surface ────── */
.lexa-cinematic-film .hero-monolith > div.relative {
  border-color: rgba(154, 188, 255, 0.2) !important;
  background: linear-gradient(145deg, rgba(18, 28, 45, 0.94), rgba(9, 14, 25, 0.97)) !important;
  box-shadow: 0 38px 130px rgba(0,0,0,.55), 0 0 0 1px rgba(120,230,255,.06), 0 0 90px rgba(52,107,241,.12) !important;
}

.lexa-cinematic-film .hero-monolith > div.relative::before {
  position: absolute;
  z-index: 0;
  inset: 0;
  content: "";
  pointer-events: none;
  background: linear-gradient(110deg, rgba(255,255,255,.05), transparent 20%, transparent 75%, rgba(120,230,255,.03));
}

.lexa-cinematic-film .hero-monolith > div.relative > * {
  position: relative;
  z-index: 1;
}

.lexa-cinematic-film .hero-monolith .bg-\[\#191A1F\],
.lexa-cinematic-film .hero-monolith .bg-\[\#202124\] {
  background-color: rgba(10, 16, 28, 0.72) !important;
}

.lexa-cinematic-film .hero-monolith .bg-\[\#28292A\] {
  background: rgba(49, 64, 87, 0.36) !important;
}

.lexa-cinematic-film .hero-monolith .text-emerald-400 {
  color: var(--lexa-mint) !important;
}

.lexa-cinematic-film .hero-monolith .text-amber-400 {
  color: var(--lexa-gold) !important;
}

.lexa-cinematic-film .hero-monolith .rounded-\[24px\] {
  box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 18px 46px rgba(0,0,0,.17) !important;
}

/* ─── 5. Shared section language ───────────────────────────────────────── */
.lexa-cinematic-film > div.bg-\[\#191A1F\] {
  background:
    linear-gradient(180deg, #0e1726 0%, #101827 28%, #10131d 72%, #090d16 100%) !important;
}

.lexa-cinematic-film .stats-section,
.lexa-cinematic-film .models-section,
.lexa-cinematic-film #faq {
  background: rgba(14, 23, 38, 0.94) !important;
}

.lexa-cinematic-film .stats-section,
.lexa-cinematic-film .models-section,
.lexa-cinematic-film .pricing-section,
.lexa-cinematic-film #features,
.lexa-cinematic-film #faq {
  border-color: var(--lexa-line) !important;
}

.lexa-cinematic-film .stats-section::before,
.lexa-cinematic-film .models-section::before,
.lexa-cinematic-film #features::before {
  position: absolute;
  inset: 0;
  content: "";
  pointer-events: none;
  background-image: linear-gradient(rgba(151,178,221,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(151,178,221,.035) 1px, transparent 1px);
  background-size: 52px 52px;
  mask-image: linear-gradient(90deg, transparent, black 20%, black 80%, transparent);
}

.lexa-cinematic-film .stats-section > *,
.lexa-cinematic-film .models-section > *,
.lexa-cinematic-film #features > * {
  position: relative;
  z-index: 1;
}

.lexa-cinematic-film .stat-card,
.lexa-cinematic-film .feature-story-item,
.lexa-cinematic-film .model-stage-card,
.lexa-cinematic-film .pricing-column,
.lexa-cinematic-film article.rounded-\[24px\] {
  border-color: rgba(161, 192, 255, 0.14) !important;
  background: linear-gradient(145deg, rgba(29, 42, 62, 0.8), rgba(16, 25, 40, 0.86)) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.045), 0 24px 80px rgba(0,0,0,.18) !important;
}

.lexa-cinematic-film .stat-card:hover,
.lexa-cinematic-film .feature-story-item:hover,
.lexa-cinematic-film .pricing-column:hover,
.lexa-cinematic-film article.rounded-\[24px\]:hover {
  border-color: rgba(120, 230, 255, 0.42) !important;
  background: linear-gradient(145deg, rgba(39, 57, 84, 0.94), rgba(18, 29, 49, 0.95)) !important;
  box-shadow: 0 28px 90px rgba(0,0,0,.28), 0 0 44px rgba(77,125,255,.1) !important;
}

.lexa-cinematic-film .stat-card .font-display {
  background: linear-gradient(120deg, #fff 0%, #a9c3ff 55%, #77e6ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent !important;
}

.lexa-cinematic-film .stat-card .text-\[\#F3F4F6\]\/65,
.lexa-cinematic-film .feature-story-item .text-\[\#F3F4F6\]\/65,
.lexa-cinematic-film .model-stage-card .text-\[\#F3F4F6\]\/65,
.lexa-cinematic-film .pricing-column .text-\[\#F3F4F6\]\/65,
.lexa-cinematic-film #faq .text-\[\#F3F4F6\]\/65 {
  color: var(--lexa-body) !important;
}

/* ─── 6. Features: selected-state clarity and a richer command surface ──── */
.lexa-cinematic-film .feature-story-item {
  border-left-width: 2px !important;
}

.lexa-cinematic-film .feature-story-item.border-\[\#346bf1\]\/50 {
  border-color: rgba(120, 230, 255, 0.55) !important;
  border-left-color: var(--lexa-cyan) !important;
  background: linear-gradient(120deg, rgba(52,107,241,.2), rgba(18,29,49,.93)) !important;
  box-shadow: 0 26px 70px rgba(0,0,0,.24), inset 3px 0 0 rgba(120,230,255,.75) !important;
}

.lexa-cinematic-film .feature-story-item .text-\[\#346bf1\],
.lexa-cinematic-film .feature-story-item .text-\[\#6e96ff\] {
  color: var(--lexa-blue-bright) !important;
}

.lexa-cinematic-film .feature-story-item:hover .font-display {
  color: #ffffff !important;
}

.lexa-cinematic-film .lg\:sticky .rounded-\[32px\] {
  border-color: rgba(120, 230, 255, 0.2) !important;
  background:
    radial-gradient(circle at 85% 11%, rgba(77,125,255,.16), transparent 31%),
    linear-gradient(145deg, rgba(23,36,58,.96), rgba(12,19,32,.98)) !important;
  box-shadow: 0 30px 95px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.055) !important;
}

.lexa-cinematic-film .lg\:sticky .rounded-\[32px\] .border-b,
.lexa-cinematic-film .lg\:sticky .rounded-\[32px\] .border-t {
  border-color: rgba(161,192,255,.1) !important;
}

.lexa-cinematic-film .lg\:sticky .rounded-\[32px\] .bg-\[\#191A1F\]\/40,
.lexa-cinematic-film .lg\:sticky .rounded-\[32px\] .bg-\[\#28292A\] {
  background-color: rgba(6, 13, 24, 0.45) !important;
}

/* ─── 7. Intelligence mesh: more legible selection and metrics ─────────── */
.lexa-cinematic-film .models-section .inline-flex.rounded-full {
  border-color: rgba(161,192,255,.18) !important;
  background: rgba(5, 10, 18, 0.62) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.045), 0 14px 45px rgba(0,0,0,.2) !important;
}

.lexa-cinematic-film .models-section .bg-\[\#346bf1\] {
  background: linear-gradient(135deg, var(--lexa-blue), #3f6ef1) !important;
  box-shadow: 0 9px 23px rgba(52,107,241,.28) !important;
}

.lexa-cinematic-film .model-stage-card {
  border-color: rgba(130, 167, 255, 0.19) !important;
  background:
    radial-gradient(circle at 92% 13%, rgba(120,230,255,.11), transparent 25%),
    linear-gradient(145deg, #161f31, #0e1524) !important;
}

.lexa-cinematic-film .model-stage-card .bg-\[\#202124\] {
  border-color: rgba(161,192,255,.12) !important;
  background: rgba(6, 12, 22, 0.5) !important;
}

.lexa-cinematic-film .model-stage-card .h-full.rounded-full {
  background: linear-gradient(90deg, var(--lexa-blue), var(--lexa-cyan)) !important;
  box-shadow: 0 0 13px rgba(120,230,255,.52);
}

/* ─── 8. Pricing and FAQ: hierarchy, confidence, and comfortable rhythm ── */
.lexa-cinematic-film .pricing-column {
  min-height: 100%;
}

.lexa-cinematic-film .pricing-column.ring-1 {
  border-color: rgba(120,230,255,.55) !important;
  background:
    linear-gradient(180deg, rgba(77,125,255,.2), rgba(22,34,54,.97) 52%, rgba(14,21,35,.98)) !important;
  box-shadow: 0 32px 95px rgba(0,0,0,.32), 0 0 62px rgba(77,125,255,.12), inset 0 1px 0 rgba(255,255,255,.1) !important;
}

.lexa-cinematic-film .pricing-column .absolute.-top-3\.5 {
  background: linear-gradient(135deg, var(--lexa-blue-light), var(--lexa-blue)) !important;
  box-shadow: 0 10px 25px rgba(52,107,241,.32) !important;
}

.lexa-cinematic-film .pricing-column li > div {
  border-color: rgba(120,230,255,.3) !important;
  color: var(--lexa-cyan) !important;
  background: rgba(77,125,255,.1) !important;
}

.lexa-cinematic-film #faq article.rounded-\[24px\] {
  overflow: clip;
}

.lexa-cinematic-film #faq article.rounded-\[24px\] button {
  transition: background-color .22s ease, color .22s ease;
}

.lexa-cinematic-film #faq article.rounded-\[24px\] button:hover {
  background: rgba(77,125,255,.08);
}

.lexa-cinematic-film #faq article.rounded-\[24px\] .text-\[\#346bf1\] {
  color: var(--lexa-cyan) !important;
}

/* ─── 9. Final CTA and footer: a quieter, stronger finish ──────────────── */
.lexa-cinematic-film .relative.rounded-\[40px\].border {
  border-color: rgba(120,230,255,.3) !important;
  background:
    radial-gradient(circle at 50% 18%, rgba(77,125,255,.25), transparent 33%),
    linear-gradient(145deg, #141f34, #070b13 74%) !important;
  box-shadow: 0 36px 105px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.07) !important;
}

.lexa-cinematic-film .relative.rounded-\[40px\].border .bg-\[\#346bf1\] {
  background: linear-gradient(135deg, var(--lexa-blue), #2e5bda) !important;
  box-shadow: 0 14px 38px rgba(52,107,241,.32) !important;
}

.lexa-cinematic-film footer {
  background:
    linear-gradient(180deg, rgba(7,12,22,.95), #03050a) !important;
  border-color: var(--lexa-line) !important;
}

.lexa-cinematic-film footer a:hover {
  color: var(--lexa-cyan) !important;
}

.lexa-cinematic-film footer .bg-\[\#346bf1\]\/10 {
  border-color: rgba(120,230,255,.24) !important;
  color: var(--lexa-cyan) !important;
  background: rgba(77,125,255,.1) !important;
}

/* ─── 10. Global micro-interactions, safe focus styles, and mobile polish ─ */
.lexa-cinematic-film button,
.lexa-cinematic-film a {
  transition-timing-function: cubic-bezier(.22, 1, .36, 1);
}

.lexa-cinematic-film button:focus-visible,
.lexa-cinematic-film a:focus-visible {
  outline: 2px solid var(--lexa-cyan) !important;
  outline-offset: 4px;
}

.lexa-cinematic-film button:active {
  transform: scale(.975);
}

.lexa-cinematic-film .hero-actions button:active,
.lexa-cinematic-film .pricing-column button:active {
  transform: scale(.97);
}

@media (max-width: 1023px) {
  .lexa-cinematic-film .hero-section {
    min-height: auto;
    padding-top: 9rem;
  }

  .lexa-cinematic-film .hero-monolith {
    max-width: 880px;
  }

  .lexa-cinematic-film .feature-story-item {
    min-height: auto;
  }
}

@media (max-width: 767px) {
  .lexa-cinematic-film header.fixed {
    height: 65px;
  }

  .lexa-cinematic-film header.fixed .mx-auto.max-w-7xl {
    height: 65px;
  }

  .lexa-cinematic-film .hero-section {
    padding-top: 7.8rem;
    padding-bottom: 4.5rem;
  }

  .lexa-cinematic-film .hero-badge {
    margin-bottom: 1.5rem !important;
  }

  .lexa-cinematic-film .hero-monolith > div.relative {
    border-radius: 21px;
  }

  .lexa-cinematic-film .hero-monolith .p-6,
  .lexa-cinematic-film .hero-monolith .md\\:p-10 {
    padding: 1rem !important;
  }

  .lexa-cinematic-film .stat-card,
  .lexa-cinematic-film .feature-story-item,
  .lexa-cinematic-film .pricing-column,
  .lexa-cinematic-film article.rounded-\[24px\] {
    border-radius: 18px !important;
  }

  .lexa-cinematic-film .lg\\:sticky .rounded-\[32px\],
  .lexa-cinematic-film .model-stage-card {
    border-radius: 21px !important;
  }

  .lexa-cinematic-film .relative.rounded-\[40px\].border {
    border-radius: 24px !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lexa-cinematic-film .flame-wave-layer-1,
  .lexa-cinematic-film .flame-wave-layer-2,
  .lexa-cinematic-film .hero-section::before,
  .lexa-cinematic-film .stat-card,
  .lexa-cinematic-film .feature-story-item,
  .lexa-cinematic-film .pricing-column {
    animation: none !important;
    transition: none !important;
  }
}
`;

/*
  Aurora gas animation layer
  Six blurred layers produce wide, flowing ribbons instead of thin neon lines.
  Only transform and opacity animate, preserving rendering performance.
*/
const LEXA_AURORA_GAS_CSS = `
.lexa-aurora-gas {
  position: fixed;
  z-index: 0;
  inset: -20vh -18vw;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.65;
  mix-blend-mode: screen;
  transform: translateZ(0);
  mask-image: linear-gradient(180deg, transparent 0%, transparent 45%, rgba(0,0,0,0.1) 60%, black 80%, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, transparent 45%, rgba(0,0,0,0.1) 60%, black 80%, black 90%, transparent 100%);
}

.lexa-aurora-gas::before {
  position: absolute;
  inset: 0;
  content: "";
  background:
    linear-gradient(180deg, rgba(1, 4, 10, 0.02) 0%, transparent 28%, rgba(1, 4, 10, 0.56) 82%, rgba(1, 4, 10, 0.93) 100%),
    radial-gradient(ellipse at 50% 0%, transparent 0%, rgba(1,4,10,0.12) 62%, rgba(1,4,10,0.52) 100%);
}

.lexa-aurora-gas__ribbon,
.lexa-aurora-gas__cloud {
  position: absolute;
  display: block;
  will-change: transform, opacity;
  transform: translate3d(0, 0, 0);
}

.lexa-aurora-gas__ribbon {
  width: 142vw;
  height: 22vh;
  border-radius: 46% 54% 48% 52% / 67% 45% 55% 33%;
  filter: blur(48px) saturate(1.1);
  opacity: 0.35;
}

.lexa-aurora-gas__ribbon--one {
  top: 9vh;
  left: -31vw;
  background:
    radial-gradient(ellipse at 13% 52%, rgba(54, 86, 255, 0.02) 0%, rgba(54, 86, 255, 0.48) 20%, transparent 45%),
    radial-gradient(ellipse at 48% 48%, rgba(91, 143, 255, 0.6) 0%, rgba(91, 143, 255, 0.23) 31%, transparent 61%),
    radial-gradient(ellipse at 78% 52%, rgba(97, 236, 255, 0.62) 0%, rgba(97, 236, 255, 0.15) 29%, transparent 55%);
  animation: lexa-aurora-flow-one 23s cubic-bezier(.45, 0, .55, 1) infinite alternate;
}

.lexa-aurora-gas__ribbon--two {
  top: 25vh;
  left: -13vw;
  height: 24vh;
  border-radius: 57% 43% 59% 41% / 50% 61% 39% 50%;
  background:
    radial-gradient(ellipse at 20% 45%, rgba(123, 89, 255, 0.43) 0%, transparent 39%),
    radial-gradient(ellipse at 49% 61%, rgba(61, 119, 255, 0.45) 0%, transparent 45%),
    radial-gradient(ellipse at 85% 37%, rgba(126, 235, 255, 0.35) 0%, transparent 41%);
  filter: blur(63px) saturate(1.4);
  opacity: 0.34;
  animation: lexa-aurora-flow-two 31s cubic-bezier(.42, 0, .58, 1) infinite alternate-reverse;
}

.lexa-aurora-gas__ribbon--three {
  top: 45vh;
  left: -45vw;
  width: 155vw;
  height: 29vh;
  border-radius: 39% 61% 43% 57% / 69% 43% 57% 31%;
  background:
    radial-gradient(ellipse at 19% 52%, rgba(36, 72, 228, 0.3) 0%, transparent 42%),
    radial-gradient(ellipse at 58% 40%, rgba(68, 132, 255, 0.52) 0%, rgba(68,132,255,0.18) 29%, transparent 59%),
    radial-gradient(ellipse at 88% 65%, rgba(96, 236, 222, 0.42) 0%, transparent 42%);
  filter: blur(72px) saturate(1.26);
  opacity: 0.25;
  animation: lexa-aurora-flow-three 37s cubic-bezier(.42, 0, .58, 1) infinite alternate;
}

.lexa-aurora-gas__ribbon--four {
  top: 69vh;
  left: -21vw;
  height: 22vh;
  border-radius: 51% 49% 63% 37% / 43% 59% 41% 57%;
  background:
    radial-gradient(ellipse at 17% 42%, rgba(94, 89, 247, 0.28) 0%, transparent 40%),
    radial-gradient(ellipse at 55% 62%, rgba(77, 125, 255, 0.38) 0%, transparent 43%),
    radial-gradient(ellipse at 81% 33%, rgba(120, 230, 255, 0.28) 0%, transparent 38%);
  filter: blur(76px) saturate(1.18);
  opacity: 0.2;
  animation: lexa-aurora-flow-four 42s cubic-bezier(.45, 0, .55, 1) infinite alternate-reverse;
}

.lexa-aurora-gas__cloud {
  width: 48vw;
  aspect-ratio: 1;
  border-radius: 50%;
  filter: blur(105px) saturate(1.42);
  opacity: 0.22;
}

.lexa-aurora-gas__cloud--blue {
  top: 12vh;
  right: -13vw;
  background: rgba(76, 123, 255, 0.9);
  animation: lexa-aurora-cloud-blue 28s ease-in-out infinite alternate;
}

.lexa-aurora-gas__cloud--violet {
  top: 50vh;
  left: -16vw;
  background: rgba(120, 89, 255, 0.72);
  opacity: 0.14;
  animation: lexa-aurora-cloud-violet 34s ease-in-out infinite alternate-reverse;
}

@keyframes lexa-aurora-flow-one {
  0% { transform: translate3d(-4vw, -1vh, 0) rotate(-7deg) scale(1.02); opacity: 0.4; }
  48% { transform: translate3d(17vw, 7vh, 0) rotate(5deg) scale(1.13); opacity: 0.63; }
  100% { transform: translate3d(34vw, 2vh, 0) rotate(10deg) scale(1.05); opacity: 0.46; }
}

@keyframes lexa-aurora-flow-two {
  0% { transform: translate3d(28vw, 2vh, 0) rotate(10deg) scale(1.04); opacity: 0.28; }
  52% { transform: translate3d(4vw, -7vh, 0) rotate(-5deg) scale(1.18); opacity: 0.45; }
  100% { transform: translate3d(-18vw, 3vh, 0) rotate(-12deg) scale(1.07); opacity: 0.3; }
}

@keyframes lexa-aurora-flow-three {
  0% { transform: translate3d(-2vw, 5vh, 0) rotate(4deg) scale(1); opacity: 0.18; }
  50% { transform: translate3d(19vw, -4vh, 0) rotate(-7deg) scale(1.16); opacity: 0.34; }
  100% { transform: translate3d(31vw, 7vh, 0) rotate(7deg) scale(1.04); opacity: 0.22; }
}

@keyframes lexa-aurora-flow-four {
  0% { transform: translate3d(18vw, -4vh, 0) rotate(-5deg) scale(1.08); opacity: 0.16; }
  50% { transform: translate3d(-6vw, 5vh, 0) rotate(7deg) scale(1.2); opacity: 0.27; }
  100% { transform: translate3d(-21vw, -2vh, 0) rotate(-8deg) scale(1.1); opacity: 0.17; }
}

@keyframes lexa-aurora-cloud-blue {
  0% { transform: translate3d(0, 0, 0) scale(.9); opacity: .14; }
  50% { transform: translate3d(-14vw, 8vh, 0) scale(1.25); opacity: .31; }
  100% { transform: translate3d(-6vw, 17vh, 0) scale(1.06); opacity: .19; }
}

@keyframes lexa-aurora-cloud-violet {
  0% { transform: translate3d(0, 0, 0) scale(.94); opacity: .08; }
  50% { transform: translate3d(19vw, -15vh, 0) scale(1.28); opacity: .22; }
  100% { transform: translate3d(31vw, 6vh, 0) scale(1.06); opacity: .11; }
}

@media (max-width: 767px) {
  .lexa-aurora-gas { inset: -12vh -48vw; opacity: 0.72; }
  .lexa-aurora-gas__ribbon { width: 190vw; filter: blur(44px) saturate(1.25); }
  .lexa-aurora-gas__ribbon--one { top: 7vh; }
  .lexa-aurora-gas__ribbon--two { top: 24vh; }
  .lexa-aurora-gas__ribbon--three { top: 48vh; }
  .lexa-aurora-gas__ribbon--four { top: 72vh; }
  .lexa-aurora-gas__cloud { width: 110vw; filter: blur(84px); }
}

@media (prefers-reduced-motion: reduce) {
  .lexa-aurora-gas__ribbon,
  .lexa-aurora-gas__cloud { animation: none !important; }
}
`;
