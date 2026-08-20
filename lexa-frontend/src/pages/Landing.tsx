import { useEffect, useInsertionEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Brain,
  Check,
  ChevronRight,
  Code2,
  Globe,
  Image as ImageIcon,
  Menu,
  MessageSquare,
  Mic,
  Minus,
  Plus,
  Quote,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import { LogoIcon } from "@/components/ui/LogoIcon";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";

gsap.registerPlugin(useGSAP, ScrollTrigger);

declare global {
  interface Window {
    __lexaLenis?: Lenis;
  }
}

/** Inject the complete landing stylesheet into <head> before layout. */
function useLandingStyles() {
  useInsertionEffect(() => {
    const styleId = "lexa-palomino-landing-styles";
    const previous = document.getElementById(
      styleId,
    ) as HTMLStyleElement | null;
    const style = previous ?? document.createElement("style");

    style.id = styleId;
    style.textContent = PALOMINO_LEXA_CSS;
    if (!previous) document.head.appendChild(style);

    return () => {
      if (!previous) style.remove();
    };
  }, []);
}

const FEATURES = [
  {
    id: "smart-ai",
    icon: MessageSquare,
    tag: "COGNITIVE CORE",
    title: "Smart AI Conversations",
    description:
      "Context-aware intelligence that remembers your preferences, adapts to your voice, and reasons through complex work without losing the thread.",
    preview: {
      type: "chat",
      prompt: "Synthesize quarterly metrics with multi-perspective analysis.",
      badge: "Deep reasoning mode",
      status: "Adaptive context active",
    },
  },
  {
    id: "web-search",
    icon: Globe,
    tag: "LIVE TELEMETRY",
    title: "Real-time Web Search",
    description:
      "Browse live sources, verify claims, and return current answers with citations—without breaking your creative flow.",
    preview: {
      type: "search",
      query: "Global market trends · Q3 live feeds",
      sources: ["Bloomberg Terminal", "Reuters API", "ArXiv Research"],
      status: "Verified 24ms ago",
    },
  },
  {
    id: "voice-ai",
    icon: Mic,
    tag: "ACOUSTIC SYNTHESIS",
    title: "Voice AI Interactions",
    description:
      "Natural, low-latency voice interaction that feels immediate enough for ideation, drafting, and hands-free execution.",
    preview: {
      type: "audio",
      waveform: [35, 60, 95, 45, 80, 100, 50, 75, 40, 90, 60, 30, 85, 45, 95],
      latency: "85ms response latency",
      status: "Neural voice stream active",
    },
  },
  {
    id: "memory-workspace",
    icon: Brain,
    tag: "NEURAL GRAPH",
    title: "Persistent Memory Workspace",
    description:
      "A durable knowledge layer that connects projects, preferences, and prior decisions across your entire workspace.",
    preview: {
      type: "memory",
      nodes: [
        "Design Systems",
        "TypeScript Architecture",
        "Brand Guidelines",
        "User Preferences",
      ],
      status: "12,480 tokens in long-term index",
    },
  },
  {
    id: "image-video",
    icon: ImageIcon,
    tag: "GENERATIVE MATRIX",
    title: "Image & Video Generation",
    description:
      "Move from prompt to polished visual, concept frame, or cinematic sequence inside the same focused environment.",
    preview: {
      type: "render",
      resolution: "4K Cinema DCI",
      aspectRatio: "21:9 Widescreen",
      status: "Diffusion pipeline ready",
    },
  },
  {
    id: "code-gen",
    icon: Code2,
    tag: "SYNTACTIC ENGINE",
    title: "Advanced Code Generation",
    description:
      "Generate, review, debug, and explain production code across languages with architecture-aware reasoning.",
    preview: {
      type: "code",
      snippet:
        "const stream = await lexa.neural.pipeline({ target: 'production' });",
      status: "Zero compiler warnings",
    },
  },
] as const;

const MODELS = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    spec: "128k context",
    speed: "Instantaneous",
    strengths: "Complex reasoning, multimodal synthesis, and natural dialogue.",
    latency: "320ms",
    tier: "Tier 1 flagship",
    metrics: [98, 96, 97, 99],
  },
  {
    id: "gemini-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    spec: "2M context",
    speed: "High velocity",
    strengths: "Massive document parsing, video analysis, and code generation.",
    latency: "290ms",
    tier: "Tier 1 multimodal",
    metrics: [96, 94, 99, 97],
  },
  {
    id: "claude-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    spec: "200k context",
    speed: "Precision stream",
    strengths: "Nuanced writing, software architecture, and deep logical work.",
    latency: "310ms",
    tier: "Tier 1 reasoning",
    metrics: [99, 98, 96, 99],
  },
  {
    id: "lexa-ultra",
    name: "Lexa Ultra",
    provider: "Custom AI",
    spec: "Adaptive mesh",
    speed: "Sub-second",
    strengths: "Multi-model ensemble voting and autonomous workflow routing.",
    latency: "190ms",
    tier: "Lexa proprietary",
    metrics: [99, 99, 100, 99],
  },
] as const;

const STATS = [
  { value: "5M+", label: "Messages processed", sub: "Global throughput" },
  { value: "99.9%", label: "Uptime SLA", sub: "Enterprise grade" },
  { value: "50+", label: "Models supported", sub: "Unified catalog" },
  { value: "<1s", label: "Average latency", sub: "Edge accelerated" },
] as const;

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Essential intelligence for personal exploration.",
    features: [
      "100 messages/day",
      "GPT-4o mini access",
      "Real-time web search",
      "Voice synthesis",
      "Community support",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$20",
    period: "/month",
    description: "Directorial power for builders and professionals.",
    features: [
      "Unlimited messages",
      "All flagship AI models",
      "Image & video generation",
      "Persistent memory graph",
      "Priority routing",
      "Custom instructions",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$15",
    period: "/user/month",
    description: "Shared collective intelligence for organizations.",
    features: [
      "Everything in Pro",
      "Shared team workspaces",
      "Admin console",
      "SSO & enterprise SAML",
      "Dedicated API keys",
      "99.9% uptime SLA",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
] as const;

const FAQS = [
  {
    question: "What is Lexa AI?",
    answer:
      "Lexa is an intelligent workspace that brings frontier models, live web research, memory, voice, image, video, and code tools into one focused interface.",
  },
  {
    question: "Who is Lexa AI for?",
    answer:
      "It is built for professionals, developers, creators, and researchers who want one fast environment for thinking, building, and publishing.",
  },
  {
    question: "Which AI models can I use?",
    answer:
      "You can switch among leading OpenAI, Google, Anthropic, and Lexa models while carrying the same project context and memory forward.",
  },
  {
    question: "Does Lexa support live web search?",
    answer:
      "Yes. Lexa can search current web sources and return answers with citations and direct source links.",
  },
  {
    question: "Can Lexa generate images and videos?",
    answer:
      "Yes. Image and video generation are integrated directly into the workspace so ideas can move from text to visual output without changing tools.",
  },
  {
    question: "How do I get started?",
    answer:
      "Choose Start free, create an account, and open your workspace. You can upgrade only when you need higher limits or team features.",
  },
] as const;

const INTEGRATIONS = [
  "OpenAI",
  "Anthropic",
  "Google",
  "Supabase",
  "Vercel",
  "Stripe",
  "Slack",
  "Notion",
  "GitHub",
  "Figma",
  "Linear",
  "Zapier",
] as const;

const TESTIMONIALS = [
  {
    quote:
      "Lexa collapsed four tools into one. Our research velocity doubled overnight.",
    name: "Aria Chen",
    role: "Head of Product · Northwind",
  },
  {
    quote:
      "Model switching with shared memory feels genuinely seamless. Nothing else compares.",
    name: "Marcus Bell",
    role: "Staff Engineer · Vertex",
  },
  {
    quote:
      "Cinematic interface, serious speed. It replaced our entire AI stack in a week.",
    name: "Priya Nair",
    role: "Founder · Loop Studio",
  },
  {
    quote:
      "I write, debug, and ship faster than ever. Lexa is my unfair advantage.",
    name: "Diego Alvarez",
    role: "Independent Developer",
  },
] as const;

type Feature = (typeof FEATURES)[number];

function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.25,
      lerp: 0.09,
    });

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    window.__lexaLenis = lenis;

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__lexaLenis;
    };
  }, []);
}

function scrollToSection(selector: string) {
  if (window.__lexaLenis) {
    window.__lexaLenis.scrollTo(selector, { offset: -72, duration: 1.35 });
    return;
  }
  document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" });
}

function useFilmCursor() {
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    const cursor = document.createElement("div");
    cursor.className = "film-cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);

    const xTo = gsap.quickTo(cursor, "x", {
      duration: 0.32,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(cursor, "y", {
      duration: 0.32,
      ease: "power3.out",
    });

    const onMove = (event: PointerEvent) => {
      xTo(event.clientX);
      yTo(event.clientY);
      cursor.classList.add("is-visible");
    };
    const onOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("a, button, [data-cursor='active']"))
        cursor.classList.add("is-active");
    };
    const onOut = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("a, button, [data-cursor='active']"))
        cursor.classList.remove("is-active");
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      cursor.remove();
    };
  }, []);
}

