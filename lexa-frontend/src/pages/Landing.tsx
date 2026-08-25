import {
  useEffect,
  useInsertionEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Brain,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  CornerDownLeft,
  Cpu,
  Download,
  FileText,
  FlaskConical,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  KeyRound,
  LockKeyhole,
  Menu,
  MessageSquare,
  Mic,
  Minus,
  Palette,
  Paperclip,
  PenLine,
  Plus,
  RefreshCw,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  X,
  Zap,
  type LucideIcon,
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

function useLandingStyles() {
  useInsertionEffect(() => {
    const styleId = "lexa-palomino-landing-styles";
    const previous = document.getElementById(
      styleId,
    ) as HTMLStyleElement | null;

    const style = previous ?? document.createElement("style");

    style.id = styleId;
    style.textContent = PALOMINO_LEXA_CSS;

    if (!previous) {
      document.head.appendChild(style);
    }

    return () => {
      if (!previous) {
        style.remove();
      }
    };
  }, []);
}

const NAV_ITEMS = [
  { label: "Features", target: "#features" },
  { label: "Demo", target: "#playground" },
  { label: "Intelligence", target: "#intelligence" },
  { label: "Pricing", target: "#pricing" },
  { label: "FAQ", target: "#faq" },
] as const;

const OVERVIEW = [
  {
    value: "ONE",
    label: "Unified workspace",
    sub: "Every mode, one thread",
  },
  {
    value: "LIVE",
    label: "Web intelligence",
    sub: "Search with citations",
  },
  {
    value: "AUTO",
    label: "Model routing",
    sub: "Best engine for the task",
  },
  {
    value: "YOURS",
    label: "Memory controls",
    sub: "Visible and editable",
  },
] as const;

const ROUTE_STEPS: ReadonlyArray<{
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
}> = [
    {
      icon: MessageSquare,
      tag: "INPUT",
      title: "You ask",
      description:
        "Type, talk, or attach a file. One input handles every kind of request.",
    },
    {
      icon: Route,
      tag: "ROUTER",
      title: "Lexa understands",
      description:
        "The router reads your intent, active context, and the tools the task needs.",
    },
    {
      icon: Cpu,
      tag: "MODEL",
      title: "The best engine runs",
      description:
        "Lexa selects the right model automatically, so you never have to compare them.",
    },
    {
      icon: Sparkles,
      tag: "OUTPUT",
      title: "You get the answer",
      description:
        "The result arrives cited, formatted, and ready for the next step in your flow.",
    },
  ];

const FEATURES = [
  {
    id: "smart-ai",
    icon: MessageSquare,
    tag: "COGNITIVE CORE",
    title: "Context-aware conversations",
    description:
      "Reason across long threads, preferences, files, and project decisions without repeatedly rebuilding context.",
    status: "Reasoning stream ready",
  },
  {
    id: "web-search",
    icon: Globe,
    tag: "LIVE INTELLIGENCE",
    title: "Real-time web research",
    description:
      "Search current sources, inspect citations, and move from discovery to a useful answer in the same conversation.",
    status: "Source trail visible",
  },
  {
    id: "voice-ai",
    icon: Mic,
    tag: "VOICE MODE",
    title: "Natural voice interaction",
    description:
      "Capture an idea, ask a follow-up, or work hands-free with voice built into the same workspace.",
    status: "Voice mode available",
  },
  {
    id: "memory-workspace",
    icon: Brain,
    tag: "PRIVATE MEMORY",
    title: "A workspace that remembers",
    description:
      "Keep preferences, reusable context, and project knowledge available with clear memory controls.",
    status: "Memory controls visible",
  },
  {
    id: "image-video",
    icon: ImageIcon,
    tag: "VISUAL STUDIO",
    title: "Image and visual creation",
    description:
      "Move from a written brief to a visual direction without breaking your flow or rebuilding the idea elsewhere.",
    status: "Visual workspace ready",
  },
  {
    id: "code-gen",
    icon: Code2,
    tag: "CODE WORKSPACE",
    title: "Build, review, and debug",
    description:
      "Generate and explain production-minded code with enough context to reason about the surrounding system.",
    status: "Project context linked",
  },

] as const;

type Feature = (typeof FEATURES)[number];

const USE_CASES: ReadonlyArray<{
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
}> = [
    {
      icon: Code2,
      tag: "BUILD",
      title: "Developers",
      description:
        "Generate, review, and debug across your stack with architecture-aware explanations.",
    },
    {
      icon: PenLine,
      tag: "WRITE",
      title: "Writers & creators",
      description:
        "Draft, restructure, and polish long-form work while keeping your voice intact.",
    },
    {
      icon: FlaskConical,
      tag: "RESEARCH",
      title: "Researchers",
      description:
        "Search live sources, parse dense material, and keep citations connected to claims.",
    },
    {
      icon: Users,
      tag: "DECIDE",
      title: "Business teams",
      description:
        "Turn scattered inputs into clear reports, briefs, and next steps in a shared flow.",
    },
    {
      icon: Palette,
      tag: "CREATE",
      title: "Designers",
      description:
        "Explore directions, articulate rationale, and move from brief to visual concept faster.",
    },
    {
      icon: GraduationCap,
      tag: "LEARN",
      title: "Students",
      description:
        "Break down difficult ideas, organize notes, and study through text, files, or voice.",
    },
  ];

const MODELS = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    context: "Multimodal",
    response: "Fast",
    route: "General work",
    description:
      "Balanced reasoning, multimodal work, and natural conversation.",
    capabilities: [
      "General reasoning",
      "Image understanding",
      "Natural dialogue",
      "Structured output",
    ],
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    context: "Long context",
    response: "Fast",
    route: "Large inputs",
    description:
      "Large document work, multimodal analysis, and code-heavy context.",
    capabilities: [
      "Long documents",
      "Video analysis",
      "Large codebases",
      "Cross-file context",
    ],
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet",
    provider: "Anthropic",
    context: "Reasoning",
    response: "Precise",
    route: "Deep analysis",
    description:
      "Nuanced writing, software architecture, and careful analytical work.",
    capabilities: [
      "Deep reasoning",
      "Long-form writing",
      "Code architecture",
      "Document analysis",
    ],
  },
  {
    id: "lexa-router",
    name: "Lexa Router",
    provider: "Automatic",
    context: "Adaptive",
    response: "Optimized",
    route: "Default mode",
    description:
      "Reads the request, selects the right engine, and keeps the experience unified.",
    capabilities: [
      "Automatic selection",
      "Tool orchestration",
      "Context continuity",
      "Fallback routing",
    ],
  },
] as const;

const TRUST_CONTROLS: ReadonlyArray<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
    {
      icon: ShieldCheck,
      title: "Transparent sources",
      description:
        "Citations stay attached to web-backed answers so important claims can be checked.",
    },
    {
      icon: Brain,
      title: "Visible memory",
      description:
        "See what the workspace remembers and keep memory scoped to useful context.",
    },
    {
      icon: Trash2,
      title: "Clear controls",
      description:
        "Make deleting conversations and clearing saved context easy to understand.",
    },
    {
      icon: Download,
      title: "Portable work",
      description:
        "Keep outputs easy to copy, export, and move into the tools where work continues.",
    },
    {
      icon: KeyRound,
      title: "Workspace access",
      description:
        "Give personal and team spaces explicit boundaries instead of hidden defaults.",
    },
    {
      icon: LockKeyhole,
      title: "Plain-language privacy",
      description:
        "Explain data handling clearly without invented badges or certification theater.",
    },
  ];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "A focused way to explore the Lexa workspace.",
    features: [
      "Core chat workspace",
      "Limited model access",
      "Web research preview",
      "Conversation history",
      "Community support",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$20",
    period: "/month",
    description: "More capacity and advanced tools for daily work.",
    features: [
      "Higher usage limits",
      "Flagship model access",
      "Files, voice, and visuals",
      "Personal memory controls",
      "Priority routing",
      "Custom instructions",
    ],
    cta: "Choose Pro",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$15",
    period: "/user/month",
    description: "Shared context and controls for collaborative work.",
    features: [
      "Everything in Pro",
      "Shared workspaces",
      "Admin controls",
      "Team billing",
      "Centralized context",
      "Priority support",
    ],
    cta: "Choose Team",
    highlighted: false,
  },
] as const;

const FAQS = [
  {
    question: "What is Lexa AI?",
    answer:
      "Lexa is one workspace for conversation, research, writing, code, files, voice, and visual work. It keeps the interface consistent while routing each request to the most suitable intelligence.",
  },
  {
    question: "Do I need to choose a model?",
    answer:
      "No. Automatic routing is the default. Lexa reads the task and selects an appropriate model and tool path. You can still inspect or change the model whenever you want direct control.",
  },
  {
    question: "How does live web research work?",
    answer:
      "When a request needs current information, Lexa can search the web, summarize relevant material, and keep source links attached to the answer for verification.",
  },
  {
    question: "Can I work with files and images?",
    answer:
      "The workspace is designed for documents, images, and other project inputs, so analysis and follow-up work can stay in one thread.",
  },
  {
    question: "What does memory save?",
    answer:
      "Memory is intended for useful preferences and reusable project context. The interface keeps remembered details visible so they can be reviewed and cleared.",
  },
  {
    question: "Can I try Lexa before paying?",
    answer:
      "Yes. Start with the free workspace and upgrade only when you need higher limits, more models, or team features.",
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

const DEMO_RESPONSE =
  "The strongest pattern is improved early retention after the onboarding change. Current benchmark sources suggest the result is moving in the right direction, while activation and expansion remain the highest-impact opportunities for the next quarter.";

function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) =>
        Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
      lerp: 0.09,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

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
    window.__lexaLenis.scrollTo(selector, {
      offset: -72,
      duration: 1.25,
    });
    return;
  }

  document
    .querySelector(selector)
    ?.scrollIntoView({ behavior: "smooth" });
}

function useFilmCursor() {
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) {
      return;
    }

    const cursor = document.createElement("div");
    cursor.className = "film-cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);

    const xTo = gsap.quickTo(cursor, "x", {
      duration: 0.3,
      ease: "power3.out",
    });

    const yTo = gsap.quickTo(cursor, "y", {
      duration: 0.3,
      ease: "power3.out",
    });

    const handleMove = (event: PointerEvent) => {
      xTo(event.clientX);
      yTo(event.clientY);
      cursor.classList.add("is-visible");
    };

    const handleOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;

      if (target?.closest("a, button, [data-cursor='active']")) {
        cursor.classList.add("is-active");
      }
    };

    const handleOut = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;

      if (target?.closest("a, button, [data-cursor='active']")) {
        cursor.classList.remove("is-active");
      }
    };

    window.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerover", handleOver);
    document.addEventListener("pointerout", handleOut);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerover", handleOver);
      document.removeEventListener("pointerout", handleOut);
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
    <h2
      className={`split-heading ${className}`}
      aria-label={children}
    >
      {words.map((word, wordIndex) => (
        <span
          className="split-word"
          aria-hidden="true"
          key={`${word}-${wordIndex}`}
        >
          {Array.from(word).map((character, characterIndex) => (
            <span
              className="split-char"
              key={`${character}-${characterIndex}`}
            >
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

function TypingLine({ text }: { text: string }) {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [visible, setVisible] = useState(reduced ? text : "");

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(text);
      return;
    }

    setVisible("");

    let index = 0;

    const timer = window.setInterval(() => {
      index += 1;
      setVisible(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(timer);
      }
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
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [lineOne, setLineOne] = useState(
    reduced ? "One intelligence." : "",
  );

  const [lineTwo, setLineTwo] = useState(
    reduced ? "Every mode." : "",
  );

  const [activeLine, setActiveLine] = useState<
    1 | 2 | "complete"
  >(reduced ? "complete" : 1);

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const firstText = "One intelligence.";
    const secondText = "Every mode.";

    let firstIndex = 0;
    let secondIndex = 0;
    let firstTimer = 0;
    let secondTimer = 0;
    let secondDelay = 0;

    const startDelay = window.setTimeout(() => {
      firstTimer = window.setInterval(() => {
        firstIndex += 1;
        setLineOne(firstText.slice(0, firstIndex));

        if (firstIndex >= firstText.length) {
          window.clearInterval(firstTimer);
          setActiveLine(2);

          secondDelay = window.setTimeout(() => {
            secondTimer = window.setInterval(() => {
              secondIndex += 1;
              setLineTwo(secondText.slice(0, secondIndex));

              if (secondIndex >= secondText.length) {
                window.clearInterval(secondTimer);
                setActiveLine("complete");
              }
            }, 50);
          }, 250);
        }
      }, 42);
    }, 1450);

    return () => {
      window.clearTimeout(startDelay);
      window.clearTimeout(secondDelay);
      window.clearInterval(firstTimer);
      window.clearInterval(secondTimer);
    };
  }, []);

  return (
    <h1 aria-label="One intelligence. Every mode.">
      <span className="hero-line" aria-hidden="true">
        <span>
          {lineOne}
          {activeLine === 1 && (
            <span className="hero-typing-caret" />
          )}
        </span>
      </span>

      <span
        className="hero-line hero-line-indent"
        aria-hidden="true"
      >
        <span>
          {lineTwo}
          {activeLine === 2 && (
            <span className="hero-typing-caret" />
          )}
        </span>
      </span>
    </h1>
  );
}

function IntegrationMarquee() {
  const integrations = [...INTEGRATIONS, ...INTEGRATIONS];

  return (
    <section
      className="integration-strip"
      aria-label="Connected systems"
    >
      <div className="integration-label">CONNECTED SYSTEMS</div>

      <div className="marquee-window">
        <div className="marquee-track">
          {integrations.map((integration, index) => (
            <span key={`${integration}-${index}`}>
              {integration}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturePreview({ feature }: { feature: Feature }) {
  return (
    <div className="feature-preview" key={feature.id}>
      <div className="preview-head">
        <span>{feature.tag}</span>
        <span>
          0
          {FEATURES.findIndex(
            (currentFeature) => currentFeature.id === feature.id,
          ) + 1}{" "}
          / 06
        </span>
      </div>

      <div className="preview-body">
        {feature.id === "smart-ai" && (
          <div className="preview-chat">
            <span className="preview-kicker">
              ACTIVE CONTEXT STREAM
            </span>

            <p>
              <TypingLine text="Turn this research into a concise launch narrative." />
            </p>

            <span className="preview-status">
              <Sparkles />
              Project context active
            </span>
          </div>
        )}

        {feature.id === "web-search" && (
          <div className="preview-search">
            <div className="search-state">
              <Search />
              <span>SEARCHING CURRENT SOURCES</span>
            </div>

            <p>
              Find current benchmarks and cite the strongest
              evidence.
            </p>

            {[
              "Primary source",
              "Industry report",
              "Research paper",
            ].map((source, index) => (
              <div className="source-row" key={source}>
                <span>0{index + 1}</span>
                <strong>{source}</strong>
                <Check />
              </div>
            ))}
          </div>
        )}

        {feature.id === "voice-ai" && (
          <div className="preview-audio">
            <div
              className="waveform"
              aria-label="Voice waveform"
            >
              {[35, 60, 95, 45, 80, 100, 50, 75, 40, 90, 60, 30].map(
                (height, index) => (
                  <span
                    key={index}
                    style={{
                      height: `${height}%`,
                      animationDelay: `${index * -0.06}s`,
                    }}
                  />
                ),
              )}
            </div>

            <p>Listening for your next thought</p>
          </div>
        )}

        {feature.id === "memory-workspace" && (
          <div className="preview-memory">
            {[
              "Writing style",
              "Project goals",
              "Preferred stack",
              "Saved context",
            ].map((memory, index) => (
              <div className="memory-node" key={memory}>
                <span>0{index + 1}</span>
                <strong>{memory}</strong>
              </div>
            ))}
          </div>
        )}

        {feature.id === "image-video" && (
          <div className="preview-render">
            <div className="render-frame">
              <ImageIcon />
              <span>GENERATIVE FRAME</span>
            </div>

            <div className="render-meta">
              <span>HIGH FIDELITY</span>
              <span>ADAPTIVE FORMAT</span>
            </div>
          </div>
        )}

        {feature.id === "code-gen" && (
          <div className="preview-code">
            <span>01 / router.ts</span>

            <code>
              <b>const</b> answer = <b>await</b> lexa.route(
              {"{"}
              <br />
              &nbsp;&nbsp;context,
              <br />
              &nbsp;&nbsp;tools,
              <br />
              {"}"});
            </code>
          </div>
        )}
      </div>

      <div className="preview-foot">
        <Activity />
        <span>{feature.status}</span>
        <i />
      </div>
    </div>
  );
}

function IntelligenceRouter() {
  return (
    <section
      className="router-section section-shell"
      id="how-it-works"
    >
      <div className="section-meta">
        <span>HOW IT WORKS</span>
        <span>02 — 08</span>
      </div>

      <div className="section-heading-row">
        <SplitHeading>
          From prompt to the right intelligence.
        </SplitHeading>

        <p data-reveal>
          You never need to compare models. Lexa reads the
          request, chooses the right engine and tools, and keeps
          the experience continuous.
        </p>
      </div>

      <div className="router-flow">
        {ROUTE_STEPS.map((step, index) => {
          const Icon = step.icon;

          return (
            <div
              className="router-piece"
              key={step.title}
              data-reveal
            >
              <article className="router-card">
                <div className="router-card-top">
                  <span className="router-icon">
                    <Icon strokeWidth={1.4} />
                  </span>

                  <span className="router-index">
                    0{index + 1} / 04
                  </span>
                </div>

                <div className="router-copy">
                  <small>{step.tag}</small>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>

              {index < ROUTE_STEPS.length - 1 && (
                <span
                  className="router-arrow"
                  aria-hidden="true"
                >
                  <ArrowRight />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function UseCases() {
  return (
    <section
      className="use-cases-section section-shell"
      id="use-cases"
    >
      <div className="section-meta">
        <span>USE CASES</span>
        <span>04 — 08</span>
      </div>

      <div className="section-heading-row">
        <SplitHeading>Built for the way you work.</SplitHeading>

        <p data-reveal>
          One interface that adapts to the craft — whether you
          ship code, publish words, study deeply, or make
          decisions with a team.
        </p>
      </div>

      <div className="use-cases-grid">
        {USE_CASES.map((useCase, index) => {
          const Icon = useCase.icon;

          return (
            <article
              className="use-case-card"
              key={useCase.title}
              data-reveal
            >
              <div className="use-case-top">
                <span className="use-case-icon">
                  <Icon strokeWidth={1.4} />
                </span>

                <span className="use-case-tag">
                  {useCase.tag}
                </span>
              </div>

              <div className="use-case-copy">
                <span className="use-case-index">
                  0{index + 1}
                </span>

                <h3>{useCase.title}</h3>
                <p>{useCase.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProductPlayground() {
  const [prompt, setPrompt] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState(
    "Compare our Q3 retention against current benchmarks and draft a concise summary.",
  );
  const [visibleResponse, setVisibleResponse] =
    useState(DEMO_RESPONSE);
  const [runId, setRunId] = useState(0);
  const [copied, setCopied] = useState(false);

  const runDemo = (nextPrompt?: string) => {
    const cleanedPrompt = (nextPrompt ?? prompt).trim();

    if (cleanedPrompt) {
      setSubmittedPrompt(cleanedPrompt);
    }

    setPrompt("");
    setVisibleResponse("");
    setCopied(false);
    setRunId((current) => current + 1);
  };

  useEffect(() => {
    if (runId === 0) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisibleResponse(DEMO_RESPONSE);
      return;
    }

    let index = 0;

    const timer = window.setInterval(() => {
      index += 2;
      setVisibleResponse(DEMO_RESPONSE.slice(0, index));

      if (index >= DEMO_RESPONSE.length) {
        window.clearInterval(timer);
      }
    }, 14);

    return () => window.clearInterval(timer);
  }, [runId]);

  const handleKeyDown = (
    event: ReactKeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (prompt.trim()) {
        runDemo();
      }
    }
  };

  const copyResponse = () => {
    void navigator.clipboard?.writeText(DEMO_RESPONSE);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1300);
  };

  return (
    <section
      className="playground-section section-shell"
      id="playground"
    >
      <div className="section-meta">
        <span>LIVE WORKSPACE</span>
        <span>05 — 08</span>
      </div>

      <div className="section-heading-row">
        <SplitHeading>Watch the workspace think.</SplitHeading>

        <p data-reveal>
          Search, routing, citations, memory, and creation live in
          one focused thread. Try the interaction below.
        </p>
      </div>

      <div className="playground-window" data-reveal>
        <aside
          className="playground-sidebar"
          aria-label="Workspace navigation"
        >
          <button
            className="new-chat-button"
            type="button"
            onClick={() => {
              setPrompt("");
              setSubmittedPrompt("What can Lexa help me do?");
            }}
          >
            <Plus />
            New chat
          </button>

          <div className="sidebar-group">
            <span>RECENT</span>

            <button className="is-active" type="button">
              <i />
              Q3 retention analysis
            </button>

            <button type="button">
              <i />
              Launch narrative
            </button>

            <button type="button">
              <i />
              Auth flow debugging
            </button>
          </div>

          <div className="sidebar-group">
            <span>WORKSPACE</span>

            <button type="button">
              <FileText />
              Files
            </button>

            <button type="button">
              <Brain />
              Memory
            </button>
          </div>

          <div className="sidebar-memory">
            <span>MEMORY</span>

            <p>
              <i />
              Prefers concise answers
            </p>

            <p>
              <i />
              Brand voice: Lexa
            </p>

            <p>
              <i />
              Stack: React + TypeScript
            </p>
          </div>
        </aside>

        <div className="playground-main">
          <div className="playground-topbar">
            <div className="window-information">
              <span className="window-dots">
                <i />
                <i />
                <i />
              </span>

              <span>LEXA / WORKSPACES</span>
            </div>

            <div className="window-models">
              <span className="model-chip">
                <Sparkles />
                Lexa Router
                <ChevronDown />
              </span>

              <span className="online-chip">
                <i />
                ONLINE
              </span>
            </div>
          </div>

          <div className="demo-thread">
            <div className="demo-user-message">
              {submittedPrompt}
            </div>

            <div className="demo-assistant-message">
              <div className="demo-tool-row">
                <span>
                  <Globe />
                  Searched the web
                </span>

                <span>
                  <Check />
                  Sources attached
                </span>

                <span className="source-chip">
                  <i />
                  Benchmark report
                </span>

                <span className="source-chip">
                  <i />
                  Retention research
                </span>
              </div>

              <p aria-live="polite">
                {visibleResponse}
                {visibleResponse.length < DEMO_RESPONSE.length && (
                  <span className="demo-stream-caret" />
                )}
                <sup>[1]</sup>
                <sup>[2]</sup>
              </p>

              <div className="demo-response-actions">
                <button
                  type="button"
                  onClick={copyResponse}
                >
                  <Copy />
                  {copied ? "Copied" : "Copy"}
                </button>

                <button
                  type="button"
                  onClick={() => runDemo(submittedPrompt)}
                >
                  <RefreshCw />
                  Regenerate
                </button>

                <span>LEXA ROUTER · PREVIEW</span>
              </div>
            </div>
          </div>

          <div className="demo-input">
            <textarea
              value={prompt}
              rows={2}
              placeholder="Message Lexa..."
              aria-label="Message Lexa"
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={handleKeyDown}
            />

            <div className="demo-input-footer">
              <div className="demo-input-tools">
                <button
                  type="button"
                  aria-label="Add"
                >
                  <Plus />
                </button>

                <button
                  type="button"
                  aria-label="Attach file"
                >
                  <Paperclip />
                </button>

                <button
                  className="is-active"
                  type="button"
                  aria-label="Web search"
                >
                  <Globe />
                </button>

                <button
                  type="button"
                  aria-label="Voice"
                >
                  <Mic />
                </button>

                <button
                  type="button"
                  aria-label="Tools"
                >
                  <Sparkles />
                </button>
              </div>

              <button
                className="demo-send-button"
                type="button"
                aria-label="Send message"
                disabled={!prompt.trim()}
                onClick={() => runDemo()}
              >
                <ArrowUp />
              </button>
            </div>

            <div className="demo-keyboard-hint">
              <CornerDownLeft />
              Enter to send · Shift + Enter for a new line
            </div>
          </div>
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
      className={`pricing-card ${plan.highlighted ? "is-featured" : ""
        }`}
    >
      <div className="pricing-label">
        {plan.highlighted ? "RECOMMENDED" : "ACCESS"}
      </div>

      <h3>{plan.name}</h3>
      <p className="pricing-description">
        {plan.description}
      </p>

      <div className="pricing-price">
        <strong>{plan.price}</strong>
        <span>{plan.period}</span>
      </div>

      <ul>
        {plan.features.map((feature) => (
          <li key={feature}>
            <Check />
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
        <ArrowRight />
      </button>
    </article>
  );
}

export default function Landing() {
  useLandingStyles();

  useSEO({
    title: "Lexa AI — One intelligence. Every mode.",
    description:
      "One AI workspace for research, writing, code, files, voice, visual creation, and automatic model routing.",
    canonicalUrl: "/",
  });

  const navigate = useNavigate();
  const rootRef = useRef<HTMLElement>(null);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFeatureIndex, setActiveFeatureIndex] =
    useState(0);
  const [activeModelIndex, setActiveModelIndex] =
    useState(3);
  const [expandedFaq, setExpandedFaq] = useState<
    number | null
  >(0);

  useSmoothScroll();
  useFilmCursor();

  useEffect(() => {
    let mounted = true;

    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (mounted) {
          setIsAuthenticated(Boolean(session?.user));
        }
      });

    const { data } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setIsAuthenticated(Boolean(session?.user));
        }
      },
    );

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "menu-is-open",
      menuOpen,
    );

    return () => {
      document.documentElement.classList.remove(
        "menu-is-open",
      );
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const closeMenu = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeMenu);

    return () => {
      window.removeEventListener("keydown", closeMenu);
    };
  }, [menuOpen]);

  const handleGetStarted = () => {
    navigate(isAuthenticated ? "/chat" : "/auth");
  };

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
        gsap.set(".screen-loader", {
          display: "none",
        });

        return;
      }

      const introduction = gsap.timeline({
        defaults: {
          ease: "power4.out",
        },
      });

      introduction
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
        .from(
          ".site-header",
          {
            yPercent: -110,
            duration: 0.75,
          },
          "-=0.1",
        )
        .from(
          ".hero-eyebrow, .hero-summary, .hero-actions",
          {
            opacity: 0,
            y: 28,
            stagger: 0.1,
            duration: 0.75,
          },
          "-=0.45",
        )
        .from(
          ".hero-stage",
          {
            opacity: 0,
            y: 70,
            scale: 0.98,
            duration: 1,
          },
          "-=0.55",
        );

      gsap.to(".scroll-progress-bar", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.2,
        },
      });

      gsap.to(".hero-stage", {
        yPercent: 12,
        scale: 0.98,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      gsap.utils
        .toArray<HTMLElement>(".split-heading")
        .forEach((heading) => {
          gsap.from(
            heading.querySelectorAll(".split-char"),
            {
              yPercent: 115,
              opacity: 0,
              rotateX: -55,
              filter: "blur(7px)",
              duration: 0.85,
              stagger: 0.012,
              ease: "power4.out",
              scrollTrigger: {
                trigger: heading,
                start: "top 86%",
                once: true,
              },
            },
          );
        });

      gsap.utils
        .toArray<HTMLElement>("[data-reveal]")
        .forEach((element) => {
          gsap.from(element, {
            y: 45,
            opacity: 0,
            duration: 0.9,
            ease: "power4.out",
            scrollTrigger: {
              trigger: element,
              start: "top 90%",
              once: true,
            },
          });
        });

      gsap.utils
        .toArray<HTMLElement>(".feature-row")
        .forEach((row, index) => {
          gsap.from(row, {
            y: 55,
            opacity: 0,
            duration: 0.85,
            ease: "power4.out",
            scrollTrigger: {
              trigger: row,
              start: "top 92%",
              once: true,
            },
          });

          ScrollTrigger.create({
            trigger: row,
            start: "top center",
            end: "bottom center",
            onEnter: () => setActiveFeatureIndex(index),
            onEnterBack: () =>
              setActiveFeatureIndex(index),
          });
        });

      gsap.from(".overview-item", {
        y: 36,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".overview-section",
          start: "top 86%",
          once: true,
        },
      });

      gsap.from(".pricing-card", {
        y: 48,
        opacity: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".pricing-grid",
          start: "top 84%",
          once: true,
        },
      });

      return () => {
        introduction.kill();
      };
    },
    {
      scope: rootRef,
    },
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
        <div
          className="scroll-progress-bar"
          aria-hidden="true"
        />

        <Link
          className="brand"
          to="/"
          aria-label="Lexa home"
        >
          <LogoIcon className="brand-icon" />
          <span>LEXA</span>
        </Link>

        <nav
          className="desktop-nav"
          aria-label="Primary navigation"
        >
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.target}
              onClick={() => goTo(item.target)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <span className="header-edition">
            AI / WORKSPACE
          </span>

          {isAuthenticated ? (
            <Link className="header-cta" to="/chat">
              Workspace
              <ArrowRight />
            </Link>
          ) : (
            <Link className="header-cta" to="/auth">
              Start free
              <ArrowRight />
            </Link>
          )}

          <button
            className="menu-toggle"
            type="button"
            aria-label={
              menuOpen ? "Close menu" : "Open menu"
            }
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen((current) => !current)
            }
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <div
        className={`mobile-menu ${menuOpen ? "is-open" : ""
          }`}
        aria-hidden={!menuOpen}
      >
        <div className="mobile-menu-links">
          {NAV_ITEMS.map((item, index) => (
            <button
              key={item.target}
              type="button"
              onClick={() => goTo(item.target)}
            >
              <span>0{index + 1}</span>
              {item.label}
              <ArrowRight />
            </button>
          ))}
        </div>

        <div className="mobile-menu-footer">
          <span>One intelligence.</span>
          <span>Every mode.</span>
        </div>
      </div>

      <section className="hero-section section-shell">
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <span>AI WORKSPACE</span>
            <span>BUILT FOR FOCUSED WORK</span>
          </div>

          <HeroTypingHeading />

          <div className="hero-lower">
            <p className="hero-summary">
              Research, write, code, speak, and create in one
              continuous workspace powered by automatic model
              routing.
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
                onClick={() => goTo("#playground")}
              >
                See the workspace
                <ArrowDown />
              </button>
            </div>
          </div>
        </div>

        <div className="hero-stage" data-cursor="active">
          <div className="hero-stage-top">
            <span>LEXA / LIVE INTERFACE</span>

            <span>
              <i />
              SYSTEM READY
            </span>
          </div>

          <div className="hero-stage-core">
            <span className="stage-index">01</span>

            <div>
              <span className="stage-label">
                ACTIVE PROMPT
              </span>

              <p>
                <TypingLine text="Build the next idea without leaving the flow." />
              </p>
            </div>

            <div className="stage-router">
              <span>QUESTION</span>
              <ArrowRight />
              <span>ROUTER</span>
              <ArrowRight />
              <span>BEST MODEL</span>
            </div>

            <div
              className="stage-orbit"
              aria-hidden="true"
            >
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="hero-stage-bottom">
            <span>
              GPT-4o · Claude · Gemini · Lexa Router
            </span>
            <span>AUTOMATIC SELECTION</span>
          </div>
        </div>

        <button
          className="scroll-cue"
          type="button"
          onClick={() => goTo("#overview")}
        >
          <span>Scroll to discover</span>
          <ArrowDown />
        </button>
      </section>

      <section
        className="overview-section section-shell"
        id="overview"
      >
        <div className="section-meta">
          <span>AT A GLANCE</span>
          <span>01 — 08</span>
        </div>

        <div className="overview-grid">
          {OVERVIEW.map((item, index) => (
            <article
              className="overview-item"
              key={item.label}
            >
              <span>0{index + 1}</span>
              <strong>{item.value}</strong>

              <div>
                <b>{item.label}</b>
                <small>{item.sub}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <IntegrationMarquee />

      <IntelligenceRouter />

      <section
        className="features-section section-shell"
        id="features"
      >
        <div className="section-meta">
          <span>CAPABILITIES</span>
          <span>03 — 08</span>
        </div>

        <div className="section-heading-row">
          <SplitHeading>
            Built to move at the speed of thought.
          </SplitHeading>

          <p data-reveal>
            Six connected systems. One continuous context. Every
            interaction stays fast, focused, and easy to
            understand.
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
                  className={`feature-row ${active ? "is-active" : ""
                    }`}
                  type="button"
                  key={feature.id}
                  onClick={() =>
                    setActiveFeatureIndex(index)
                  }
                >
                  <span className="feature-number">
                    0{index + 1}
                  </span>

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

      <UseCases />

      <ProductPlayground />

      <section
        className="models-section"
        id="intelligence"
      >
        <div className="section-shell">
          <div className="section-meta section-meta-dark">
            <span>INTELLIGENCE MESH</span>
            <span>06 — 08</span>
          </div>

          <div className="section-heading-row models-heading">
            <SplitHeading>
              The right model, selected automatically.
            </SplitHeading>

            <p data-reveal>
              Lexa routes every request by intent, context, and
              required tools. Explore the available intelligence
              without carrying the selection burden.
            </p>
          </div>

          <div className="models-layout">
            <div
              className="model-tabs"
              role="tablist"
              aria-label="AI models"
            >
              {MODELS.map((model, index) => (
                <button
                  key={model.id}
                  role="tab"
                  type="button"
                  aria-selected={
                    activeModelIndex === index
                  }
                  className={
                    activeModelIndex === index
                      ? "is-active"
                      : ""
                  }
                  onClick={() =>
                    setActiveModelIndex(index)
                  }
                >
                  <span>0{index + 1}</span>
                  <strong>{model.name}</strong>
                  <small>{model.provider}</small>
                  <ChevronRight />
                </button>
              ))}
            </div>

            <article
              className="model-detail"
              key={activeModel.id}
            >
              <div className="model-detail-head">
                <span>{activeModel.provider}</span>
                <span>{activeModel.route}</span>
              </div>

              <h3>{activeModel.name}</h3>
              <p>{activeModel.description}</p>

              <div className="model-specs">
                <div>
                  <span>CONTEXT</span>
                  <strong>{activeModel.context}</strong>
                </div>

                <div>
                  <span>RESPONSE</span>
                  <strong>{activeModel.response}</strong>
                </div>

                <div>
                  <span>ROUTING</span>
                  <strong>{activeModel.route}</strong>
                </div>
              </div>

              <div className="capability-list">
                {activeModel.capabilities.map(
                  (capability, index) => (
                    <div key={capability}>
                      <span>0{index + 1}</span>
                      <strong>{capability}</strong>
                      <Check />
                    </div>
                  ),
                )}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section
        className="trust-section section-shell"
        id="security"
      >
        <div className="section-meta">
          <span>TRUST & CONTROL</span>
          <span>07 — 08</span>
        </div>

        <div className="section-heading-row">
          <SplitHeading>
            Control should never be hidden.
          </SplitHeading>

          <p data-reveal>
            Lexa presents concrete privacy and workspace controls
            instead of relying on vague language or decorative
            security claims.
          </p>
        </div>

        <div className="trust-grid">
          {TRUST_CONTROLS.map((control, index) => {
            const Icon = control.icon;

            return (
              <article
                className="trust-card"
                key={control.title}
                data-reveal
              >
                <div className="trust-card-top">
                  <span className="trust-icon">
                    <Icon strokeWidth={1.4} />
                  </span>

                  <span>0{index + 1}</span>
                </div>

                <div>
                  <h3>{control.title}</h3>
                  <p>{control.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="pricing-section section-shell"
        id="pricing"
      >
        <div className="section-meta">
          <span>ACCESS</span>
          <span>08 — 08</span>
        </div>

        <div className="section-heading-row">
          <SplitHeading>
            Start free. Scale when it matters.
          </SplitHeading>

          <p data-reveal>
            Clear access tiers with no visual noise and no hidden
            complexity.
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

      <section
        className="faq-section section-shell"
        id="faq"
      >
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
                  className={`faq-item ${open ? "is-open" : ""
                    }`}
                  key={faq.question}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() =>
                      setExpandedFaq(
                        open ? null : index,
                      )
                    }
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

      <section className="final-cta section-shell">
        <span className="final-kicker">
          <Zap />
          YOUR NEXT WORKSPACE
        </span>

        <SplitHeading>
          Ready to work differently?
        </SplitHeading>

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
            <button
              type="button"
              onClick={() => goTo("#features")}
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => goTo("#playground")}
            >
              Demo
            </button>
            <Link to="/pricing">Pricing</Link>
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
            <i />
            WORKSPACE READY
          </div>
        </div>

        <div
          className="footer-word"
          aria-label="Lexa"
        >
          LEXA
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Lexa AI
          </span>

          <span>ONE INTELLIGENCE · EVERY MODE</span>

          <button
            type="button"
            onClick={() => scrollToSection("body")}
          >
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
  --lexa-ink: #080808;
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
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background: var(--lexa-black);
  color: var(--lexa-white);
  font-family: "Host Grotesk", "Arial", sans-serif;
  font-size: 16px;
  line-height: 1.2;
}

.palomino-lexa ::selection {
  background: #fff;
  color: #000;
}

.palomino-lexa a {
  color: inherit;
  text-decoration: none;
}

.palomino-lexa button,
.palomino-lexa textarea {
  color: inherit;
  font: inherit;
}

.palomino-lexa button {
  padding: 0;
  border: 0;
  background: transparent;
}

.palomino-lexa button,
.palomino-lexa a {
  -webkit-tap-highlight-color: transparent;
}

.palomino-lexa button:focus-visible,
.palomino-lexa a:focus-visible,
.palomino-lexa textarea:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
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
  opacity: 0.1;
  mix-blend-mode: soft-light;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.7'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 160px;
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
  z-index: 1;
}

.screen-loader-mark {
  position: relative;
  z-index: 2;
  font-size: clamp(36px, 6vw, 88px);
  font-weight: 620;
  letter-spacing: 0.34em;
  text-indent: 0.34em;
}

.section-shell {
  width: 100%;
  padding-right: var(--lexa-gutter);
  padding-left: var(--lexa-gutter);
}

.section-meta {
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--lexa-line);
  color: var(--lexa-muted);
  font-size: 10px;
  font-weight: 550;
  letter-spacing: 0.15em;
}

.section-meta-dark {
  border-color: rgba(0, 0, 0, 0.24);
  color: rgba(0, 0, 0, 0.55);
}

.section-heading-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 440px);
  gap: clamp(54px, 8vw, 130px);
  align-items: end;
  padding: clamp(60px, 8vw, 120px) 0 clamp(70px, 9vw, 135px);
}

.split-heading {
  margin: 0;
  max-width: 1080px;
  font-size: clamp(48px, 7.2vw, 110px);
  font-weight: 560;
  letter-spacing: -0.058em;
  line-height: 0.93;
  perspective: 800px;
}

.split-word {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
  white-space: nowrap;
}

.split-char,
.split-space {
  display: inline-block;
  transform-origin: center bottom;
  will-change: transform, opacity;
}

.section-heading-row > p {
  max-width: 440px;
  margin: 0;
  color: var(--lexa-muted);
  font-size: clamp(17px, 1.4vw, 22px);
  font-weight: 370;
  line-height: 1.42;
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.scroll-progress-bar {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 1px;
  transform: scaleX(0);
  transform-origin: left center;
  background: #fff;
}

.brand {
  justify-self: start;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
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
  gap: clamp(20px, 2.5vw, 40px);
}

.desktop-nav button,
.header-edition {
  min-height: 44px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 11px;
  font-weight: 520;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.desktop-nav button {
  position: relative;
  transition: color 0.25s ease;
}

.desktop-nav button::after {
  content: "";
  position: absolute;
  right: 100%;
  bottom: 7px;
  left: 0;
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
  gap: 12px;
  padding: 0 23px;
  border: 1px solid #fff;
  border-radius: 999px;
  background: #fff;
  color: #000 !important;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition:
    background 0.3s ease,
    color 0.3s ease;
}

.header-cta svg {
  width: 15px;
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 112px var(--lexa-gutter) 32px;
  background: #000;
  transform: translateY(-18px);
  transition:
    visibility 0.5s,
    opacity 0.35s ease,
    transform 0.5s var(--lexa-ease-out);
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
  min-height: 82px;
  display: grid;
  grid-template-columns: 48px 1fr 30px;
  align-items: center;
  border-bottom: 1px solid var(--lexa-line-soft);
  color: #fff;
  text-align: left;
  font-size: clamp(28px, 7vw, 46px);
}

.mobile-menu-links button > span {
  color: var(--lexa-muted);
  font-size: 10px;
  letter-spacing: 0.12em;
}

.mobile-menu-links svg {
  width: 22px;
}

.mobile-menu-footer {
  display: flex;
  justify-content: space-between;
  color: var(--lexa-muted);
  font-size: 11px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
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
      rgba(255, 255, 255, 0.08),
      transparent 25vw
    ),
    #000;
}

.hero-eyebrow {
  display: flex;
  justify-content: space-between;
  margin-bottom: clamp(34px, 5vw, 72px);
  color: var(--lexa-muted);
  font-size: 10px;
  letter-spacing: 0.15em;
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
  min-height: 1em;
  display: block;
  overflow: hidden;
  padding: 0.08em 0 0.12em;
}

.hero-line > span {
  display: block;
}

.hero-line-indent {
  padding-left: 14vw;
}

.hero-typing-caret,
.typing-caret {
  display: inline-block;
  width: 0.06em;
  height: 0.82em;
  margin-left: 0.08em;
  background: #fff;
  vertical-align: -0.04em;
  animation: caret-blink 0.75s steps(1) infinite;
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}

.hero-lower {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 500px);
  gap: 60px;
  align-items: end;
  margin-top: clamp(42px, 6vw, 86px);
}

.hero-summary {
  grid-column: 2;
  max-width: 500px;
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: clamp(18px, 1.7vw, 25px);
  font-weight: 360;
  line-height: 1.35;
}

.hero-actions {
  grid-column: 2;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 22px;
}

.editorial-button {
  min-height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 0 31px;
  border: 1px solid currentColor !important;
  border-radius: 999px;
  font-size: 11px !important;
  font-weight: 650 !important;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition:
    background 0.35s ease,
    color 0.35s ease,
    transform 0.2s ease;
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
  font-size: 11px !important;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color 0.25s ease;
}

.text-link:hover {
  color: #fff !important;
}

.text-link svg {
  width: 16px;
  transition: transform 0.35s var(--lexa-ease-out);
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
    linear-gradient(
      rgba(255, 255, 255, 0.05) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 1px,
      transparent 1px
    ),
    radial-gradient(
      circle at 50% 47%,
      rgba(255, 255, 255, 0.12),
      rgba(255, 255, 255, 0.02) 28%,
      transparent 56%
    ),
    #050505;
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
  opacity: 0.7;
  background: linear-gradient(
    180deg,
    #000 0,
    transparent 18%,
    transparent 78%,
    #000 100%
  );
}

.hero-stage-top,
.hero-stage-bottom {
  position: absolute;
  z-index: 3;
  right: 22px;
  left: 22px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 9px;
  font-weight: 550;
  letter-spacing: 0.14em;
}

.hero-stage-top {
  top: 19px;
}

.hero-stage-bottom {
  bottom: 19px;
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

.hero-stage-core {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 50%;
  width: min(820px, 74%);
  display: grid;
  grid-template-columns: 58px 1fr;
  gap: 28px;
  padding: clamp(28px, 4vw, 58px);
  border: 1px solid rgba(255, 255, 255, 0.42);
  background: rgba(0, 0, 0, 0.68);
  transform: translate(-50%, -50%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  animation: stage-float 6s ease-in-out infinite;
}

@keyframes stage-float {
  0%,
  100% {
    transform: translate(-50%, -50%);
  }

  50% {
    transform: translate(-50%, calc(-50% - 10px));
  }
}

.stage-index,
.stage-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 9px;
  font-weight: 550;
  letter-spacing: 0.16em;
}

.hero-stage-core p {
  min-height: 1.95em;
  max-width: 620px;
  margin: 24px 0 0;
  font-size: clamp(32px, 4.8vw, 72px);
  font-weight: 500;
  letter-spacing: -0.045em;
  line-height: 0.99;
}

.stage-router {
  grid-column: 2;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 26px;
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.13em;
}

.stage-router span {
  padding: 9px 12px;
  border: 1px solid var(--lexa-line-soft);
  border-radius: 999px;
}

.stage-router svg {
  width: 14px;
}

.stage-orbit {
  position: absolute;
  right: -15%;
  bottom: -55%;
  width: 420px;
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 50%;
  animation: orbit-spin 20s linear infinite;
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
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 26px;
  color: var(--lexa-muted) !important;
  font-size: 10px !important;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.scroll-cue svg {
  width: 15px;
}

.overview-section {
  position: relative;
  z-index: 2;
  padding-bottom: var(--lexa-section-y);
  background: #000;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--lexa-line-soft);
}

.overview-item {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 23px 24px 28px;
  border-right: 1px solid var(--lexa-line-soft);
}

.overview-item:last-child {
  border-right: 0;
}

.overview-item > span {
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.13em;
}

.overview-item > strong {
  font-size: clamp(44px, 5.2vw, 82px);
  font-weight: 520;
  letter-spacing: -0.055em;
}

.overview-item > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.overview-item b {
  font-size: 14px;
  font-weight: 500;
}

.overview-item small {
  color: var(--lexa-muted);
  font-size: 12px;
}

.integration-strip {
  position: relative;
  z-index: 2;
  overflow: hidden;
  padding-bottom: clamp(80px, 9vw, 140px);
  background: #000;
}

.integration-label {
  margin: 0 var(--lexa-gutter) 24px;
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.14em;
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
  animation: lexa-marquee 34s linear infinite;
}

.marquee-track span {
  display: inline-flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.58);
  font-size: clamp(26px, 3vw, 48px);
  font-weight: 500;
  letter-spacing: -0.03em;
  white-space: nowrap;
}

.marquee-track span::after {
  content: "✦";
  margin: 0 44px;
  color: rgba(255, 255, 255, 0.25);
  font-size: 0.46em;
}

.marquee-window:hover .marquee-track {
  animation-play-state: paused;
}

@keyframes lexa-marquee {
  to {
    transform: translateX(-50%);
  }
}

.router-section {
  position: relative;
  z-index: 2;
  padding-bottom: var(--lexa-section-y);
  background: #000;
}

.router-flow {
  display: flex;
  align-items: stretch;
  gap: 14px;
}

.router-piece {
  min-width: 0;
  display: flex;
  flex: 1 1 0;
  align-items: stretch;
  gap: 14px;
}

.router-card {
  min-width: 0;
  min-height: 300px;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  padding: 26px 23px;
  border: 1px solid var(--lexa-line);
  border-radius: 20px;
  transition:
    background 0.4s var(--lexa-ease-out),
    color 0.4s var(--lexa-ease-out),
    transform 0.4s var(--lexa-ease-out);
}

.router-card:hover {
  background: #fff;
  color: #000;
  transform: translateY(-6px);
}

.router-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.router-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border: 1px solid var(--lexa-line);
  border-radius: 14px;
}

.router-icon svg {
  width: 23px;
  height: 23px;
}

.router-index {
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.14em;
}

.router-copy small {
  display: block;
  margin-bottom: 12px;
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.15em;
}

.router-copy h3 {
  margin: 0 0 12px;
  font-size: clamp(21px, 1.8vw, 29px);
  font-weight: 520;
  letter-spacing: -0.035em;
}

.router-copy p {
  margin: 0;
  color: var(--lexa-muted);
  font-size: 13px;
  line-height: 1.5;
}

.router-card:hover .router-copy p,
.router-card:hover .router-copy small,
.router-card:hover .router-index {
  color: rgba(0, 0, 0, 0.6);
}

.router-card:hover .router-icon {
  border-color: rgba(0, 0, 0, 0.25);
}

.router-arrow {
  width: 28px;
  display: grid;
  flex: 0 0 28px;
  place-items: center;
  color: var(--lexa-muted);
}

.router-arrow svg {
  width: 20px;
}

.features-section,
.use-cases-section,
.playground-section,
.trust-section,
.pricing-section,
.faq-section {
  position: relative;
  z-index: 2;
  padding-bottom: var(--lexa-section-y);
  background: #000;
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
  overflow: hidden;
  border: 1px solid var(--lexa-line);
  background:
    linear-gradient(
      rgba(255, 255, 255, 0.04) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.04) 1px,
      transparent 1px
    ),
    #050505;
  background-size: 42px 42px;
  animation: preview-enter 0.6s var(--lexa-ease-out) both;
}

@keyframes preview-enter {
  from {
    opacity: 0;
    filter: blur(7px);
    transform: translateY(24px);
  }

  to {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0);
  }
}

.preview-head,
.preview-foot {
  min-height: 60px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
  color: var(--lexa-muted);
  font-size: 9px;
  font-weight: 550;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.preview-head {
  justify-content: space-between;
  border-bottom: 1px solid var(--lexa-line-soft);
}

.preview-foot {
  margin-top: auto;
  border-top: 1px solid var(--lexa-line-soft);
}

.preview-foot svg {
  width: 14px;
}

.preview-foot i {
  width: 7px;
  height: 7px;
  margin-left: auto;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 12px #fff;
  animation: status-pulse 1.8s ease-in-out infinite;
}

@keyframes status-pulse {
  50% {
    opacity: 0.3;
    transform: scale(0.7);
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

.preview-kicker,
.search-state {
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.preview-chat p,
.preview-search > p {
  min-height: 120px;
  margin: 28px 0 34px;
  font-size: clamp(28px, 3.2vw, 50px);
  font-weight: 480;
  letter-spacing: -0.04em;
  line-height: 1.05;
}

.preview-status,
.search-state {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.preview-status {
  padding-bottom: 7px;
  border-bottom: 1px solid #fff;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.preview-status svg,
.search-state svg {
  width: 14px;
}

.source-row {
  min-height: 55px;
  display: grid;
  grid-template-columns: 38px 1fr 20px;
  align-items: center;
  border-top: 1px solid var(--lexa-line-soft);
  font-size: 13px;
}

.source-row > span {
  color: var(--lexa-muted);
  font-size: 9px;
}

.source-row strong {
  font-weight: 450;
}

.source-row svg {
  width: 14px;
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
    opacity: 0.42;
    transform: scaleY(0.52);
  }
}

.preview-audio p {
  margin: 26px 0 0;
  color: var(--lexa-muted);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.preview-memory {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
}

.memory-node span {
  color: var(--lexa-muted);
  font-size: 9px;
}

.memory-node strong {
  font-size: 15px;
  font-weight: 480;
}

.render-frame {
  height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  border: 1px solid var(--lexa-line);
  background:
    radial-gradient(
      circle,
      rgba(255, 255, 255, 0.14),
      transparent 56%
    ),
    rgba(255, 255, 255, 0.02);
}

.render-frame svg {
  width: 52px;
  height: 52px;
  stroke-width: 1.2;
}

.render-frame span {
  font-size: 9px;
  letter-spacing: 0.15em;
}

.render-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.1em;
}

.preview-code {
  padding: 24px 0;
  border-top: 1px solid var(--lexa-line);
  border-bottom: 1px solid var(--lexa-line);
}

.preview-code > span {
  display: block;
  margin-bottom: 35px;
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.13em;
}

.preview-code code {
  display: block;
  overflow-wrap: anywhere;
  font-family: "Courier New", monospace;
  font-size: clamp(17px, 1.8vw, 27px);
  line-height: 1.55;
}

.preview-code code b {
  color: rgba(255, 255, 255, 0.58);
  font-weight: 500;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.feature-row {
  position: relative;
  width: 100%;
  min-height: 252px;
  display: grid;
  grid-template-columns: 45px 52px 1fr 30px;
  gap: 18px;
  align-items: center;
  overflow: hidden;
  padding: 30px;
  border: 1px solid var(--lexa-line) !important;
  border-radius: 22px;
  color: #fff !important;
  text-align: left;
  isolation: isolate;
  transition:
    color 0.45s var(--lexa-ease-out),
    transform 0.45s var(--lexa-ease-out);
}

.feature-row::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: 20px;
  background: #fff;
  transform: translateY(101%);
  transition: transform 0.55s var(--lexa-ease-in-out);
}

.feature-row > * {
  position: relative;
  z-index: 1;
}

.feature-row:hover,
.feature-row.is-active {
  color: #000 !important;
  transform: scale(1.01);
}

.feature-row:hover::before,
.feature-row.is-active::before {
  transform: translateY(0);
}

.feature-number {
  opacity: 0.55;
  font-size: 9px;
  letter-spacing: 0.13em;
}

.feature-icon svg {
  width: 28px;
  height: 28px;
  transition: transform 0.45s var(--lexa-ease-out);
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
  margin-bottom: 17px;
  opacity: 0.58;
  font-size: 9px;
  letter-spacing: 0.14em;
}

.feature-copy strong {
  font-size: clamp(25px, 2.8vw, 44px);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1;
}

.feature-copy p {
  max-width: 580px;
  margin: 22px 0 0;
  opacity: 0.62;
  font-size: 14px;
  line-height: 1.48;
}

.feature-arrow svg {
  width: 22px;
  transition: transform 0.4s var(--lexa-ease-out);
}

.feature-row:hover .feature-arrow svg,
.feature-row.is-active .feature-arrow svg {
  transform: translateX(5px);
}

.use-cases-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--lexa-line);
  border-left: 1px solid var(--lexa-line);
}

.use-case-card {
  min-height: 270px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 27px 25px;
  border-right: 1px solid var(--lexa-line);
  border-bottom: 1px solid var(--lexa-line);
  transition:
    background 0.42s var(--lexa-ease-out),
    color 0.42s var(--lexa-ease-out);
}

.use-case-card:hover {
  background: #fff;
  color: #000;
}

.use-case-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.use-case-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border: 1px solid var(--lexa-line);
  border-radius: 13px;
}

.use-case-icon svg {
  width: 23px;
  height: 23px;
}

.use-case-tag {
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.15em;
}

.use-case-copy {
  position: relative;
  padding-left: 38px;
}

.use-case-index {
  position: absolute;
  top: 7px;
  left: 0;
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.12em;
}

.use-case-copy h3 {
  margin: 0 0 10px;
  font-size: clamp(22px, 2vw, 31px);
  font-weight: 520;
  letter-spacing: -0.04em;
}

.use-case-copy p {
  max-width: 360px;
  margin: 0;
  color: var(--lexa-muted);
  font-size: 13px;
  line-height: 1.5;
}

.use-case-card:hover .use-case-tag,
.use-case-card:hover .use-case-index,
.use-case-card:hover p {
  color: rgba(0, 0, 0, 0.6);
}

.use-case-card:hover .use-case-icon {
  border-color: rgba(0, 0, 0, 0.24);
}

.playground-window {
  min-height: 650px;
  display: grid;
  grid-template-columns: 244px minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid var(--lexa-line);
  border-radius: 16px;
  background:
    linear-gradient(
      rgba(255, 255, 255, 0.03) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.03) 1px,
      transparent 1px
    ),
    #060606;
  background-size: 42px 42px;
}

.playground-sidebar {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 17px 15px;
  border-right: 1px solid var(--lexa-line-soft);
  background: rgba(0, 0, 0, 0.38);
}

.new-chat-button {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border-radius: 10px;
  background: #fff !important;
  color: #000 !important;
  font-size: 12px !important;
  font-weight: 600 !important;
}

.new-chat-button svg {
  width: 16px;
}

.sidebar-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.sidebar-group > span,
.sidebar-memory > span {
  margin: 0 9px 7px;
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.15em;
}

.sidebar-group button {
  min-height: 35px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 10px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.65);
  text-align: left;
  font-size: 12px;
}

.sidebar-group button.is-active {
  background: rgba(255, 255, 255, 0.07);
  color: #fff;
}

.sidebar-group button > i {
  width: 5px;
  height: 5px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--lexa-muted);
}

.sidebar-group button.is-active > i {
  background: #fff;
  box-shadow: 0 0 8px #fff;
}

.sidebar-group button > svg {
  width: 15px;
}

.sidebar-memory {
  margin-top: auto;
  padding: 14px 12px;
  border: 1px solid var(--lexa-line-soft);
  border-radius: 12px;
}

.sidebar-memory > span {
  display: block;
  margin: 0 0 12px;
}

.sidebar-memory p {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 0;
  color: rgba(255, 255, 255, 0.65);
  font-size: 11px;
  line-height: 1.35;
}

.sidebar-memory p i {
  width: 5px;
  height: 5px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--lexa-muted);
}

.playground-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.playground-topbar {
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 0 20px;
  border-bottom: 1px solid var(--lexa-line-soft);
}

.window-information,
.window-models {
  display: flex;
  align-items: center;
  gap: 14px;
}

.window-information {
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.13em;
}

.window-dots {
  display: flex;
  gap: 6px;
}

.window-dots i {
  width: 9px;
  height: 9px;
  border: 1px solid var(--lexa-line);
  border-radius: 50%;
}

.model-chip {
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 12px;
  border: 1px solid var(--lexa-line);
  border-radius: 999px;
  font-size: 10px;
  letter-spacing: 0.06em;
}

.model-chip svg {
  width: 13px;
}

.online-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.12em;
}

.online-chip i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 9px #fff;
}

.demo-thread {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 28px clamp(18px, 3vw, 40px);
}

.demo-user-message {
  align-self: flex-end;
  max-width: min(80%, 650px);
  padding: 14px 18px;
  border: 1px solid var(--lexa-line-soft);
  border-radius: 16px 16px 4px 16px;
  background: rgba(255, 255, 255, 0.06);
  font-size: 14px;
  line-height: 1.48;
}

.demo-assistant-message {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.demo-tool-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.demo-tool-row > span {
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 11px;
  border: 1px solid var(--lexa-line-soft);
  border-radius: 999px;
  color: var(--lexa-muted);
  font-size: 10px;
}

.demo-tool-row svg {
  width: 13px;
}

.demo-tool-row .source-chip {
  color: #fff;
}

.source-chip i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
}

.demo-assistant-message > p {
  max-width: 68ch;
  min-height: 76px;
  margin: 0;
  color: rgba(255, 255, 255, 0.92);
  font-size: clamp(15px, 1.2vw, 18px);
  line-height: 1.62;
}

.demo-assistant-message sup {
  margin-left: 3px;
  color: var(--lexa-muted);
  font-size: 10px;
}

.demo-stream-caret {
  width: 2px;
  height: 1em;
  display: inline-block;
  margin-left: 3px;
  background: #fff;
  vertical-align: -2px;
  animation: caret-blink 0.7s steps(1) infinite;
}

.demo-response-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid var(--lexa-line-soft);
}

.demo-response-actions button {
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 11px;
  border: 1px solid var(--lexa-line-soft);
  border-radius: 8px;
  color: var(--lexa-muted);
  font-size: 10px;
}

.demo-response-actions button:hover {
  color: #fff;
}

.demo-response-actions button svg {
  width: 14px;
}

.demo-response-actions > span {
  margin-left: auto;
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.12em;
}

.demo-input {
  margin: 0 clamp(16px, 2.5vw, 28px) 22px;
  padding: 12px 13px 10px;
  border: 1px solid var(--lexa-line);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.025);
}

.demo-input textarea {
  width: 100%;
  resize: none;
  border: 0;
  outline: 0;
  padding: 4px 4px 12px;
  background: transparent;
  color: #fff;
  font-size: 14px;
  line-height: 1.45;
}

.demo-input textarea::placeholder {
  color: var(--lexa-muted);
}

.demo-input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.demo-input-tools {
  display: flex;
  align-items: center;
  gap: 5px;
}

.demo-input-tools button {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 9px;
  color: var(--lexa-muted);
}

.demo-input-tools button:hover,
.demo-input-tools button.is-active {
  border-color: var(--lexa-line);
  color: #fff;
}

.demo-input-tools svg {
  width: 17px;
}

.demo-send-button {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #fff !important;
  color: #000 !important;
  transition: opacity 0.2s ease;
}

.demo-send-button:disabled {
  opacity: 0.35;
}

.demo-send-button svg {
  width: 18px;
}

.demo-keyboard-hint {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  margin-top: 9px;
  color: var(--lexa-muted);
  font-size: 8px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.demo-keyboard-hint svg {
  width: 12px;
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
  min-height: 96px;
  display: grid;
  grid-template-columns: 44px 1fr auto 25px;
  gap: 15px;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2) !important;
  color: #000 !important;
  text-align: left;
  transition:
    padding-left 0.4s var(--lexa-ease-out),
    background 0.3s ease,
    color 0.3s ease;
}

.model-tabs button:hover,
.model-tabs button.is-active {
  padding-left: 15px;
  background: #000;
  color: #fff !important;
}

.model-tabs button > span,
.model-tabs button > small {
  opacity: 0.58;
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.model-tabs button > strong {
  font-size: clamp(21px, 2.1vw, 33px);
  font-weight: 500;
  letter-spacing: -0.035em;
}

.model-tabs button svg {
  width: 18px;
}

.model-detail {
  position: sticky;
  top: 105px;
  min-height: 580px;
  padding: clamp(30px, 4.5vw, 62px);
  border: 1px solid rgba(0, 0, 0, 0.32);
  background:
    linear-gradient(
      rgba(0, 0, 0, 0.05) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.05) 1px,
      transparent 1px
    ),
    #f7f7f5;
  background-size: 46px 46px;
  animation: model-enter 0.6s var(--lexa-ease-out) both;
}

@keyframes model-enter {
  from {
    opacity: 0;
    filter: blur(7px);
    transform: translateY(26px);
  }

  to {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0);
  }
}

.model-detail-head {
  display: flex;
  justify-content: space-between;
  color: rgba(0, 0, 0, 0.55);
  font-size: 9px;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.model-detail h3 {
  margin: clamp(58px, 7vw, 104px) 0 18px;
  font-size: clamp(48px, 6vw, 90px);
  font-weight: 560;
  letter-spacing: -0.06em;
  line-height: 0.9;
}

.model-detail > p {
  max-width: 590px;
  margin: 0;
  color: rgba(0, 0, 0, 0.62);
  font-size: clamp(17px, 1.45vw, 21px);
  line-height: 1.4;
}

.model-specs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 44px;
  border-top: 1px solid rgba(0, 0, 0, 0.22);
  border-bottom: 1px solid rgba(0, 0, 0, 0.22);
}

.model-specs > div {
  min-height: 96px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 17px 12px;
  border-right: 1px solid rgba(0, 0, 0, 0.18);
}

.model-specs > div:first-child {
  padding-left: 0;
}

.model-specs > div:last-child {
  border-right: 0;
}

.model-specs span {
  color: rgba(0, 0, 0, 0.52);
  font-size: 9px;
  letter-spacing: 0.11em;
}

.model-specs strong {
  font-size: 14px;
  font-weight: 520;
}

.capability-list {
  margin-top: 28px;
  border-top: 1px solid rgba(0, 0, 0, 0.2);
}

.capability-list > div {
  min-height: 48px;
  display: grid;
  grid-template-columns: 35px 1fr 20px;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
}

.capability-list span {
  color: rgba(0, 0, 0, 0.5);
  font-size: 9px;
}

.capability-list strong {
  font-size: 13px;
  font-weight: 500;
}

.capability-list svg {
  width: 14px;
}

.trust-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--lexa-line);
  border-left: 1px solid var(--lexa-line);
}

.trust-card {
  min-height: 230px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 25px;
  border-right: 1px solid var(--lexa-line);
  border-bottom: 1px solid var(--lexa-line);
}

.trust-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.trust-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 1px solid var(--lexa-line);
  border-radius: 12px;
}

.trust-icon svg {
  width: 21px;
}

.trust-card-top > span:last-child {
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.12em;
}

.trust-card h3 {
  margin: 0 0 10px;
  font-size: clamp(20px, 1.7vw, 27px);
  font-weight: 510;
  letter-spacing: -0.035em;
}

.trust-card p {
  max-width: 360px;
  margin: 0;
  color: var(--lexa-muted);
  font-size: 13px;
  line-height: 1.5;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--lexa-line);
  border-left: 1px solid var(--lexa-line);
}

.pricing-card {
  min-height: 620px;
  display: flex;
  flex-direction: column;
  padding: clamp(24px, 3vw, 42px);
  border-right: 1px solid var(--lexa-line);
  border-bottom: 1px solid var(--lexa-line);
  background: #000;
  color: #fff;
  transition: transform 0.5s var(--lexa-ease-out);
}

.pricing-card:hover {
  transform: translateY(-8px);
}

.pricing-card.is-featured {
  background: #fff;
  color: #000;
}

.pricing-label {
  opacity: 0.56;
  font-size: 9px;
  letter-spacing: 0.14em;
}

.pricing-card h3 {
  margin: clamp(42px, 5vw, 72px) 0 14px;
  font-size: clamp(46px, 5vw, 74px);
  font-weight: 520;
  letter-spacing: -0.055em;
}

.pricing-description {
  min-height: 45px;
  margin: 0;
  opacity: 0.62;
  font-size: 14px;
  line-height: 1.45;
}

.pricing-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 35px;
  padding: 25px 0;
  border-top: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
}

.pricing-price strong {
  font-size: clamp(48px, 5vw, 76px);
  font-weight: 520;
  letter-spacing: -0.065em;
}

.pricing-price span {
  opacity: 0.58;
  font-size: 10px;
  text-transform: uppercase;
}

.pricing-card ul {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 32px 0 38px;
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

.pricing-card li svg {
  width: 14px;
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

.faq-layout {
  display: grid;
  grid-template-columns: minmax(300px, 0.78fr) minmax(500px, 1.22fr);
  gap: clamp(50px, 9vw, 150px);
  padding-top: clamp(64px, 8vw, 122px);
}

.faq-layout .split-heading {
  position: sticky;
  top: 110px;
  align-self: start;
  font-size: clamp(48px, 6.2vw, 94px);
}

.faq-list {
  border-top: 1px solid var(--lexa-line);
}

.faq-item {
  border-bottom: 1px solid var(--lexa-line);
}

.faq-item > button {
  width: 100%;
  min-height: 100px;
  display: grid;
  grid-template-columns: 46px 1fr 28px;
  gap: 17px;
  align-items: center;
  color: #fff !important;
  text-align: left;
}

.faq-item > button > span {
  color: var(--lexa-muted);
  font-size: 9px;
}

.faq-item > button > strong {
  font-size: clamp(18px, 1.75vw, 26px);
  font-weight: 470;
  letter-spacing: -0.025em;
}

.faq-item > button svg {
  width: 19px;
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
  max-width: 700px;
  overflow: hidden;
  margin: 0 40px 0 63px;
  color: var(--lexa-muted);
  font-size: 15px;
  line-height: 1.55;
}

.faq-item.is-open .faq-answer {
  grid-template-rows: 1fr;
  opacity: 1;
}

.faq-item.is-open .faq-answer > p {
  padding-bottom: 32px;
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
  top: 50%;
  right: -12vw;
  width: min(62vw, 900px);
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 50%;
  transform: translateY(-50%);
  animation: final-orbit 32s linear infinite;
}

@keyframes final-orbit {
  from {
    transform: translateY(-50%) rotate(0);
  }

  to {
    transform: translateY(-50%) rotate(360deg);
  }
}

.final-kicker {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 42px;
  color: var(--lexa-muted);
  font-size: 9px;
  letter-spacing: 0.14em;
}

.final-kicker svg {
  width: 14px;
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
  min-width: 245px;
  margin-top: 58px;
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
  letter-spacing: 0.14em;
}

.footer-top a,
.footer-top button {
  min-height: 24px;
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 13px !important;
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

@media (max-width: 1180px) {
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

  .router-flow {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .router-piece:nth-child(2) .router-arrow {
    display: none;
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

  .use-cases-grid,
  .trust-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .playground-window {
    grid-template-columns: 210px minmax(0, 1fr);
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
    max-width: 570px;
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
    grid-template-columns: 38px 1fr;
    padding: 26px;
  }

  .stage-router {
    grid-column: 1 / -1;
  }

  .stage-orbit {
    width: 300px;
  }

  .hero-stage-top span:last-child,
  .hero-stage-bottom span:last-child {
    display: none;
  }

  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .overview-item {
    min-height: 240px;
    border-bottom: 1px solid var(--lexa-line-soft);
  }

  .overview-item:nth-child(2) {
    border-right: 0;
  }

  .section-heading-row {
    grid-template-columns: 1fr;
    gap: 34px;
    padding: 60px 0 82px;
  }

  .split-heading {
    font-size: clamp(48px, 12vw, 80px);
  }

  .section-heading-row > p {
    max-width: 590px;
  }

  .router-flow {
    grid-template-columns: 1fr;
  }

  .router-piece {
    display: block;
  }

  .router-card {
    min-height: 250px;
  }

  .router-arrow {
    width: 100%;
    height: 40px;
    display: grid !important;
  }

  .router-arrow svg {
    transform: rotate(90deg);
  }

  .router-piece:last-child .router-arrow {
    display: none !important;
  }

  .feature-preview {
    min-height: 540px;
  }

  .feature-row {
    min-height: 230px;
    grid-template-columns: 38px 42px 1fr 24px;
    gap: 12px;
    padding: 24px;
  }

  .playground-window {
    grid-template-columns: 1fr;
  }

  .playground-sidebar {
    display: none;
  }

  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .pricing-card {
    min-height: auto;
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

  .footer-top {
    grid-template-columns: repeat(3, 1fr);
  }

  .footer-status {
    grid-column: 1 / -1;
    justify-self: start;
    margin-top: 20px;
  }
}

@media (max-width: 560px) {
  :root {
    --lexa-gutter: 18px;
  }

  .mobile-menu {
    padding-top: 100px;
  }

  .mobile-menu-links button {
    min-height: 72px;
  }

  .mobile-menu-footer {
    flex-direction: column;
    gap: 4px;
  }

  .hero-section {
    padding-top: 112px;
    padding-bottom: 70px;
  }

  .hero-copy h1 {
    font-size: clamp(49px, 15vw, 74px);
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
    font-size: 34px;
  }

  .stage-router {
    grid-column: 1;
  }

  .stage-router span {
    padding: 8px 9px;
    font-size: 8px;
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

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .overview-item {
    min-height: 210px;
    border-right: 0;
  }

  .overview-item > strong {
    font-size: 62px;
  }

  .marquee-track span::after {
    margin: 0 28px;
  }

  .feature-preview {
    min-height: 480px;
  }

  .preview-body {
    padding: 23px;
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
    min-height: 245px;
    grid-template-columns: 30px 1fr 22px;
    padding: 22px 17px;
  }

  .feature-icon {
    display: none;
  }

  .feature-copy strong {
    font-size: 28px;
  }

  .use-cases-grid,
  .trust-grid {
    grid-template-columns: 1fr;
  }

  .use-case-card {
    min-height: 245px;
  }

  .playground-window {
    min-height: 690px;
    border-radius: 12px;
  }

  .playground-topbar {
    padding: 0 13px;
  }

  .window-information > span:last-child,
  .online-chip {
    display: none;
  }

  .model-chip {
    font-size: 9px;
  }

  .demo-thread {
    padding: 22px 14px;
  }

  .demo-user-message {
    max-width: 92%;
    font-size: 13px;
  }

  .demo-tool-row .source-chip {
    display: none;
  }

  .demo-response-actions > span {
    display: none;
  }

  .demo-input {
    margin-right: 12px;
    margin-bottom: 12px;
    margin-left: 12px;
  }

  .demo-input-tools button {
    width: 33px;
    height: 33px;
  }

  .demo-keyboard-hint {
    display: none;
  }

  .models-section {
    padding-top: 86px;
    padding-bottom: 86px;
  }

  .model-tabs button {
    min-height: 82px;
    grid-template-columns: 32px 1fr 20px;
  }

  .model-tabs button > small {
    display: none;
  }

  .model-detail {
    min-height: 0;
    padding: 24px;
  }

  .model-detail h3 {
    margin-top: 54px;
    font-size: 51px;
  }

  .model-specs {
    grid-template-columns: 1fr;
  }

  .model-specs > div {
    min-height: 68px;
    border-right: 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.15);
    padding-left: 0;
  }

  .pricing-card {
    padding: 27px 22px;
  }

  .faq-item > button {
    min-height: 86px;
    grid-template-columns: 28px 1fr 22px;
    gap: 10px;
  }

  .faq-answer > p {
    margin-left: 38px;
    font-size: 14px;
  }

  .final-cta {
    min-height: 76svh;
  }

  .final-cta .split-heading {
    font-size: 57px;
  }

  .final-button {
    min-width: 0;
  }

  .footer-top {
    grid-template-columns: repeat(2, 1fr);
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

  .screen-loader,
  .film-cursor {
    display: none !important;
  }

  .marquee-track {
    transform: translateX(0);
  }
}
`;