function SplitHeading({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const words = children.split(" ");
  return (
    <h2 className={`split-heading ${className}`} aria-label={children}>
      {words.map((word, wordIndex) => (
        <span
          className="split-word"
          aria-hidden="true"
          key={`${word}-${wordIndex}`}
        >
          {Array.from(word).map((character, charIndex) => (
            <span className="split-char" key={`${character}-${charIndex}`}>
              {character}
            </span>
          ))}
          {wordIndex < words.length - 1 && (
            <span className="split-space">&nbsp;</span>
          )}
        </span>
      ))}
    </h2>
  );
}

function AnimatedNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const number = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
    if (Number.isNaN(number)) return;

    const prefix = value.match(/^[^0-9.]*/)?.[0] ?? "";
    const suffix = value.match(/[^0-9.]*$/)?.[0] ?? "";
    const decimals = value.includes(".")
      ? value.split(".")[1].replace(/[^0-9]/g, "").length
      : 0;
    const state = { current: 0 };
    const tween = gsap.to(state, {
      current: number,
      duration: 1.7,
      ease: "power3.out",
      paused: true,
      onUpdate: () => {
        element.textContent = `${prefix}${state.current.toFixed(decimals)}${suffix}`;
      },
    });
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: "top 88%",
      once: true,
      onEnter: () => tween.play(),
    });

    return () => {
      tween.kill();
      trigger.kill();
    };
  }, [value]);

  return <span ref={ref}>{value}</span>;
}

function TypingLine({ text }: { text: string }) {
  const [visible, setVisible] = useState("");

  useEffect(() => {
    setVisible("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisible(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [text]);

  return (
    <span>
      {visible}
      <span className="typing-caret" aria-hidden="true" />
    </span>
  );
}

function HeroTypingHeading() {
  const isReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [line1, setLine1] = useState(isReduced ? "One intelligence." : "");
  const [line2, setLine2] = useState(isReduced ? "Every mode." : "");
  const [activeLine, setActiveLine] = useState<1 | 2 | "done">(
    isReduced ? "done" : 1,
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const text1 = "One intelligence.";
    const text2 = "Every mode.";
    let i1 = 0;
    let i2 = 0;
    let timer1: ReturnType<typeof setInterval>;
    let timer2: ReturnType<typeof setInterval>;
    let timeout2: ReturnType<typeof setTimeout>;

    const startDelay = setTimeout(() => {
      timer1 = setInterval(() => {
        i1 += 1;
        setLine1(text1.slice(0, i1));
        if (i1 >= text1.length) {
          clearInterval(timer1);
          setActiveLine(2);
          timeout2 = setTimeout(() => {
            timer2 = setInterval(() => {
              i2 += 1;
              setLine2(text2.slice(0, i2));
              if (i2 >= text2.length) {
                clearInterval(timer2);
                setActiveLine("done");
              }
            }, 55);
          }, 350);
        }
      }, 42);
    }, 2200);

    return () => {
      clearTimeout(startDelay);
      clearTimeout(timeout2);
      clearInterval(timer1);
      clearInterval(timer2);
    };
  }, []);

  return (
    <h1 aria-label="One intelligence. Every mode.">
      <span className="hero-line" aria-hidden="true">
        <span>
          {line1}
          {activeLine === 1 && <span className="hero-typing-caret" />}
        </span>
      </span>
      <span className="hero-line hero-line-indent" aria-hidden="true">
        <span>
          {line2}
          {activeLine === 2 && <span className="hero-typing-caret" />}
        </span>
      </span>
    </h1>
  );
}

function PromptTypingText() {
  const isReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [line1, setLine1] = useState(isReduced ? "Build the next idea" : "");
  const [line2, setLine2] = useState(isReduced ? "without leaving the flow." : "");
  const [activeLine, setActiveLine] = useState<1 | 2 | "done">(
    isReduced ? "done" : 1,
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const text1 = "Build the next idea";
    const text2 = "without leaving the flow.";
    let i1 = 0;
    let i2 = 0;
    let timer1: ReturnType<typeof setInterval>;
    let timer2: ReturnType<typeof setInterval>;
    let timeout2: ReturnType<typeof setTimeout>;

    const startDelay = setTimeout(() => {
      timer1 = setInterval(() => {
        i1 += 1;
        setLine1(text1.slice(0, i1));
        if (i1 >= text1.length) {
          clearInterval(timer1);
          setActiveLine(2);
          timeout2 = setTimeout(() => {
            timer2 = setInterval(() => {
              i2 += 1;
              setLine2(text2.slice(0, i2));
              if (i2 >= text2.length) {
                clearInterval(timer2);
                setActiveLine("done");
              }
            }, 50);
          }, 200);
        }
      }, 45);
    }, 2800);

    return () => {
      clearTimeout(startDelay);
      clearTimeout(timeout2);
      clearInterval(timer1);
      clearInterval(timer2);
    };
  }, []);

  return (
    <p aria-label="Build the next idea without leaving the flow.">
      <span aria-hidden="true">
        {line1}
        {activeLine === 1 && <span className="typing-caret" />}
        <br />
        {line2}
        {activeLine === 2 && <span className="typing-caret" />}
      </span>
    </p>
  );
}

function FeaturePreview({ feature }: { feature: Feature }) {
  const preview = feature.preview;

  return (
    <div className="feature-preview" key={feature.id}>
      <div className="preview-head">
        <span>{feature.tag}</span>
        <span>
          0{FEATURES.findIndex((item) => item.id === feature.id) + 1} / 06
        </span>
      </div>

      <div className="preview-body">
        {preview.type === "chat" && (
          <div className="preview-chat">
            <span className="preview-kicker">Active context stream</span>
            <p>
              <TypingLine text={preview.prompt} />
            </p>
            <span className="preview-status">
              <Sparkles size={13} />
              {preview.badge}
            </span>
          </div>
        )}

        {preview.type === "search" && (
          <div className="preview-search">
            <p className="preview-query">{preview.query}</p>
            {preview.sources.map((source, index) => (
              <div className="source-row" key={source}>
                <span>0{index + 1}</span>
                <strong>{source}</strong>
                <Check size={14} />
              </div>
            ))}
          </div>
        )}

        {preview.type === "audio" && (
          <div className="preview-audio">
            <div className="waveform" aria-label="Animated voice waveform">
              {preview.waveform.map((height, index) => (
                <span
                  key={index}
                  style={{
                    height: `${height}%`,
                    animationDelay: `${index * -0.06}s`,
                  }}
                />
              ))}
            </div>
            <p>{preview.latency}</p>
          </div>
        )}

        {preview.type === "memory" && (
          <div className="preview-memory">
            {preview.nodes.map((node, index) => (
              <div className="memory-node" key={node}>
                <span>0{index + 1}</span>
                {node}
              </div>
            ))}
          </div>
        )}

        {preview.type === "render" && (
          <div className="preview-render">
            <div className="render-frame">
              <ImageIcon strokeWidth={1.3} />
              <span>GENERATIVE FRAME</span>
            </div>
            <div>
              <span>{preview.resolution}</span>
              <span>{preview.aspectRatio}</span>
            </div>
          </div>
        )}

        {preview.type === "code" && (
          <div className="preview-code">
            <span>01 / production.ts</span>
            <code>{preview.snippet}</code>
          </div>
        )}
      </div>

      <div className="preview-foot">
        <Activity size={14} />
        <span>{preview.status}</span>
        <i />
      </div>
    </div>
  );
}

function IntegrationMarquee() {
  const row = [...INTEGRATIONS, ...INTEGRATIONS];
  return (
    <section className="integration-strip" aria-label="Integrations">
      <div className="integration-label">CONNECTED SYSTEMS</div>
      <div className="marquee-window">
        <div className="marquee-track">
          {row.map((name, index) => (
            <span key={`${name}-${index}`}>{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  plan,
  onGetStarted,
}: {
  plan: (typeof PRICING)[number];
  onGetStarted: () => void;
}) {
  return (
    <article
      className={`pricing-card ${plan.highlighted ? "is-featured" : ""}`}
    >
      <div className="pricing-index">
        {plan.highlighted ? "RECOMMENDED" : "ACCESS"}
      </div>
      <h3>{plan.name}</h3>
      <p className="pricing-description">{plan.description}</p>
      <div className="pricing-price">
        <strong>{plan.price}</strong>
        <span>{plan.period}</span>
      </div>
      <ul>
        {plan.features.map((feature) => (
          <li key={feature}>
            <Check size={14} />
            {feature}
          </li>
        ))}
      </ul>
      <button
        className="editorial-button pricing-button"
        type="button"
        onClick={onGetStarted}
      >
        <span>{plan.cta}</span>
        <ArrowRight size={17} />
      </button>
    </article>
  );
}

function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % TESTIMONIALS.length),
      5200,
    );
    return () => window.clearInterval(timer);
  }, []);

  const item = TESTIMONIALS[active];
  return (
    <section className="testimonials-section section-shell">
      <div className="section-meta">
        <span>VOICES</span>
        <span>04 — 04</span>
      </div>
      <div className="testimonial-grid">
        <Quote className="quote-mark" strokeWidth={1} />
        <div className="testimonial-copy" key={active}>
          <blockquote>“{item.quote}”</blockquote>
          <div>
            <strong>{item.name}</strong>
            <span>{item.role}</span>
          </div>
        </div>
        <div className="testimonial-controls" aria-label="Testimonial controls">
          {TESTIMONIALS.map((testimonial, index) => (
            <button
              key={testimonial.name}
              type="button"
              aria-label={`Show testimonial ${index + 1}`}
              aria-pressed={active === index}
              onClick={() => setActive(index)}
            >
              0{index + 1}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  useLandingStyles();

  useSEO({
    title: "Lexa AI — One intelligence. Every mode.",
    description:
      "A cinematic AI workspace for research, writing, coding, voice, image, and video.",
    canonicalUrl: "/",
  });

  const navigate = useNavigate();
  const rootRef = useRef<HTMLElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [activeModelIndex, setActiveModelIndex] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  useSmoothScroll();
  useFilmCursor();

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) setIsAuthenticated(Boolean(session?.user));
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setIsAuthenticated(Boolean(session?.user));
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-is-open", menuOpen);
    return () => document.documentElement.classList.remove("menu-is-open");
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  const handleGetStarted = () => navigate(isAuthenticated ? "/chat" : "/auth");
  const goTo = (selector: string) => {
    setMenuOpen(false);
    scrollToSection(selector);
  };

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduced) {
        gsap.set(".screen-loader", { display: "none" });
        return;
      }

      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro
        .to(".screen-loader-burst-layer", {
          clipPath: "circle(150% at 50% 50%)",
          duration: 1.15,
          delay: 0.18,
          ease: "power4.inOut",
        })
        .to(".screen-loader-mark", { color: "#fff", duration: 0.18 }, 0.46)
        .to(".screen-loader", {
          autoAlpha: 0,
          duration: 0.28,
          pointerEvents: "none",
        })
        .from(".site-header", { yPercent: -110, duration: 0.8 }, "-=0.02")
        .from(
          ".hero-line > span",
          { yPercent: 118, rotate: 2.2, stagger: 0.08, duration: 1.15 },
          "-=0.55",
        )
        .from(
          ".hero-eyebrow, .hero-summary, .hero-actions, .scroll-cue",
          { opacity: 0, y: 26, stagger: 0.09, duration: 0.75 },
          "-=0.82",
        )
        .from(
          ".hero-stage",
          { opacity: 0, y: 90, scale: 0.97, duration: 1.1 },
          "-=0.7",
        );

      gsap.to(".scroll-progress-bar", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.25,
        },
      });

      gsap.to(".hero-stage", {
        yPercent: 14,
        scale: 0.975,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 1.1,
        },
      });

      gsap.utils.toArray<HTMLElement>(".split-heading").forEach((heading) => {
        gsap.from(heading.querySelectorAll(".split-char"), {
          yPercent: 120,
          opacity: 0,
          rotateX: -55,
          filter: "blur(8px)",
          duration: 0.9,
          stagger: 0.015,
          ease: "power4.out",
          scrollTrigger: { trigger: heading, start: "top 84%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 54,
          opacity: 0,
          duration: 0.95,
          ease: "power4.out",
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>(".feature-row").forEach((row, index) => {
        gsap.from(row, {
          yPercent: 70,
          opacity: 0,
          duration: 0.9,
          ease: "power4.out",
          scrollTrigger: { trigger: row, start: "top 92%", once: true },
        });
        ScrollTrigger.create({
          trigger: row,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveFeatureIndex(index),
          onEnterBack: () => setActiveFeatureIndex(index),
        });
      });

      gsap.from(".stat-item", {
        xPercent: -20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".stats-section",
          start: "top 82%",
          once: true,
        },
      });

      gsap.from(".pricing-card", {
        yPercent: 34,
        opacity: 0,
        stagger: 0.12,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".pricing-grid",
          start: "top 82%",
          once: true,
        },
      });

      return () => {
        intro.kill();
      };
    },
    { scope: rootRef },
  );

  const activeFeature = FEATURES[activeFeatureIndex];
  const activeModel = MODELS[activeModelIndex];

  return (
    <main className="palomino-lexa" ref={rootRef}>
      <div className="noise-overlay" aria-hidden="true" />

      <div className="screen-loader" aria-hidden="true">
        <div className="screen-loader-burst-layer" />
        <span className="screen-loader-mark">LEXA</span>
      </div>

      <header className="site-header">
        <div className="scroll-progress-bar" aria-hidden="true" />
        <Link className="brand" to="/" aria-label="Lexa home">
          <LogoIcon className="brand-icon" />
          <span>LEXA</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <button type="button" onClick={() => goTo("#features")}>
            Features
          </button>
          <button type="button" onClick={() => goTo("#intelligence")}>
            Intelligence
          </button>
          <button type="button" onClick={() => goTo("#pricing")}>
            Pricing
          </button>
          <button type="button" onClick={() => goTo("#faq")}>
            FAQ
          </button>
        </nav>

        <div className="header-actions">
          <span className="header-edition">AI / 2026</span>
          {isAuthenticated ? (
            <Link className="header-cta" to="/chat">
              Workspace <ArrowRight size={15} />
            </Link>
          ) : (
            <Link className="header-cta" to="/auth">
              Start free <ArrowRight size={15} />
            </Link>
          )}
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <div
        className={`mobile-menu ${menuOpen ? "is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="mobile-menu-links">
          {["Features", "Intelligence", "Pricing", "FAQ"].map(
            (label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => goTo(`#${label.toLowerCase()}`)}
              >
                <span>0{index + 1}</span>
                {label}
                <ArrowRight />
              </button>
            ),
          )}
        </div>
        <div className="mobile-menu-foot">
          <span>One intelligence.</span>
          <span>Every mode.</span>
        </div>
      </div>

      <section className="hero-section section-shell">
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <span>AI WORKSPACE</span>
            <span>BUILT FOR PROFESSIONALS</span>
          </div>
          <HeroTypingHeading />
          <div className="hero-lower">
            <p className="hero-summary">
              Research, write, code, speak, and create in one continuous
              workspace powered by the world’s most capable models.
            </p>
            <div className="hero-actions">
              <button
                className="editorial-button is-light"
                type="button"
                onClick={handleGetStarted}
              >
                <span>Start building free</span>
                <ArrowRight />
              </button>
              <button
                className="text-link"
                type="button"
                onClick={() => goTo("#features")}
              >
                Explore the system <ArrowDown />
              </button>
            </div>
          </div>
        </div>

        <div className="hero-stage" data-cursor="active">
          <div className="hero-stage-top">
            <span>LEXA / LIVE INTERFACE</span>
            <span>
              <i /> SYSTEM ONLINE
            </span>
          </div>
          <div className="hero-stage-core animation-sample">
            <span className="stage-index">01</span>
            <div>
              <span className="stage-label">ACTIVE PROMPT</span>
              <PromptTypingText />
            </div>
            <div className="stage-orbit" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="hero-stage-bottom">
            <span>GPT-4o · Claude · Gemini · Lexa Ultra</span>
            <span>128K+ CONTEXT</span>
          </div>
        </div>

        <button
          className="scroll-cue"
          type="button"
          onClick={() => goTo("#stats")}
        >
          <span>Scroll to discover</span>
          <ArrowDown />
        </button>
      </section>

      <section className="stats-section section-shell" id="stats">
        <div className="section-meta">
          <span>AT A GLANCE</span>
          <span>01 — 04</span>
        </div>
        <div className="stats-grid">
          {STATS.map((stat, index) => (
            <article className="stat-item" key={stat.label}>
              <span className="stat-index">0{index + 1}</span>
              <strong>
                <AnimatedNumber value={stat.value} />
              </strong>
              <div>
                <span>{stat.label}</span>
                <small>{stat.sub}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <IntegrationMarquee />

      <section className="features-section section-shell" id="features">
        <div className="section-meta">
          <span>CAPABILITIES</span>
          <span>02 — 04</span>
        </div>
        <div className="section-heading-row">
          <SplitHeading>Built to move at the speed of thought.</SplitHeading>
          <p data-reveal>
            Six connected systems. One continuous context. Every interaction is
            designed to stay fast, focused, and deeply personal.
          </p>
        </div>

        <div className="features-layout">
          <div className="feature-sticky">
            <FeaturePreview feature={activeFeature} />
          </div>
          <div className="feature-list">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              const active = index === activeFeatureIndex;
              return (
                <button
                  className={`feature-row ${active ? "is-active" : ""}`}
                  type="button"
                  key={feature.id}
                  onClick={() => setActiveFeatureIndex(index)}
                >
                  <span className="feature-number">0{index + 1}</span>
                  <span className="feature-icon">
                    <Icon strokeWidth={1.35} />
                  </span>
                  <span className="feature-copy">
                    <small>{feature.tag}</small>
                    <strong>{feature.title}</strong>
                    <p>{feature.description}</p>
                  </span>
                  <span className="feature-arrow">
                    <ArrowRight />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="models-section" id="intelligence">
        <div className="section-shell">
          <div className="section-meta section-meta-dark">
            <span>INTELLIGENCE MESH</span>
            <span>03 — 04</span>
          </div>
          <div className="section-heading-row models-heading">
            <SplitHeading>The world’s best AI, unified.</SplitHeading>
            <p data-reveal>
              Choose the right intelligence for the moment. Your memory and
              project context move with you.
            </p>
          </div>

          <div className="models-layout">
            <div className="model-tabs" role="tablist" aria-label="AI models">
              {MODELS.map((model, index) => (
                <button
                  key={model.id}
                  role="tab"
                  type="button"
                  aria-selected={activeModelIndex === index}
                  className={activeModelIndex === index ? "is-active" : ""}
                  onClick={() => setActiveModelIndex(index)}
                >
                  <span>0{index + 1}</span>
                  <strong>{model.name}</strong>
                  <small>{model.provider}</small>
                  <ChevronRight />
                </button>
              ))}
            </div>

            <article className="model-detail" key={activeModel.id}>
              <div className="model-detail-head">
                <span>{activeModel.provider}</span>
                <span>{activeModel.tier}</span>
              </div>
              <h3>{activeModel.name}</h3>
              <p>{activeModel.strengths}</p>
              <div className="model-specs">
                <div>
                  <span>Context</span>
                  <strong>{activeModel.spec}</strong>
                </div>
                <div>
                  <span>Latency</span>
                  <strong>{activeModel.latency}</strong>
                </div>
                <div>
                  <span>Throughput</span>
                  <strong>{activeModel.speed}</strong>
                </div>
              </div>
              <div className="metric-list">
                {[
                  "Deep reasoning",
                  "Code synthesis",
                  "Context retention",
                  "Instruction following",
                ].map((label, index) => (
                  <div className="metric" key={label}>
                    <span>{label}</span>
                    <strong>{activeModel.metrics[index]}%</strong>
                    <i>
                      <b style={{ width: `${activeModel.metrics[index]}%` }} />
                    </i>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="pricing-section section-shell" id="pricing">
        <div className="section-meta">
          <span>ACCESS</span>
          <span>PRICING</span>
        </div>
        <div className="section-heading-row">
          <SplitHeading>Start free. Scale when it matters.</SplitHeading>
          <p data-reveal>
            Clear access tiers with no visual noise and no hidden complexity.
          </p>
        </div>
        <div className="pricing-grid">
          {PRICING.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              onGetStarted={handleGetStarted}
            />
          ))}
        </div>
      </section>

      <section className="faq-section section-shell" id="faq">
        <div className="section-meta">
          <span>KNOWLEDGE BASE</span>
          <span>FAQ</span>
        </div>
        <div className="faq-layout">
          <SplitHeading>Questions, answered.</SplitHeading>
          <div className="faq-list">
            {FAQS.map((faq, index) => {
              const open = expandedFaq === index;
              return (
                <article
                  className={`faq-item ${open ? "is-open" : ""}`}
                  key={faq.question}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setExpandedFaq(open ? null : index)}
                  >
                    <span>0{index + 1}</span>
                    <strong>{faq.question}</strong>
                    {open ? <Minus /> : <Plus />}
                  </button>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <Testimonials />

      <section className="final-cta section-shell">
        <span className="final-kicker">
          <Zap size={14} /> YOUR NEXT WORKSPACE
        </span>
        <SplitHeading>Ready to work differently?</SplitHeading>
        <button
          className="editorial-button is-light final-button"
          type="button"
          onClick={handleGetStarted}
        >
          <span>Enter Lexa</span>
          <ArrowRight />
        </button>
      </section>

      <footer className="site-footer section-shell">
        <div className="footer-top">
          <div>
            <span>PRODUCT</span>
            <Link to="/pricing">Pricing</Link>
            <button type="button" onClick={() => goTo("#features")}>
              Features
            </button>
          </div>
          <div>
            <span>COMPANY</span>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div>
            <span>LEGAL</span>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
          <div className="footer-status">
            <i /> ALL SYSTEMS OPERATIONAL
          </div>
        </div>
        <div className="footer-word" aria-label="Lexa">
          LEXA
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Lexa AI</span>
          <span>ONE INTELLIGENCE · EVERY MODE</span>
          <button type="button" onClick={() => scrollToSection("body")}>
            BACK TO TOP ↑
          </button>
        </div>
      </footer>
    </main>
  );
}

const PALOMINO_LEXA_CSS = String.raw`
:root {
  --lexa-black: #000000;
  --lexa-ink: #090909;
  --lexa-white: #ffffff;
  --lexa-line: rgba(255, 255, 255, 0.22);
  --lexa-line-soft: rgba(255, 255, 255, 0.12);
  --lexa-muted: rgba(255, 255, 255, 0.62);
  --lexa-ease-out: cubic-bezier(0.3, 1, 0.7, 1);
  --lexa-ease-in-out: cubic-bezier(0.83, 0, 0.17, 1);
  --lexa-gutter: clamp(18px, 2.1vw, 34px);
  --lexa-section-y: clamp(92px, 11vw, 180px);
}

html {
  scrollbar-width: none;
  -ms-overflow-style: none;
  background: var(--lexa-black);
}

html::-webkit-scrollbar,
.palomino-lexa::-webkit-scrollbar {
  display: none;
}

html.menu-is-open,
html.menu-is-open body {
  overflow: hidden;
}

body {
  margin: 0;
  background: var(--lexa-black);
}

.palomino-lexa,
.palomino-lexa * {
  box-sizing: border-box;
}

.palomino-lexa {
  min-height: 100vh;
  overflow: hidden;
  position: relative;
  background: var(--lexa-black);
  color: var(--lexa-white);
  font-family: "Host Grotesk", "Arial", sans-serif;
  font-size: 16px;
  line-height: 1.2;
  isolation: isolate;
}

.palomino-lexa ::selection {
  background: var(--lexa-white);
  color: var(--lexa-black);
}

.palomino-lexa a,
.palomino-lexa button,
.palomino-lexa input,
.palomino-lexa textarea {
  color: inherit;
  font: inherit;
}

.palomino-lexa a {
  text-decoration: none;
}

.palomino-lexa button {
  border: 0;
  padding: 0;
  background: transparent;
}

.palomino-lexa button,
.palomino-lexa a {
  -webkit-tap-highlight-color: transparent;
}

.palomino-lexa button:focus-visible,
.palomino-lexa a:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 5px;
}

@media (hover: hover) and (pointer: fine) {
  .palomino-lexa,
  .palomino-lexa * {
    cursor: none !important;
  }
}

.noise-overlay {
  position: fixed;
  inset: 0;
  z-index: 8000;
  pointer-events: none;
  opacity: 0.11;
  mix-blend-mode: soft-light;
  background-color: transparent;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.72'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 150px 150px;
}

.film-cursor {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  background: #fff;
  mix-blend-mode: difference;
  transition:
    width 0.32s var(--lexa-ease-out),
    height 0.32s var(--lexa-ease-out),
    margin 0.32s var(--lexa-ease-out),
    opacity 0.2s ease;
}

.film-cursor.is-visible {
  opacity: 1;
}

.film-cursor.is-active {
  width: 62px;
  height: 62px;
  margin: -31px 0 0 -31px;
}

.screen-loader {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #fff;
  color: #000;
}

.screen-loader-burst-layer {
  position: absolute;
  inset: -2px;
  background: #000;
  clip-path: circle(0% at 50% 50%);
}

.screen-loader-mark {
  position: relative;
  z-index: 1;
  font-size: clamp(32px, 6vw, 88px);
  font-weight: 600;
  letter-spacing: 0.3em;
  text-indent: 0.3em;
}

.section-shell {
  width: 100%;
  padding-left: var(--lexa-gutter);
  padding-right: var(--lexa-gutter);
}

.section-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 54px;
  border-top: 1px solid var(--lexa-line);
  color: var(--lexa-muted);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.14em;
}

.section-meta-dark {
  border-color: rgba(0, 0, 0, 0.24);
  color: rgba(0, 0, 0, 0.55);
}

.site-header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 500;
  height: 74px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 var(--lexa-gutter);
  color: #fff;
  background: rgba(0, 0, 0, 0.7);
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.scroll-progress-bar {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 1px;
  transform: scaleX(0);
  transform-origin: left center;
  background: #fff;
}

.brand {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  font-size: 15px;
  font-weight: 650;
  letter-spacing: 0.18em;
}

.brand-icon {
  width: 24px;
  height: 24px;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: clamp(22px, 2.7vw, 44px);
}

.desktop-nav button,
.header-edition {
  min-height: 44px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color 0.25s ease;
}

.desktop-nav button {
  position: relative;
}

.desktop-nav button::after {
  content: "";
  position: absolute;
  left: 0;
  right: 100%;
  bottom: 8px;
  height: 1px;
  background: #fff;
  transition: right 0.4s var(--lexa-ease-out);
}

.desktop-nav button:hover {
  color: #fff;
}

.desktop-nav button:hover::after {
  right: 0;
}

.header-actions {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-cta {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 13px;
  padding: 0 18px;
  border: 1px solid #fff;
  background: #fff;
  color: #000 !important;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition:
    background 0.3s ease,
    color 0.3s ease;
}

.header-cta svg {
  transition: transform 0.35s var(--lexa-ease-out);
}

.header-cta:hover {
  background: transparent;
  color: #fff !important;
}

.header-cta:hover svg {
  transform: translateX(4px);
}

.menu-toggle {
  width: 44px;
  height: 44px;
  display: none;
  align-items: center;
  justify-content: center;
}

.menu-toggle svg {
  width: 22px;
}

.mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 450;
  visibility: hidden;
  opacity: 0;
  padding: 118px var(--lexa-gutter) 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #000;
  transform: translateY(-16px);
  transition:
    opacity 0.35s ease,
    transform 0.55s var(--lexa-ease-out),
    visibility 0.55s;
}

.mobile-menu.is-open {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}

.mobile-menu-links {
  border-top: 1px solid var(--lexa-line);
}

.mobile-menu-links button {
  width: 100%;
  min-height: 84px;
  display: grid;
  grid-template-columns: 48px 1fr 32px;
  align-items: center;
  border-bottom: 1px solid var(--lexa-line-soft);
  text-align: left;
  font-size: clamp(28px, 7vw, 44px);
}

.mobile-menu-links button > span {
  color: var(--lexa-muted);
  font-size: 11px;
  letter-spacing: 0.1em;
}

.mobile-menu-links svg {
  width: 23px;
}

.mobile-menu-foot {
  display: flex;
  justify-content: space-between;
  color: var(--lexa-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-section {
  position: relative;
  z-index: 2;
  min-height: 110svh;
  padding-top: clamp(138px, 15vw, 220px);
  padding-bottom: clamp(80px, 9vw, 140px);
  background:
    radial-gradient(
      circle at 80% 14%,
      rgba(255, 255, 255, 0.075),
      transparent 25vw
    ),
    #000;
}

.hero-copy {
  position: relative;
  z-index: 2;
}

.hero-eyebrow {
  display: flex;
  justify-content: space-between;
  margin-bottom: clamp(34px, 5vw, 72px);
  color: var(--lexa-muted);
  font-size: 11px;
  letter-spacing: 0.14em;
}

.hero-copy h1 {
  margin: 0;
  color: #fff;
  font-size: clamp(54px, 10.4vw, 154px);
  font-weight: 570;
  letter-spacing: -0.058em;
  line-height: 0.86;
}

.hero-line {
  display: block;
  overflow: hidden;
  padding: 0.08em 0 0.12em;
  min-height: 1em;
}

.hero-typing-caret {
  display: inline-block;
  width: 0.06em;
  height: 0.82em;
  background: #fff;
  margin-left: 0.08em;
  vertical-align: -0.04em;
  animation: hero-caret-blink 0.75s steps(1) infinite;
}

@keyframes hero-caret-blink {
  50% {
    opacity: 0;
  }
}

.hero-line > span {
  display: block;
  transform-origin: left bottom;
  will-change: transform;
}

.hero-line-indent {
  padding-left: 14vw;
}

.hero-lower {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 500px);
  gap: 64px;
  align-items: end;
  margin-top: clamp(42px, 6vw, 86px);
}

.hero-summary {
  grid-column: 2;
  max-width: 500px;
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: clamp(18px, 1.7vw, 25px);
  font-weight: 350;
  line-height: 1.28;
}

.hero-actions {
  grid-column: 2;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 22px;
}

.editorial-button {
  min-height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: 0 20px;
  border: 1px solid currentColor !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  transition:
    background 0.35s ease,
    color 0.35s ease,
    transform 0.18s ease;
}

.editorial-button.is-light {
  background: #fff !important;
  color: #000 !important;
}

.editorial-button svg {
  width: 18px;
  transition: transform 0.4s var(--lexa-ease-out);
}

.editorial-button:hover {
  background: #000 !important;
  color: #fff !important;
}

.editorial-button:hover svg {
  transform: translateX(5px);
}

.editorial-button:active {
  transform: scale(0.98);
}

.text-link {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--lexa-muted) !important;
  font-size: 12px !important;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  transition: color 0.25s ease;
}

.text-link svg {
  width: 16px;
  transition: transform 0.35s var(--lexa-ease-out);
}

.text-link:hover {
  color: #fff !important;
}

.text-link:hover svg {
  transform: translateY(4px);
}

.hero-stage {
  position: relative;
  z-index: 2;
  height: clamp(520px, 67vw, 780px);
  min-height: 520px;
  margin-top: clamp(82px, 11vw, 156px);
  overflow: hidden;
  border: 1px solid var(--lexa-line);
  background:
    linear-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.055) 1px, transparent 1px),
    radial-gradient(
      circle at 50% 47%,
      rgba(255, 255, 255, 0.12),
      rgba(255, 255, 255, 0.025) 28%,
      transparent 56%
    ),
    #060606;
  background-size:
    64px 64px,
    64px 64px,
    auto,
    auto;
  will-change: transform;
}

.hero-stage::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    #000 0,
    transparent 18%,
    transparent 78%,
    #000 100%
  );
  opacity: 0.72;
}

.hero-stage-top,
.hero-stage-bottom {
  position: absolute;
  z-index: 3;
  left: 22px;
  right: 22px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.13em;
}

.hero-stage-top {
  top: 19px;
}

.hero-stage-top span:last-child {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero-stage-top i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 12px #fff;
}

.hero-stage-bottom {
  bottom: 19px;
}

.hero-stage-core {
  position: absolute;
  z-index: 2;
  inset: 50% auto auto 50%;
  width: min(780px, 72%);
  transform: translate(-50%, -50%);
  display: grid;
  grid-template-columns: 70px 1fr;
  align-items: start;
  gap: 28px;
  padding: clamp(28px, 4vw, 58px);
  border: 1px solid rgba(255, 255, 255, 0.42);
  background: rgba(0, 0, 0, 0.64);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  will-change: transform;
}

.animation-sample {
  animation: sample 6s ease-in-out infinite;
}

@keyframes sample {
  0%,
  100% {
    transform: translate(-50%, -50%) translateY(0);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-10px);
  }
}

.stage-index,
.stage-label {
  color: rgba(255, 255, 255, 0.56);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.16em;
}

.hero-stage-core p {
  max-width: 620px;
  margin: 24px 0 0;
  font-size: clamp(32px, 5.1vw, 78px);
  font-weight: 500;
  letter-spacing: -0.045em;
  line-height: 0.98;
  min-height: 1.96em;
}

.stage-orbit {
  position: absolute;
  right: -15%;
  bottom: -54%;
  width: 420px;
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 50%;
  animation: orbit-spin 18s linear infinite;
}

.stage-orbit span {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 50%;
}

.stage-orbit span:nth-child(1) {
  inset: 16%;
}
.stage-orbit span:nth-child(2) {
  inset: 33%;
}
.stage-orbit span:nth-child(3) {
  top: -4px;
  left: 50%;
  width: 8px;
  height: 8px;
  background: #fff;
  box-shadow: 0 0 18px #fff;
}

@keyframes orbit-spin {
  to {
    transform: rotate(360deg);
  }
}

.scroll-cue {
  min-height: 52px;
  margin-top: 26px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--lexa-muted) !important;
  font-size: 11px !important;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.scroll-cue svg {
  width: 15px;
}

.stats-section {
  position: relative;
  z-index: 2;
  padding-bottom: var(--lexa-section-y);
  background: #000;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--lexa-line-soft);
}

.stat-item {
  min-height: 310px;
  padding: 22px 24px 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid var(--lexa-line-soft);
}

.stat-item:last-child {
  border-right: 0;
}

.stat-index {
  color: var(--lexa-muted);
  font-size: 10px;
  letter-spacing: 0.12em;
}

.stat-item > strong {
  font-size: clamp(50px, 6vw, 96px);
  font-weight: 500;
  letter-spacing: -0.055em;
}

.stat-item > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 14px;
}

.stat-item small {
  color: var(--lexa-muted);
  font-size: 12px;
}

.integration-strip {
  position: relative;
  z-index: 2;
  padding: 0 0 clamp(80px, 9vw, 140px);
  overflow: hidden;
  background: #000;
}

.integration-label {
  margin: 0 var(--lexa-gutter) 24px;
  color: var(--lexa-muted);
  font-size: 10px;
  letter-spacing: 0.13em;
}

.marquee-window {
  overflow: hidden;
  padding: 28px 0;
  border-top: 1px solid var(--lexa-line);
  border-bottom: 1px solid var(--lexa-line);
}

.marquee-track {
  width: max-content;
  display: flex;
  align-items: center;
  animation: lexa-marquee 32s linear infinite;
  will-change: transform;
}

.marquee-track span {
  display: inline-flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.58);
  font-size: clamp(26px, 3vw, 48px);
  font-weight: 500;
  letter-spacing: -0.03em;
  white-space: nowrap;
  transition: color 0.25s ease;
}

.marquee-track span::after {
  content: "✦";
  margin: 0 44px;
  color: rgba(255, 255, 255, 0.26);
  font-size: 0.46em;
}

.marquee-track span:hover {
  color: #fff;
}
.marquee-window:hover .marquee-track {
  animation-play-state: paused;
}

@keyframes lexa-marquee {
  to {
    transform: translateX(-50%);
  }
}

.features-section {
  position: relative;
  z-index: 2;
  padding-bottom: var(--lexa-section-y);
  background: #000;
}

.section-heading-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 440px);
  gap: clamp(54px, 8vw, 130px);
  align-items: end;
  padding: clamp(60px, 8vw, 120px) 0 clamp(70px, 10vw, 150px);
}

.split-heading {
  margin: 0;
  max-width: 1080px;
  font-size: clamp(48px, 7.4vw, 112px);
  font-weight: 560;
  letter-spacing: -0.058em;
  line-height: 0.93;
  perspective: 800px;
}

.split-word {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  vertical-align: bottom;
}

.split-char,
.split-space {
  display: inline-block;
  transform-origin: 50% 100%;
  will-change: transform, opacity;
}

.section-heading-row > p {
  max-width: 440px;
  margin: 0;
  color: var(--lexa-muted);
  font-size: clamp(17px, 1.45vw, 22px);
  font-weight: 350;
  line-height: 1.34;
}

.features-layout {
  display: grid;
  grid-template-columns: minmax(340px, 0.9fr) minmax(480px, 1.1fr);
  gap: clamp(36px, 6vw, 100px);
  align-items: start;
}

.feature-sticky {
  position: sticky;
  top: 104px;
}

.feature-preview {
  min-height: 620px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--lexa-line);
  overflow: hidden;
  background:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    #050505;
  background-size: 42px 42px;
  animation: preview-enter 0.62s var(--lexa-ease-out) both;
}

@keyframes preview-enter {
  from {
    opacity: 0;
    transform: translateY(26px);
    filter: blur(7px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.preview-head,
.preview-foot {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 20px;
  color: var(--lexa-muted);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.preview-head {
  border-bottom: 1px solid var(--lexa-line-soft);
}

.preview-foot {
  justify-content: flex-start;
  margin-top: auto;
  border-top: 1px solid var(--lexa-line-soft);
}

.preview-foot i {
  width: 7px;
  height: 7px;
  margin-left: auto;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
  animation: status-pulse 1.8s ease-in-out infinite;
}

@keyframes status-pulse {
  50% {
    opacity: 0.25;
    transform: scale(0.72);
  }
}

.preview-body {
  flex: 1;
  display: grid;
  place-items: center;
  padding: clamp(26px, 4vw, 58px);
}

.preview-chat,
.preview-search,
.preview-audio,
.preview-memory,
.preview-render,
.preview-code {
  width: 100%;
}

.preview-kicker {
  color: var(--lexa-muted);
  font-size: 10px;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.preview-chat p {
  min-height: 120px;
  margin: 28px 0 34px;
  font-size: clamp(28px, 3.2vw, 52px);
  font-weight: 480;
  letter-spacing: -0.035em;
  line-height: 1.04;
}

.preview-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #fff;
  font-size: 11px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.typing-caret {
  display: inline-block;
  width: 2px;
  height: 0.8em;
  margin-left: 3px;
  background: #fff;
  animation: caret-blink 0.7s steps(1) infinite;
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}

.preview-query {
  margin: 0 0 40px;
  font-size: clamp(25px, 3vw, 46px);
  letter-spacing: -0.035em;
}

.source-row {
  min-height: 56px;
  display: grid;
  grid-template-columns: 38px 1fr 20px;
  align-items: center;
  border-top: 1px solid var(--lexa-line-soft);
  font-size: 13px;
}

.source-row > span {
  color: var(--lexa-muted);
  font-size: 10px;
}
.source-row strong {
  font-weight: 450;
}

.preview-audio {
  text-align: center;
}

.waveform {
  height: 170px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(5px, 0.7vw, 10px);
}

.waveform span {
  width: 5px;
  min-height: 8px;
  background: #fff;
  transform-origin: center;
  animation: waveform 1.35s ease-in-out infinite alternate;
}

@keyframes waveform {
  50% {
    transform: scaleY(0.52);
    opacity: 0.42;
  }
}

.preview-audio p {
  margin: 26px 0 0;
  color: var(--lexa-muted);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.preview-memory {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid var(--lexa-line);
  border-left: 1px solid var(--lexa-line);
}

.memory-node {
  min-height: 112px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px;
  border-right: 1px solid var(--lexa-line);
  border-bottom: 1px solid var(--lexa-line);
  font-size: 15px;
}

.memory-node span {
  color: var(--lexa-muted);
  font-size: 10px;
}

.render-frame {
  height: 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  border: 1px solid var(--lexa-line);
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.14),
    transparent 56%
  );
}

.render-frame svg {
  width: 52px;
  height: 52px;
}
.render-frame span {
  font-size: 10px;
  letter-spacing: 0.14em;
}

.preview-render > div:last-child {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
  color: var(--lexa-muted);
  font-size: 11px;
  text-transform: uppercase;
}

.preview-code {
  border-top: 1px solid var(--lexa-line);
  border-bottom: 1px solid var(--lexa-line);
  padding: 24px 0;
}

.preview-code > span {
  display: block;
  margin-bottom: 35px;
  color: var(--lexa-muted);
  font-size: 10px;
  letter-spacing: 0.12em;
}

.preview-code code {
  display: block;
  overflow-wrap: anywhere;
  font-family: "Courier New", monospace;
  font-size: clamp(17px, 2vw, 28px);
  line-height: 1.5;
}

.feature-list {
  border-top: 1px solid var(--lexa-line);
}

.feature-row {
  position: relative;
  width: 100%;
  min-height: 270px;
  display: grid;
  grid-template-columns: 52px 54px 1fr 34px;
  gap: 18px;
  align-items: start;
  padding: 28px 20px 32px 0;
  overflow: hidden;
  border-bottom: 1px solid var(--lexa-line) !important;
  color: #fff !important;
  text-align: left;
  transition:
    color 0.48s var(--lexa-ease-out),
    padding-left 0.48s var(--lexa-ease-out);
  isolation: isolate;
}

.feature-row > * {
  position: relative;
  z-index: 1;
}

.feature-row::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  background: #fff;
  transform: translateY(101%);
  transition: transform 0.55s var(--lexa-ease-in-out);
}

.feature-row:hover,
.feature-row.is-active {
  color: #000 !important;
  padding-left: 18px;
}

.feature-row:hover::before,
.feature-row.is-active::before {
  transform: translateY(0);
}

.feature-number {
  color: currentColor;
  opacity: 0.55;
  font-size: 10px;
  letter-spacing: 0.12em;
}

.feature-icon svg {
  width: 29px;
  height: 29px;
  transition: transform 0.5s var(--lexa-ease-out);
}

.feature-row:hover .feature-icon svg,
.feature-row.is-active .feature-icon svg {
  transform: rotate(-7deg) scale(1.08);
}

.feature-copy {
  display: flex;
  flex-direction: column;
}

.feature-copy small {
  margin-bottom: 18px;
  opacity: 0.58;
  font-size: 9px;
  letter-spacing: 0.14em;
}

.feature-copy strong {
  font-size: clamp(25px, 3vw, 46px);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1;
}

.feature-copy p {
  max-width: 590px;
  margin: 24px 0 0;
  opacity: 0.62;
  font-size: 15px;
  font-weight: 370;
  line-height: 1.42;
}

.feature-arrow {
  align-self: center;
}

.feature-arrow svg {
  width: 23px;
  transition: transform 0.45s var(--lexa-ease-out);
}

.feature-row:hover .feature-arrow svg,
.feature-row.is-active .feature-arrow svg {
  transform: translateX(5px);
}

.models-section {
  position: relative;
  z-index: 2;
  padding: var(--lexa-section-y) 0;
  background: #fff;
  color: #000;
}

.models-heading > p {
  color: rgba(0, 0, 0, 0.58);
}

.models-layout {
  display: grid;
  grid-template-columns: minmax(350px, 0.92fr) minmax(460px, 1.08fr);
  gap: clamp(42px, 8vw, 130px);
  align-items: start;
}

.model-tabs {
  border-top: 1px solid rgba(0, 0, 0, 0.25);
}

.model-tabs button {
  width: 100%;
  min-height: 98px;
  display: grid;
  grid-template-columns: 46px 1fr auto 26px;
  gap: 16px;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2) !important;
  color: #000 !important;
  text-align: left;
  transition:
    padding-left 0.4s var(--lexa-ease-out),
    background 0.3s ease;
}

.model-tabs button:hover,
.model-tabs button.is-active {
  padding-left: 16px;
  background: #000;
  color: #fff !important;
}

.model-tabs button > span,
.model-tabs button > small {
  opacity: 0.58;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.model-tabs button > strong {
  font-size: clamp(21px, 2.2vw, 34px);
  font-weight: 500;
  letter-spacing: -0.035em;
}

.model-tabs button svg {
  width: 18px;
  transition: transform 0.35s var(--lexa-ease-out);
}

.model-tabs button:hover svg,
.model-tabs button.is-active svg {
  transform: translateX(4px);
}

.model-detail {
  position: sticky;
  top: 106px;
  min-height: 590px;
  padding: clamp(30px, 4.5vw, 66px);
  border: 1px solid rgba(0, 0, 0, 0.32);
  background:
    linear-gradient(rgba(0, 0, 0, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.055) 1px, transparent 1px), #f7f7f5;
  background-size: 46px 46px;
  animation: model-enter 0.62s var(--lexa-ease-out) both;
}

@keyframes model-enter {
  from {
    opacity: 0;
    transform: translateY(28px);
    filter: blur(7px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.model-detail-head {
  display: flex;
  justify-content: space-between;
  color: rgba(0, 0, 0, 0.55);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.model-detail h3 {
  margin: clamp(60px, 8vw, 112px) 0 18px;
  font-size: clamp(50px, 6.3vw, 96px);
  font-weight: 560;
  letter-spacing: -0.06em;
  line-height: 0.9;
}

.model-detail > p {
  max-width: 600px;
  margin: 0;
  color: rgba(0, 0, 0, 0.62);
  font-size: clamp(17px, 1.5vw, 22px);
  line-height: 1.35;
}

.model-specs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 48px;
  border-top: 1px solid rgba(0, 0, 0, 0.22);
  border-bottom: 1px solid rgba(0, 0, 0, 0.22);
}

.model-specs > div {
  min-height: 104px;
  padding: 18px 12px 18px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid rgba(0, 0, 0, 0.18);
}

.model-specs > div:not(:first-child) {
  padding-left: 16px;
}
.model-specs > div:last-child {
  border-right: 0;
}
.model-specs span {
  color: rgba(0, 0, 0, 0.52);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.model-specs strong {
  font-size: 15px;
  font-weight: 520;
}

.metric-list {
  margin-top: 35px;
}

.metric {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 9px 20px;
  margin-top: 18px;
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.metric > i {
  grid-column: 1 / -1;
  height: 2px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.13);
}

.metric > i > b {
  display: block;
  height: 100%;
  background: #000;
  animation: metric-grow 0.8s var(--lexa-ease-out) both;
  transform-origin: left;
}

@keyframes metric-grow {
  from {
    transform: scaleX(0);
  }
}

.pricing-section {
  position: relative;
  z-index: 2;
  padding-top: var(--lexa-section-y);
  padding-bottom: var(--lexa-section-y);
  background: #000;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--lexa-line);
  border-left: 1px solid var(--lexa-line);
}

.pricing-card {
  min-height: 690px;
  display: flex;
  flex-direction: column;
  padding: clamp(26px, 3vw, 44px);
  border-right: 1px solid var(--lexa-line);
  border-bottom: 1px solid var(--lexa-line);
  background: #000;
  color: #fff;
  transition:
    transform 0.55s var(--lexa-ease-out),
    background 0.35s ease,
    color 0.35s ease;
}

.pricing-card:hover {
  transform: translateY(-10px);
}

.pricing-card.is-featured {
  background: #fff;
  color: #000;
}

.pricing-index {
  min-height: 50px;
  color: currentColor;
  opacity: 0.56;
  font-size: 10px;
  letter-spacing: 0.13em;
}

.pricing-card h3 {
  margin: 32px 0 16px;
  font-size: clamp(36px, 4vw, 62px);
  font-weight: 520;
  letter-spacing: -0.05em;
}

.pricing-description {
  min-height: 50px;
  margin: 0;
  opacity: 0.64;
  font-size: 15px;
  line-height: 1.4;
}

.pricing-price {
  min-height: 150px;
  display: flex;
  align-items: baseline;
  gap: 9px;
  margin-top: 44px;
  padding: 28px 0;
  border-top: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
}

.pricing-price strong {
  font-size: clamp(55px, 6vw, 92px);
  font-weight: 520;
  letter-spacing: -0.065em;
}

.pricing-price span {
  opacity: 0.58;
  font-size: 11px;
  text-transform: uppercase;
}

.pricing-card ul {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 32px 0 40px;
  padding: 0;
  list-style: none;
}

.pricing-card li {
  display: flex;
  align-items: center;
  gap: 11px;
  opacity: 0.78;
  font-size: 13px;
}

.pricing-button {
  width: 100%;
  margin-top: auto;
}

.pricing-card:not(.is-featured) .pricing-button {
  background: #fff !important;
  color: #000 !important;
}

.pricing-card.is-featured .pricing-button {
  background: #000 !important;
  color: #fff !important;
}

.pricing-card:not(.is-featured) .pricing-button:hover {
  background: #000 !important;
  color: #fff !important;
  box-shadow: inset 0 0 0 1px #fff;
}

.pricing-card.is-featured .pricing-button:hover {
  background: #fff !important;
  color: #000 !important;
  box-shadow: inset 0 0 0 1px #000;
}

.faq-section {
  position: relative;
  z-index: 2;
  padding-bottom: var(--lexa-section-y);
  background: #000;
}

.faq-layout {
  display: grid;
  grid-template-columns: minmax(300px, 0.78fr) minmax(500px, 1.22fr);
  gap: clamp(50px, 9vw, 150px);
  padding-top: clamp(64px, 8vw, 122px);
}

.faq-layout .split-heading {
  position: sticky;
  top: 112px;
  align-self: start;
  font-size: clamp(48px, 6.4vw, 96px);
}

.faq-list {
  border-top: 1px solid var(--lexa-line);
}

.faq-item {
  border-bottom: 1px solid var(--lexa-line);
}

.faq-item > button {
  width: 100%;
  min-height: 102px;
  display: grid;
  grid-template-columns: 48px 1fr 30px;
  align-items: center;
  gap: 18px;
  color: #fff !important;
  text-align: left;
}

.faq-item > button > span {
  color: var(--lexa-muted);
  font-size: 10px;
}

.faq-item > button > strong {
  font-size: clamp(18px, 1.8vw, 27px);
  font-weight: 470;
  letter-spacing: -0.025em;
}

.faq-item > button svg {
  width: 20px;
  transition: transform 0.4s var(--lexa-ease-out);
}

.faq-item:hover > button svg {
  transform: rotate(90deg);
}

.faq-answer {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows 0.5s var(--lexa-ease-out),
    opacity 0.35s ease;
}

.faq-answer > p {
  min-height: 0;
  overflow: hidden;
  max-width: 720px;
  margin: 0 48px 0 66px;
  color: var(--lexa-muted);
  font-size: 16px;
  line-height: 1.5;
}

.faq-item.is-open .faq-answer {
  grid-template-rows: 1fr;
  opacity: 1;
}

.faq-item.is-open .faq-answer > p {
  padding-bottom: 34px;
}

.testimonials-section {
  position: relative;
  z-index: 2;
  padding-bottom: var(--lexa-section-y);
  background: #000;
}

.testimonial-grid {
  min-height: 560px;
  display: grid;
  grid-template-columns: 150px 1fr 100px;
  gap: 40px;
  align-items: center;
  border-bottom: 1px solid var(--lexa-line);
}

.quote-mark {
  align-self: start;
  width: 66px;
  height: 66px;
  margin-top: 70px;
}

.testimonial-copy {
  animation: testimonial-in 0.7s var(--lexa-ease-out) both;
}

@keyframes testimonial-in {
  from {
    opacity: 0;
    transform: translateY(36px);
    filter: blur(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.testimonial-copy blockquote {
  max-width: 1040px;
  margin: 0;
  font-size: clamp(38px, 5.8vw, 86px);
  font-weight: 450;
  letter-spacing: -0.05em;
  line-height: 0.99;
}

.testimonial-copy > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 50px;
  font-size: 13px;
}

.testimonial-copy > div strong {
  font-weight: 520;
}
.testimonial-copy > div span {
  color: var(--lexa-muted);
}

.testimonial-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.testimonial-controls button {
  width: 46px;
  height: 46px;
  border: 1px solid var(--lexa-line) !important;
  color: var(--lexa-muted) !important;
  font-size: 10px !important;
  transition:
    background 0.25s ease,
    color 0.25s ease;
}

.testimonial-controls button[aria-pressed="true"],
.testimonial-controls button:hover {
  background: #fff;
  color: #000 !important;
}

.final-cta {
  position: relative;
  z-index: 2;
  min-height: 90svh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;
  border-top: 1px solid var(--lexa-line);
  background:
    radial-gradient(
      circle at 74% 50%,
      rgba(255, 255, 255, 0.1),
      transparent 25vw
    ),
    #000;
}

.final-cta::before {
  content: "";
  position: absolute;
  right: -12vw;
  top: 50%;
  width: min(62vw, 900px);
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 50%;
  transform: translateY(-50%);
  animation: orbit-spin 32s linear infinite;
}

.final-kicker {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 42px;
  color: var(--lexa-muted);
  font-size: 10px;
  letter-spacing: 0.13em;
}

.final-cta .split-heading {
  position: relative;
  z-index: 1;
  max-width: 1120px;
  font-size: clamp(58px, 9.5vw, 146px);
}

.final-button {
  position: relative;
  z-index: 1;
  margin-top: 58px;
  min-width: 250px;
}

.site-footer {
  position: relative;
  z-index: 2;
  padding-top: 72px;
  padding-bottom: 28px;
  border-top: 1px solid var(--lexa-line);
  background: #000;
}

.footer-top {
  display: grid;
  grid-template-columns: repeat(3, 150px) 1fr;
  gap: 44px;
}

.footer-top > div:not(.footer-status) {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 11px;
}

.footer-top > div > span {
  margin-bottom: 9px;
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.13em;
}

.footer-top a,
.footer-top button {
  min-height: 24px;
  color: rgba(255, 255, 255, 0.72) !important;
  font-size: 13px !important;
  transition: color 0.2s ease;
}

.footer-top a:hover,
.footer-top button:hover {
  color: #fff !important;
}

.footer-status {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 9px;
  align-self: start;
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.12em;
}

.footer-status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 10px #fff;
}

.footer-word {
  margin: clamp(100px, 13vw, 210px) -0.04em 0;
  overflow: hidden;
  font-size: clamp(130px, 28.2vw, 430px);
  font-weight: 580;
  letter-spacing: -0.082em;
  line-height: 0.65;
  white-space: nowrap;
}

.footer-bottom {
  min-height: 70px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-top: 46px;
  padding-top: 20px;
  border-top: 1px solid var(--lexa-line);
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.12em;
}

.footer-bottom button {
  min-height: 38px;
  color: #fff !important;
  font-size: 9px !important;
  letter-spacing: 0.12em;
}

@media (max-width: 1100px) {
  .desktop-nav {
    display: none;
  }
  .site-header {
    grid-template-columns: 1fr auto;
  }
  .header-edition {
    display: none;
  }
  .menu-toggle {
    display: inline-flex;
  }

  .hero-line-indent {
    padding-left: 7vw;
  }
  .hero-lower {
    grid-template-columns: 1fr minmax(300px, 440px);
  }

  .features-layout,
  .models-layout {
    grid-template-columns: 1fr;
  }

  .feature-sticky,
  .model-detail {
    position: relative;
    top: auto;
  }

  .feature-preview {
    min-height: 540px;
  }
  .faq-layout {
    grid-template-columns: 0.72fr 1.28fr;
    gap: 54px;
  }
}

@media (max-width: 820px) {
  :root {
    --lexa-section-y: 92px;
  }

  .site-header {
    height: 66px;
  }
  .header-cta {
    display: none;
  }
  .brand {
    min-height: 42px;
  }

  .hero-section {
    min-height: auto;
    padding-top: 126px;
  }

  .hero-eyebrow span:last-child {
    display: none;
  }
  .hero-copy h1 {
    font-size: clamp(54px, 14vw, 92px);
    line-height: 0.9;
  }
  .hero-line-indent {
    padding-left: 0;
  }
  .hero-lower {
    display: block;
    margin-top: 42px;
  }
  .hero-summary {
    max-width: 560px;
  }
  .hero-actions {
    margin-top: 30px;
  }
  .hero-stage {
    height: 590px;
    margin-top: 76px;
    background-size: 48px 48px;
  }
  .hero-stage-core {
    width: calc(100% - 42px);
    grid-template-columns: 40px 1fr;
    padding: 26px;
  }
  .stage-orbit {
    width: 300px;
  }
  .hero-stage-top span:last-child,
  .hero-stage-bottom span:last-child {
    display: none;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  .stat-item {
    min-height: 250px;
    border-bottom: 1px solid var(--lexa-line-soft);
  }
  .stat-item:nth-child(2) {
    border-right: 0;
  }

  .section-heading-row {
    grid-template-columns: 1fr;
    gap: 36px;
    padding: 60px 0 82px;
  }
  .split-heading {
    font-size: clamp(48px, 12vw, 80px);
  }
  .section-heading-row > p {
    max-width: 590px;
  }

  .feature-row {
    min-height: 240px;
    grid-template-columns: 42px 42px 1fr 24px;
    gap: 12px;
  }
  .feature-copy p {
    font-size: 14px;
  }

  .model-detail {
    min-height: 530px;
  }
  .model-detail h3 {
    margin-top: 70px;
  }

  .pricing-grid {
    grid-template-columns: 1fr;
  }
  .pricing-card {
    min-height: 620px;
  }
  .pricing-card:hover {
    transform: none;
  }

  .faq-layout {
    grid-template-columns: 1fr;
  }
  .faq-layout .split-heading {
    position: relative;
    top: auto;
    margin-bottom: 30px;
  }

  .testimonial-grid {
    grid-template-columns: 70px 1fr;
    min-height: 520px;
  }
  .testimonial-controls {
    grid-column: 2;
    flex-direction: row;
    margin-bottom: 40px;
  }

  .footer-top {
    grid-template-columns: repeat(3, 1fr);
  }
  .footer-status {
    grid-column: 1 / -1;
    justify-self: start;
    margin-top: 20px;
  }
  .footer-word {
    line-height: 0.74;
  }
}

@media (max-width: 560px) {
  :root {
    --lexa-gutter: 18px;
  }

  .mobile-menu {
    padding-top: 102px;
  }
  .mobile-menu-links button {
    min-height: 74px;
  }
  .mobile-menu-foot {
    flex-direction: column;
    gap: 4px;
  }

  .hero-section {
    padding-top: 112px;
    padding-bottom: 70px;
  }
  .hero-copy h1 {
    font-size: clamp(50px, 15vw, 76px);
    letter-spacing: -0.06em;
  }
  .hero-summary {
    font-size: 17px;
  }
  .hero-actions {
    align-items: stretch;
    flex-direction: column;
  }
  .editorial-button {
    width: 100%;
    min-height: 52px;
  }
  .text-link {
    width: 100%;
    justify-content: space-between;
  }

  .hero-stage {
    min-height: 510px;
    height: 510px;
  }
  .hero-stage-core {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 22px;
  }
  .hero-stage-core p {
    font-size: 35px;
  }
  .stage-orbit {
    right: -48%;
    bottom: -35%;
    width: 260px;
  }
  .hero-stage-bottom {
    font-size: 8px;
  }

  .section-meta {
    min-height: 46px;
    font-size: 9px;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .stat-item {
    min-height: 220px;
    border-right: 0;
  }
  .stat-item > strong {
    font-size: 68px;
  }

  .marquee-track span::after {
    margin: 0 28px;
  }

  .feature-preview {
    min-height: 480px;
  }
  .preview-body {
    padding: 24px;
  }
  .preview-memory {
    grid-template-columns: 1fr;
  }
  .memory-node {
    min-height: 76px;
  }
  .render-frame {
    height: 180px;
  }
  .feature-row {
    min-height: 260px;
    grid-template-columns: 30px 1fr 24px;
    padding-right: 6px;
  }
  .feature-icon {
    display: none;
  }
  .feature-copy strong {
    font-size: 29px;
  }
  .feature-row:hover,
  .feature-row.is-active {
    padding-left: 10px;
  }

  .models-section {
    padding-top: 86px;
    padding-bottom: 86px;
  }
  .model-tabs button {
    grid-template-columns: 34px 1fr 20px;
    min-height: 82px;
  }
  .model-tabs button > small {
    display: none;
  }
  .model-detail {
    min-height: 0;
    padding: 25px;
  }
  .model-detail h3 {
    margin-top: 56px;
    font-size: 52px;
  }
  .model-specs {
    grid-template-columns: 1fr;
  }
  .model-specs > div {
    min-height: 72px;
    border-right: 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.15);
    padding-left: 0 !important;
  }

  .pricing-card {
    min-height: 600px;
    padding: 26px 22px;
  }
  .pricing-price {
    min-height: 130px;
  }

  .faq-item > button {
    grid-template-columns: 30px 1fr 24px;
    gap: 10px;
    min-height: 88px;
  }
  .faq-answer > p {
    margin: 0 0 0 40px;
    font-size: 15px;
  }

  .testimonial-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    min-height: 540px;
  }
  .quote-mark {
    width: 48px;
    height: 48px;
    margin-top: 50px;
  }
  .testimonial-copy blockquote {
    font-size: 40px;
  }
  .testimonial-controls {
    grid-column: 1;
  }

  .final-cta {
    min-height: 76svh;
  }
  .final-cta .split-heading {
    font-size: 58px;
  }
  .final-button {
    min-width: 0;
  }

  .footer-top {
    grid-template-columns: 1fr 1fr;
    gap: 42px 22px;
  }
  .footer-top > div:nth-child(3) {
    grid-column: 1 / -1;
  }
  .footer-word {
    margin-top: 112px;
    font-size: 35vw;
  }
  .footer-bottom {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .palomino-lexa *,
  .palomino-lexa *::before,
  .palomino-lexa *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }

  .screen-loader {
    display: none !important;
  }
  .marquee-track {
    transform: translateX(0);
  }
  .film-cursor {
    display: none;
  }
}
`;
