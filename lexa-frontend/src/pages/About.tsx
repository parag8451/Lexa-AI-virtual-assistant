import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Brain,
  Braces,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Cloud,
  Code2,
  Command,
  Cpu,
  Database,
  Eye,
  FileCode2,
  FileText,
  Gauge,
  Globe2,
  Headphones,
  Image as ImageIcon,
  KeyRound,
  Layers3,
  Lightbulb,
  LockKeyhole,
  Menu,
  MessageSquare,
  Mic2,
  MoreHorizontal,
  MousePointer2,
  Network,
  Orbit,
  Paperclip,
  PanelsTopLeft,
  Play,
  Plus,
  Radar,
  Rocket,
  Search,
  Send,
  ServerCog,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Stars,
  TerminalSquare,
  Timer,
  Users,
  WandSparkles,
  Waypoints,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { LogoIcon } from "@/components/ui/LogoIcon";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CapabilityCategory = "all" | "reasoning" | "creative" | "workflow";

type Capability = {
  icon: LucideIcon;
  title: string;
  shortTitle: string;
  description: string;
  category: Exclude<CapabilityCategory, "all">;
  accent: string;
  glow: string;
  metric: string;
  metricLabel: string;
  tags: string[];
  bullets: string[];
};

type Philosophy = {
  number: string;
  title: string;
  description: string;
  detail: string;
  icon: LucideIcon;
  accent: string;
};

type TimelineItem = {
  year: string;
  title: string;
  description: string;
  icon: LucideIcon;
  status: "complete" | "current" | "next";
};

type FAQItem = {
  question: string;
  answer: string;
};

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

const CAPABILITIES: Capability[] = [
  {
    icon: MessageSquare,
    title: "Multimodal AI Conversations",
    shortTitle: "Conversations",
    description:
      "Fluid, context-aware dialogue that understands nuance, remembers your working context, and adapts to complex inquiries with logical reasoning.",
    category: "reasoning",
    accent: "from-cyan-400 to-blue-500",
    glow: "shadow-cyan-500/20",
    metric: "98.7%",
    metricLabel: "context retention",
    tags: ["Context", "Reasoning", "Streaming"],
    bullets: [
      "Natural multi-turn conversations with persistent thread context",
      "Structured answers for research, planning, analysis, and execution",
      "Inline follow-up suggestions that preserve your original intent",
    ],
  },
  {
    icon: Cpu,
    title: "Multi-Model Orchestration",
    shortTitle: "Model routing",
    description:
      "Switch seamlessly between leading model families and custom endpoints without losing the conversation, attachments, or workspace instructions.",
    category: "reasoning",
    accent: "from-violet-400 to-fuchsia-500",
    glow: "shadow-violet-500/20",
    metric: "12+",
    metricLabel: "model paths",
    tags: ["GPT", "Gemini", "Claude"],
    bullets: [
      "Choose the right intelligence profile for every task",
      "Keep model preferences, temperature, and context settings visible",
      "Route between fast answers and deeper reasoning in one workspace",
    ],
  },
  {
    icon: Globe2,
    title: "Real-Time Web Search",
    shortTitle: "Live research",
    description:
      "Live internet access for current facts, research synthesis, and verified citations directly inside your conversations.",
    category: "workflow",
    accent: "from-emerald-400 to-teal-500",
    glow: "shadow-emerald-500/20",
    metric: "24/7",
    metricLabel: "fresh context",
    tags: ["Search", "Sources", "Citations"],
    bullets: [
      "Search the live web when static knowledge is not enough",
      "Separate source discovery from synthesis so claims stay traceable",
      "Bring multiple sources into one concise, useful answer",
    ],
  },
  {
    icon: Mic2,
    title: "Voice AI & Speech Synthesis",
    shortTitle: "Voice interface",
    description:
      "Natural hands-free voice interactions with rapid speech-to-text transcription and crisp audio playback for ideas on the move.",
    category: "workflow",
    accent: "from-orange-400 to-rose-500",
    glow: "shadow-orange-500/20",
    metric: "320ms",
    metricLabel: "voice response",
    tags: ["Listen", "Speak", "Transcribe"],
    bullets: [
      "Capture rough thoughts without opening a full editor",
      "Move from spoken idea to structured note or action plan",
      "Keep voice input optional, private, and under your control",
    ],
  },
  {
    icon: ImageIcon,
    title: "Image & Video Generation",
    shortTitle: "Visual studio",
    description:
      "Generate high-resolution visual concepts, product frames, and cinematic directions directly from simple, expressive prompts.",
    category: "creative",
    accent: "from-pink-400 to-purple-500",
    glow: "shadow-pink-500/20",
    metric: "4K",
    metricLabel: "visual canvas",
    tags: ["Images", "Video", "Concepts"],
    bullets: [
      "Turn a loose creative brief into polished visual directions",
      "Iterate on tone, composition, lighting, and visual language",
      "Keep generated media close to the conversations that shaped it",
    ],
  },
  {
    icon: Brain,
    title: "Personalized Memory & Workspaces",
    shortTitle: "Memory layer",
    description:
      "Configurable instructions and project-level workspaces that align the assistant with the way you think, write, and operate.",
    category: "workflow",
    accent: "from-amber-300 to-orange-500",
    glow: "shadow-amber-500/20",
    metric: "100%",
    metricLabel: "user controlled",
    tags: ["Memory", "Projects", "Rules"],
    bullets: [
      "Define project-specific rules without repeating yourself",
      "Separate work, study, personal, and creative contexts",
      "Review and adjust what the workspace should remember",
    ],
  },
  {
    icon: Code2,
    title: "Full-Stack Code Intelligence",
    shortTitle: "Code partner",
    description:
      "Write, analyze, debug, and explain code with syntax-aware reasoning, focused diffs, and step-by-step logic that stays readable.",
    category: "reasoning",
    accent: "from-blue-400 to-indigo-500",
    glow: "shadow-blue-500/20",
    metric: "42+",
    metricLabel: "languages",
    tags: ["Debug", "Build", "Explain"],
    bullets: [
      "Move from error message to root cause with less context switching",
      "Understand unfamiliar repositories and architectural patterns",
      "Generate clean starting points without hiding the underlying logic",
    ],
  },
  {
    icon: Layers3,
    title: "Document & File Analysis",
    shortTitle: "File intelligence",
    description:
      "Attach code files, images, PDFs, or spreadsheets for immediate summarization, comparison, extraction, and structured analysis.",
    category: "workflow",
    accent: "from-sky-400 to-cyan-500",
    glow: "shadow-sky-500/20",
    metric: "50MB",
    metricLabel: "workspace files",
    tags: ["PDF", "Data", "Files"],
    bullets: [
      "Ask questions across documents instead of searching page by page",
      "Extract tables, decisions, themes, and action items quickly",
      "Keep files attached to the reasoning trail that produced the answer",
    ],
  },
];

const PHILOSOPHIES: Philosophy[] = [
  {
    number: "01",
    title: "Model Choice & Freedom",
    description:
      "Instead of locking you into a single proprietary model, Lexa brings capable AI engines into one cohesive workspace.",
    detail:
      "Different tasks deserve different strengths. Lexa makes that choice visible and easy, so the model serves the work instead of dictating it.",
    icon: Waypoints,
    accent: "from-cyan-400 to-blue-500",
  },
  {
    number: "02",
    title: "Thoughtful Simplicity",
    description:
      "Powerful AI capabilities should not require complex configurations. Lexa keeps the interface focused on your flow state.",
    detail:
      "The surface stays calm while the system remains powerful underneath. Clear defaults, progressive controls, and purposeful motion keep the experience human.",
    icon: Lightbulb,
    accent: "from-violet-400 to-fuchsia-500",
  },
  {
    number: "03",
    title: "User Control & Privacy",
    description:
      "You maintain control over conversation history, uploaded files, model preferences, and personal memory settings.",
    detail:
      "Trust is not a decorative layer. It is expressed through understandable settings, explicit choices, and a product that never makes your context feel trapped.",
    icon: LockKeyhole,
    accent: "from-emerald-400 to-teal-500",
  },
  {
    number: "04",
    title: "Practical Daily Assistance",
    description:
      "Lexa is built for tangible work—writing, researching, coding, brainstorming, and automation—without gimmick features.",
    detail:
      "The best intelligence is the kind that gives you momentum. Every capability is measured by how naturally it moves a real task forward.",
    icon: Rocket,
    accent: "from-orange-400 to-rose-500",
  },
];

const TIMELINE: TimelineItem[] = [
  {
    year: "01",
    title: "A better starting point",
    description:
      "Lexa began with a simple question: why should useful intelligence feel fragmented across tools, tabs, and subscriptions?",
    icon: Lightbulb,
    status: "complete",
  },
  {
    year: "02",
    title: "One calm workspace",
    description:
      "We brought conversations, models, search, voice, files, and visual tools into a shared surface designed for momentum.",
    icon: PanelsTopLeft,
    status: "complete",
  },
  {
    year: "03",
    title: "Context that compounds",
    description:
      "Workspaces and memory made the assistant more useful over time without taking control away from the person using it.",
    icon: Brain,
    status: "current",
  },
  {
    year: "04",
    title: "The intelligence layer ahead",
    description:
      "We are building toward a more connected way to think, create, and execute—without losing the clarity that makes it useful.",
    icon: Orbit,
    status: "next",
  },
];

const FAQS: FAQItem[] = [
  {
    question: "What makes Lexa different from a standard AI chat interface?",
    answer:
      "Lexa is designed as a working environment rather than a single prompt box. It brings model choice, live research, voice, file understanding, visual creation, and workspace context into the same flow so you can move from idea to outcome with fewer handoffs.",
  },
  {
    question: "Can I use different models for different tasks?",
    answer:
      "Yes. Lexa is built around model choice. You can select a model or intelligence profile based on the task, then keep the same workspace instructions, attachments, and conversation context available as you switch.",
  },
  {
    question: "How does workspace memory work?",
    answer:
      "Workspace memory is a configurable layer for preferences, project rules, and recurring context. You decide what belongs in a workspace and can review or change those instructions whenever your project evolves.",
  },
  {
    question: "What type of files can I analyze?",
    answer:
      "Lexa is designed to work with common documents, code files, images, PDFs, and spreadsheet-style data. The exact supported formats depend on the capabilities enabled in your workspace.",
  },
  {
    question: "Is Lexa designed for individual users or teams?",
    answer:
      "The core experience is useful for individuals, independent creators, researchers, and professionals. Its workspace approach also gives teams a clear foundation for shared conventions and repeatable AI-assisted workflows.",
  },
];

const CATEGORY_FILTERS: Array<{ id: CapabilityCategory; label: string; icon: LucideIcon }> = [
  { id: "all", label: "All systems", icon: Radar },
  { id: "reasoning", label: "Reasoning", icon: Brain },
  { id: "creative", label: "Creative", icon: WandSparkles },
  { id: "workflow", label: "Workflow", icon: Workflow },
];

const NAV_ITEMS = [
  { label: "Vision", target: "vision" },
  { label: "Capabilities", target: "capabilities" },
  { label: "Principles", target: "principles" },
  { label: "FAQ", target: "faq" },
];

/* -------------------------------------------------------------------------- */
/* Utility functions                                                          */
/* -------------------------------------------------------------------------- */

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getCategoryLabel(category: CapabilityCategory) {
  if (category === "reasoning") return "Reasoning system";
  if (category === "creative") return "Creative system";
  if (category === "workflow") return "Workflow system";
  return "All systems";
}

/* -------------------------------------------------------------------------- */
/* Reusable visual primitives                                                 */
/* -------------------------------------------------------------------------- */

function NoiseOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.025] mix-blend-soft-light"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.9'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

function AmbientBackdrop({ dark = false }: { dark?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={cn(
          "absolute left-1/2 top-[-20rem] h-[44rem] w-[44rem] -translate-x-1/2 rounded-full blur-3xl",
          dark ? "bg-cyan-500/10" : "bg-indigo-500/[0.08]",
        )}
      />
      <div
        className={cn(
          "absolute right-[-16rem] top-1/4 h-[32rem] w-[32rem] rounded-full blur-3xl",
          dark ? "bg-violet-500/10" : "bg-purple-500/[0.07]",
        )}
      />
      <div
        className={cn(
          "absolute bottom-[-20rem] left-[-12rem] h-[34rem] w-[34rem] rounded-full blur-3xl",
          dark ? "bg-blue-500/10" : "bg-cyan-500/[0.05]",
        )}
      />
      <div
        className={cn(
          "absolute inset-0 opacity-40",
          dark ? "bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,.7)_78%)]" : "bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_82%)]",
        )}
      />
    </div>
  );
}

function GridPattern({ dark = false }: { dark?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 opacity-60",
        dark ? "[mask-image:linear-gradient(to_bottom,black,transparent_85%)]" : "[mask-image:linear-gradient(to_bottom,black,transparent_75%)]",
      )}
      style={{
        backgroundImage: dark
          ? "linear-gradient(rgba(148,163,184,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.08) 1px, transparent 1px)"
          : "linear-gradient(hsl(var(--border) / .3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / .3) 1px, transparent 1px)",
        backgroundSize: "4rem 4rem",
      }}
    />
  );
}

function SectionEyebrow({ children, icon: Icon = Sparkles }: { children: string; icon?: LucideIcon }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
      <Icon className="h-3.5 w-3.5" />
      <span>{children}</span>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  icon?: LucideIcon;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <SectionEyebrow icon={icon}>{eyebrow}</SectionEyebrow>
      <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
        {description}
      </p>
    </div>
  );
}

function CornerMarks({ className = "" }: { className?: string }) {
  return (
    <>
      <span aria-hidden="true" className={cn("pointer-events-none absolute left-4 top-4 h-3 w-3 border-l border-t border-primary/50", className)} />
      <span aria-hidden="true" className={cn("pointer-events-none absolute right-4 top-4 h-3 w-3 border-r border-t border-primary/50", className)} />
      <span aria-hidden="true" className={cn("pointer-events-none absolute bottom-4 left-4 h-3 w-3 border-b border-l border-primary/50", className)} />
      <span aria-hidden="true" className={cn("pointer-events-none absolute bottom-4 right-4 h-3 w-3 border-b border-r border-primary/50", className)} />
    </>
  );
}

function StatusDot({ label = "Live" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      {label}
    </span>
  );
}

function GradientIcon({ icon: Icon, gradient }: { icon: LucideIcon; gradient: string }) {
  return (
    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", gradient)}>
      <Icon className="h-5 w-5" strokeWidth={1.8} />
    </div>
  );
}

function MiniBars({ values, active = false }: { values: number[]; active?: boolean }) {
  return (
    <div className="flex h-8 items-end gap-1">
      {values.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className={cn("w-1 rounded-full transition-all duration-500", active ? "bg-cyan-300" : "bg-white/30")}
          style={{ height: `${Math.max(15, value)}%`, transitionDelay: `${index * 35}ms` }}
        />
      ))}
    </div>
  );
}

function ProgressLine({ value, color = "bg-cyan-400" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
      <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${value}%` }} />
    </div>
  );
}

function ShimmerLine({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={cn("block h-2 animate-pulse rounded-full bg-gradient-to-r from-muted/40 via-muted/80 to-muted/40", className)} />;
}

function MetricTile({ value, label, icon: Icon }: { value: string; label: string; icon: LucideIcon }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/65 p-4 backdrop-blur-sm transition-colors hover:border-primary/30">
      <Icon className="mb-4 h-4 w-4 text-primary" />
      <div className="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function GlassButton({
  children,
  onClick,
  variant = "dark",
  icon: Icon,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "dark" | "light" | "ghost";
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        variant === "dark" && "bg-foreground text-background shadow-xl shadow-foreground/10 hover:-translate-y-0.5 hover:shadow-2xl",
        variant === "light" && "border border-border/70 bg-background/75 text-foreground shadow-lg shadow-black/[0.03] backdrop-blur-md hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background",
        variant === "ghost" && "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        className,
      )}
    >
      {children}
      {Icon && <Icon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero visual components                                                     */
/* -------------------------------------------------------------------------- */

function OrbitRing({ className, children }: { className: string; children?: React.ReactNode }) {
  return (
    <div className={cn("absolute rounded-full border border-white/10", className)}>
      {children}
    </div>
  );
}

function DataNode({
  className,
  icon: Icon,
  label,
  color,
}: {
  className: string;
  icon: LucideIcon;
  label: string;
  color: string;
}) {
  return (
    <div className={cn("absolute z-20 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-[10px] font-medium text-white/75 shadow-2xl backdrop-blur-xl", className)}>
      <span className={cn("flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br text-white", color)}>
        <Icon className="h-3 w-3" />
      </span>
      {label}
    </div>
  );
}

function NeuralCore() {
  const spokes = Array.from({ length: 12 });
  const nodes = [
    { className: "left-[9%] top-[26%]", color: "bg-cyan-300" },
    { className: "left-[22%] top-[76%]", color: "bg-violet-300" },
    { className: "left-[49%] top-[6%]", color: "bg-fuchsia-300" },
    { className: "right-[9%] top-[31%]", color: "bg-emerald-300" },
    { className: "right-[18%] bottom-[12%]", color: "bg-amber-300" },
    { className: "left-[44%] bottom-[4%]", color: "bg-blue-300" },
  ];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[34rem] select-none">
      <div className="absolute inset-[14%] rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute inset-[24%] rounded-full bg-violet-500/20 blur-2xl" />
      <OrbitRing className="inset-[11%] animate-[spin_22s_linear_infinite]">
        <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_18px_6px_rgba(103,232,249,.45)]" />
      </OrbitRing>
      <OrbitRing className="inset-[19%] rotate-45 animate-[spin_28s_linear_infinite_reverse]">
        <div className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-fuchsia-300 shadow-[0_0_16px_5px_rgba(240,171,252,.45)]" />
      </OrbitRing>
      <OrbitRing className="inset-[28%] -rotate-12 animate-[spin_18s_linear_infinite]" />
      <div className="absolute inset-[35%] rounded-full border border-white/20 bg-gradient-to-br from-cyan-300/20 via-violet-400/20 to-fuchsia-400/20 shadow-[0_0_80px_16px_rgba(59,130,246,.18)] backdrop-blur-xl">
        <div className="absolute inset-3 rounded-full border border-white/15 bg-slate-950/75 p-3 shadow-inner shadow-white/10">
          <div className="flex h-full flex-col items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-transparent text-center">
            <LogoIcon className="mb-2 h-8 w-8 text-cyan-200" />
            <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/70">Lexa</span>
            <span className="mt-1 text-[8px] uppercase tracking-[0.17em] text-cyan-200/60">Core online</span>
          </div>
        </div>
      </div>
      {spokes.map((_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-px origin-left bg-gradient-to-r from-cyan-300/50 via-violet-300/20 to-transparent"
          style={{ width: `${18 + (index % 3) * 7}%`, transform: `rotate(${index * 30}deg)` }}
        />
      ))}
      {nodes.map((node, index) => (
        <span key={index} className={cn("absolute h-2.5 w-2.5 rounded-full shadow-[0_0_18px_6px_currentColor]", node.className, node.color)} />
      ))}
      <DataNode className="left-0 top-[18%]" icon={Search} label="Live web" color="from-emerald-400 to-teal-500" />
      <DataNode className="right-[-2%] top-[22%]" icon={Cpu} label="Models" color="from-violet-400 to-fuchsia-500" />
      <DataNode className="bottom-[12%] left-[2%]" icon={FileText} label="Context" color="from-blue-400 to-cyan-500" />
      <DataNode className="bottom-[17%] right-[-1%]" icon={ImageIcon} label="Create" color="from-pink-400 to-rose-500" />
    </div>
  );
}

function TelemetryPanel() {
  const signalValues = [30, 56, 42, 85, 63, 92, 70, 84, 58, 93, 67, 78];
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/[0.08] via-transparent to-violet-400/[0.08]" />
      <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10">
            <Activity className="h-4 w-4 text-cyan-200" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">System telemetry</p>
            <p className="mt-1 text-sm font-medium text-white">Intelligence layer</p>
          </div>
        </div>
        <StatusDot label="Stable" />
      </div>
      <div className="relative grid grid-cols-2 gap-3 py-5">
        <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
          <div className="mb-2 flex items-center justify-between text-[10px] text-white/45">
            <span>Context</span>
            <span className="text-cyan-200">98.7%</span>
          </div>
          <ProgressLine value={98.7} color="bg-gradient-to-r from-cyan-400 to-blue-400" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
          <div className="mb-2 flex items-center justify-between text-[10px] text-white/45">
            <span>Routing</span>
            <span className="text-violet-200">92.4%</span>
          </div>
          <ProgressLine value={92.4} color="bg-gradient-to-r from-violet-400 to-fuchsia-400" />
        </div>
      </div>
      <div className="relative flex items-end justify-between gap-5">
        <div>
          <p className="text-3xl font-semibold tracking-tight text-white">&lt; 1s</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/40">response latency</p>
        </div>
        <MiniBars values={signalValues} active />
      </div>
      <div className="relative mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-[10px] text-white/45">
        <CircleDot className="h-3.5 w-3.5 text-cyan-300" />
        <span>Streaming across your workspace</span>
        <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-white/35" />
      </div>
    </div>
  );
}

function HeroWorkspacePreview() {
  const [activeTab, setActiveTab] = useState("compose");
  const tabs = [
    { id: "compose", label: "Compose", icon: WandSparkles },
    { id: "research", label: "Research", icon: Search },
    { id: "build", label: "Build", icon: Code2 },
  ];

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-3 shadow-[0_28px_90px_-22px_rgba(14,165,233,.4)] backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,.2),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,.12),transparent_38%)]" />
      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <span className="ml-2 text-[10px] font-medium text-white/40">lexa / workspace / today</span>
          </div>
          <div className="flex items-center gap-2 text-white/30">
            <Settings2 className="h-3.5 w-3.5" />
            <MoreHorizontal className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="grid min-h-[21rem] grid-cols-[5.25rem_1fr] sm:grid-cols-[9.5rem_1fr]">
          <aside className="border-r border-white/10 bg-white/[0.025] p-2 sm:p-3">
            <div className="mb-5 flex items-center gap-2 px-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-300 to-violet-500 text-slate-950">
                <LogoIcon className="h-4 w-4" />
              </div>
              <span className="hidden text-xs font-semibold text-white sm:block">Lexa</span>
            </div>
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[10px] transition-colors",
                      isActive ? "bg-white/10 text-white" : "text-white/35 hover:bg-white/5 hover:text-white/70",
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", isActive && "text-cyan-200")} />
                    <span className="hidden sm:block">{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 hidden space-y-2 sm:block">
              <div className="px-2 text-[8px] font-bold uppercase tracking-[0.2em] text-white/25">Workspace</div>
              {["Launch notes", "Product brief", "Content system"].map((item, index) => (
                <div key={item} className="flex items-center gap-2 px-2 py-1.5 text-[9px] text-white/35">
                  <span className={cn("h-1.5 w-1.5 rounded-full", index === 0 ? "bg-cyan-300" : "bg-white/20")} />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </aside>
          <div className="flex flex-col p-4 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-cyan-200/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  {activeTab === "compose" ? "Creative partner" : activeTab === "research" ? "Research copilot" : "Code intelligence"}
                </div>
                <h3 className="text-lg font-medium tracking-tight text-white sm:text-xl">
                  {activeTab === "compose" ? "Make the idea clearer." : activeTab === "research" ? "Find the signal faster." : "Build with confidence."}
                </h3>
              </div>
              <div className="hidden h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 sm:flex">
                <Sparkles className="h-3.5 w-3.5 text-violet-200" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="max-w-[88%] rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.055] p-3 text-[10px] leading-5 text-white/55">
                {activeTab === "compose" && "Help me turn this rough direction into a sharper product story."}
                {activeTab === "research" && "Compare the strongest signals and give me the source trail."}
                {activeTab === "build" && "Trace this issue from the failing interaction to the cleanest fix."}
              </div>
              <div className="ml-auto max-w-[92%] rounded-2xl rounded-tr-md bg-gradient-to-br from-cyan-300/15 to-violet-400/15 p-3 text-[10px] leading-5 text-white/80 ring-1 ring-white/10">
                {activeTab === "compose" && "I found the core idea. Let’s shape it into a concise narrative with a clear point of view."}
                {activeTab === "research" && "I’ll map the evidence first, then separate verified signals from useful hypotheses."}
                {activeTab === "build" && "I’ll isolate the state transition, explain why it fails, and propose the smallest reliable patch."}
              </div>
              <div className="flex items-center gap-1.5 px-1 pt-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300 [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-300 [animation-delay:240ms]" />
                <span className="ml-1 text-[9px] text-white/30">Thinking with you</span>
              </div>
            </div>
            <div className="mt-auto flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] p-2">
              <Paperclip className="h-3.5 w-3.5 text-white/30" />
              <span className="flex-1 text-[10px] text-white/25">Ask anything, attach context, start moving…</span>
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10">
                <ArrowRight className="h-3 w-3 text-cyan-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSignalCard() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-300 to-cyan-500 text-slate-950">
        <Gauge className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-[10px] font-medium text-white/55">Workspace clarity</span>
          <span className="text-[10px] font-semibold text-emerald-200">+34%</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" />
        </div>
      </div>
    </div>
  );
}

function HeroSection({ onStart }: { onStart: () => void }) {
  const [pointer, setPointer] = useState({ x: 50, y: 40 });
  const [showPreview, setShowPreview] = useState(false);

  const handlePointerMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  const heroVars = {
    "--pointer-x": `${pointer.x}%`,
    "--pointer-y": `${pointer.y}%`,
  } as CSSProperties;

  return (
    <section
      className="relative isolate overflow-hidden bg-slate-950 px-4 pb-20 pt-10 text-white sm:px-6 sm:pb-28 sm:pt-16 lg:pb-32 lg:pt-20"
      onMouseMove={handlePointerMove}
      style={heroVars}
    >
      <AmbientBackdrop dark />
      <GridPattern dark />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70 transition-[background] duration-500"
        style={{
          background: "radial-gradient(42rem circle at var(--pointer-x) var(--pointer-y), rgba(34,211,238,.11), transparent 62%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-white/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
              <LogoIcon className="h-4 w-4 text-cyan-200" />
            </div>
            <span className="hidden sm:inline">About the intelligence layer</span>
            <ChevronRight className="h-3.5 w-3.5 text-white/25" />
            <span className="text-white/75">Lexa</span>
          </div>
          <div className="flex items-center gap-3">
            <StatusDot label="All systems nominal" />
            <div className="hidden h-7 w-px bg-white/10 md:block" />
            <span className="hidden text-[10px] uppercase tracking-[0.16em] text-white/30 md:block">v2.4 / 2026</span>
          </div>
        </div>
        <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
          <div className="max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100">
              <Stars className="h-3.5 w-3.5" />
              <span>Built to think with you</span>
              <span className="h-1 w-1 rounded-full bg-cyan-200" />
              <span className="text-white/40">About Lexa</span>
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.065em] text-white sm:text-7xl lg:text-[6.6rem]">
              Intelligence
              <span className="block bg-gradient-to-r from-cyan-200 via-blue-200 to-violet-300 bg-clip-text text-transparent">with a point</span>
              <span className="block text-white/45">of view.</span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-white/55 sm:text-lg">
              Lexa is a modern intelligence platform that brings conversation, model choice, live research, voice, files, and creative tools into one calm workspace.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <GlassButton variant="light" icon={ArrowRight} onClick={onStart} className="border-cyan-200/20 bg-cyan-200 text-slate-950 hover:bg-cyan-100">
                Start using Lexa
              </GlassButton>
              <GlassButton variant="ghost" icon={Play} onClick={() => setShowPreview((value) => !value)} className="text-white/65 hover:bg-white/10 hover:text-white">
                {showPreview ? "Hide live preview" : "See it in motion"}
              </GlassButton>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="border-l border-white/10 pl-3">
                <p className="text-xl font-semibold tracking-tight text-white">12+</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.13em] text-white/35">model paths</p>
              </div>
              <div className="border-l border-white/10 pl-3">
                <p className="text-xl font-semibold tracking-tight text-white">24/7</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.13em] text-white/35">fresh context</p>
              </div>
              <div className="border-l border-white/10 pl-3">
                <p className="text-xl font-semibold tracking-tight text-white">1</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.13em] text-white/35">unified flow</p>
              </div>
              <div className="border-l border-white/10 pl-3">
                <p className="text-xl font-semibold tracking-tight text-white">∞</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.13em] text-white/35">possibilities</p>
              </div>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-2xl lg:pl-8">
            <div className="absolute -inset-10 rounded-full bg-cyan-400/[0.06] blur-3xl" />
            <div className="relative">
              <NeuralCore />
              <div className="absolute -bottom-4 left-0 w-[14rem] sm:-left-7 sm:w-[17rem]">
                <HeroSignalCard />
              </div>
              <div className="absolute -right-2 top-8 hidden w-[13rem] sm:block sm:w-[15rem]">
                <TelemetryPanel />
              </div>
            </div>
          </div>
        </div>
        {showPreview && (
          <div className="mt-16 grid items-center gap-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 sm:p-6 lg:grid-cols-[0.78fr_1.22fr] lg:p-8">
            <div className="px-2 py-4 sm:px-4">
              <SectionEyebrow icon={Eye}>A glimpse inside</SectionEyebrow>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">One workspace. Many ways forward.</h2>
              <p className="mt-5 text-sm leading-7 text-white/45 sm:text-base">
                The interface is designed to let you move naturally between thinking, researching, creating, and building without abandoning the context that makes your work yours.
              </p>
              <div className="mt-7 flex items-center gap-3 text-xs text-white/45">
                <div className="flex -space-x-2">
                  {["from-cyan-300 to-blue-500", "from-violet-300 to-fuchsia-500", "from-amber-300 to-orange-500"].map((gradient, index) => (
                    <div key={gradient} className={cn("flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 bg-gradient-to-br text-slate-950", gradient)}>
                      {index === 0 && <MessageSquare className="h-3.5 w-3.5" />}
                      {index === 1 && <Search className="h-3.5 w-3.5" />}
                      {index === 2 && <Code2 className="h-3.5 w-3.5" />}
                    </div>
                  ))}
                </div>
                <span>Designed around your flow, not around a feature list.</span>
              </div>
            </div>
            <HeroWorkspacePreview />
          </div>
        )}
      </div>
      <div className="relative z-10 mx-auto mt-20 flex max-w-7xl items-center justify-between border-t border-white/10 pt-5 text-[10px] uppercase tracking-[0.18em] text-white/30">
        <span>Scroll to explore</span>
        <ArrowDown className="h-4 w-4 animate-bounce text-cyan-200/70" />
        <span className="hidden sm:inline">Human context / machine scale</span>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Workspace story components                                                */
/* -------------------------------------------------------------------------- */

function SignalCard({
  number,
  label,
  value,
  detail,
  icon: Icon,
  accent,
}: {
  number: string;
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/70 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/[0.08]">
      <div className={cn("absolute right-0 top-0 h-24 w-24 translate-x-1/3 -translate-y-1/3 rounded-full bg-gradient-to-br opacity-10 blur-2xl transition-opacity group-hover:opacity-30", accent)} />
      <div className="relative flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/80">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/50">{number}</span>
      </div>
      <div className="relative mt-7 text-3xl font-semibold tracking-[-0.05em] text-foreground">{value}</div>
      <div className="relative mt-1 text-xs font-semibold text-foreground/75">{label}</div>
      <p className="relative mt-3 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  );
}

function WorkspaceDiagram() {
  return (
    <div className="relative min-h-[30rem] overflow-hidden rounded-[2.5rem] border border-border/50 bg-slate-950 p-5 text-white shadow-2xl shadow-primary/[0.08] sm:p-8">
      <AmbientBackdrop dark />
      <GridPattern dark />
      <CornerMarks />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/70">The Lexa architecture</p>
          <p className="mt-2 text-sm text-white/50">One context layer, many intelligence paths.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] text-white/45 sm:flex">
          <ServerCog className="h-3 w-3 text-cyan-200" />
          Live orchestration
        </div>
      </div>
      <div className="relative z-10 mx-auto mt-9 max-w-xl">
        <div className="relative grid grid-cols-3 gap-2 text-center sm:gap-3">
          <div className="rounded-2xl border border-cyan-200/20 bg-cyan-200/[0.08] p-3 sm:p-4">
            <MessageSquare className="mx-auto h-4 w-4 text-cyan-200" />
            <span className="mt-2 block text-[9px] font-semibold text-white/70 sm:text-[10px]">Conversation</span>
          </div>
          <div className="rounded-2xl border border-violet-200/20 bg-violet-200/[0.08] p-3 sm:p-4">
            <Paperclip className="mx-auto h-4 w-4 text-violet-200" />
            <span className="mt-2 block text-[9px] font-semibold text-white/70 sm:text-[10px]">Context</span>
          </div>
          <div className="rounded-2xl border border-amber-200/20 bg-amber-200/[0.08] p-3 sm:p-4">
            <Settings2 className="mx-auto h-4 w-4 text-amber-200" />
            <span className="mt-2 block text-[9px] font-semibold text-white/70 sm:text-[10px]">Preferences</span>
          </div>
        </div>
        <div className="mx-auto h-8 w-px bg-gradient-to-b from-cyan-300/50 via-violet-300/50 to-transparent" />
        <div className="relative mx-auto flex w-44 flex-col items-center rounded-[2rem] border border-white/20 bg-white/[0.08] p-5 shadow-[0_0_60px_rgba(34,211,238,.15)] backdrop-blur-xl sm:w-52 sm:p-6">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-300/10 via-transparent to-violet-300/10" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-cyan-300/25 to-violet-400/25">
            <LogoIcon className="h-7 w-7 text-cyan-100" />
          </div>
          <span className="relative mt-3 text-sm font-semibold text-white">Lexa core</span>
          <span className="relative mt-1 text-center text-[9px] leading-4 text-white/40">Understand → route → respond</span>
        </div>
        <div className="mx-auto h-8 w-px bg-gradient-to-b from-transparent via-violet-300/50 to-cyan-300/50" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {[
            { icon: Brain, label: "Reason", color: "text-violet-200", border: "border-violet-200/20", bg: "bg-violet-200/[0.07]" },
            { icon: Search, label: "Research", color: "text-emerald-200", border: "border-emerald-200/20", bg: "bg-emerald-200/[0.07]" },
            { icon: WandSparkles, label: "Create", color: "text-pink-200", border: "border-pink-200/20", bg: "bg-pink-200/[0.07]" },
            { icon: Code2, label: "Build", color: "text-cyan-200", border: "border-cyan-200/20", bg: "bg-cyan-200/[0.07]" },
          ].map(({ icon: Icon, label, color, border, bg }) => (
            <div key={label} className={cn("rounded-2xl border p-3 text-center", border, bg)}>
              <Icon className={cn("mx-auto h-4 w-4", color)} />
              <span className="mt-2 block text-[9px] font-semibold text-white/65">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-10 mt-8 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/30">
        <span className="h-px w-10 bg-white/15" />
        Your workflow stays connected
        <span className="h-px w-10 bg-white/15" />
      </div>
    </div>
  );
}

function VisionSection() {
  return (
    <section id="vision" className="scroll-mt-20 px-4 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <SectionHeading
            eyebrow="What is Lexa?"
            title="An intelligent workspace crafted for modern productivity."
            description="Lexa was created to solve a fundamental problem: professionals should not have to juggle separate services, interfaces, and fragmented context to use the best of AI."
            icon={Command}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SignalCard number="01" icon={Network} value="1" label="connected flow" detail="From thought to finished output." accent="from-cyan-400 to-blue-500" />
            <SignalCard number="02" icon={Cpu} value="12+" label="model paths" detail="The right engine for the task." accent="from-violet-400 to-fuchsia-500" />
            <SignalCard number="03" icon={Globe2} value="24/7" label="fresh context" detail="Live research when it matters." accent="from-emerald-400 to-teal-500" />
            <SignalCard number="04" icon={InfinityIcon} value="∞" label="room to grow" detail="A workspace that compounds." accent="from-orange-400 to-rose-500" />
          </div>
        </div>
        <div className="mt-16 grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div className="space-y-7">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                <MousePointer2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Less switching. More momentum.</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Whether you are drafting a difficult document, debugging a feature, searching live sources, transcribing an idea, or shaping a visual concept, Lexa keeps the work in one connected place.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Context that feels intentional.</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Your instructions, project files, preferences, and decisions remain close to the reasoning trail. The assistant gets more useful because the workspace gets more coherent.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Control without friction.</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Lexa gives you powerful defaults and clear controls. You can choose models, manage memory, inspect sources, and decide how deeply the system should participate.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {["Writing", "Research", "Code", "Voice", "Visuals", "Planning"].map((tag) => (
                <span key={tag} className="rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <WorkspaceDiagram />
        </div>
      </div>
    </section>
  );
}

function InfinityIcon({ className }: { className?: string }) {
  return <span className={cn("text-2xl font-semibold leading-none", className)}>∞</span>;
}

/* -------------------------------------------------------------------------- */
/* Interactive capabilities explorer                                          */
/* -------------------------------------------------------------------------- */

function CapabilityCard({ capability, index, onOpen }: { capability: Capability; index: number; onOpen: () => void }) {
  const Icon = capability.icon;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative flex min-h-[20rem] flex-col overflow-hidden rounded-[1.7rem] border border-border/50 bg-card/75 p-5 text-left transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className={cn("absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br opacity-[0.08] blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-20", capability.accent)} />
      <div className="relative flex items-start justify-between">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", capability.accent, capability.glow)}>
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-all group-hover:border-primary/40 group-hover:text-primary">
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
      <div className="relative mt-7 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-primary/75">
        <span>0{index + 1}</span>
        <span className="h-px w-5 bg-primary/30" />
        <span>{getCategoryLabel(capability.category)}</span>
      </div>
      <h3 className="relative mt-3 text-lg font-semibold tracking-[-0.03em] text-foreground">{capability.title}</h3>
      <p className="relative mt-3 flex-1 text-xs leading-6 text-muted-foreground">{capability.description}</p>
      <div className="relative mt-5 flex flex-wrap gap-1.5">
        {capability.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-muted/60 px-2 py-1 text-[9px] font-medium text-muted-foreground">{tag}</span>
        ))}
      </div>
    </button>
  );
}

function CapabilityDetail({ capability, onClose }: { capability: Capability; onClose: () => void }) {
  const Icon = capability.icon;
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/60 p-3 backdrop-blur-md sm:items-center sm:p-6" onMouseDown={onClose}>
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-[2rem] border border-border/60 bg-background p-6 shadow-2xl sm:p-8" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close capability details" className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-4 pr-10">
          <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-xl", capability.accent)}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{getCategoryLabel(capability.category)}</div>
            <h3 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{capability.title}</h3>
          </div>
        </div>
        <p className="mt-7 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">{capability.description}</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <MetricTile value={capability.metric} label={capability.metricLabel} icon={Gauge} />
          <MetricTile value="1" label="connected workspace" icon={PanelsTopLeft} />
          <MetricTile value="∞" label="ways to apply it" icon={Sparkles} />
        </div>
        <div className="mt-8 rounded-2xl border border-border/50 bg-muted/20 p-5">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Designed to help you</p>
          <div className="space-y-3">
            {capability.bullets.map((bullet) => (
              <div key={bullet} className="flex items-start gap-3 text-sm leading-6 text-foreground/80">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-7 flex flex-wrap gap-2">
          {capability.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-border/60 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground">#{tag.toLowerCase()}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CapabilitiesSection() {
  const [activeFilter, setActiveFilter] = useState<CapabilityCategory>("all");
  const [selectedCapability, setSelectedCapability] = useState<Capability | null>(null);
  const [showAll, setShowAll] = useState(false);
  const filteredCapabilities = useMemo(
    () => activeFilter === "all" ? CAPABILITIES : CAPABILITIES.filter((capability) => capability.category === activeFilter),
    [activeFilter],
  );
  const visibleCapabilities = showAll ? filteredCapabilities : filteredCapabilities.slice(0, 4);

  return (
    <section id="capabilities" className="relative scroll-mt-20 overflow-hidden border-y border-border/40 bg-muted/[0.16] px-4 py-24 sm:px-6 lg:py-32">
      <AmbientBackdrop />
      <GridPattern />
      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Capabilities"
            title="The tools disappear. The momentum stays."
            description="Explore the systems that make Lexa feel less like a collection of features and more like a connected partner for real work."
            icon={Layers3}
          />
          <div className="flex max-w-full flex-wrap gap-2 lg:justify-end">
            {CATEGORY_FILTERS.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filter.id);
                    setShowAll(false);
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive ? "border-foreground bg-foreground text-background shadow-lg" : "border-border/60 bg-background/70 text-muted-foreground hover:border-primary/35 hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visibleCapabilities.map((capability) => {
            const index = CAPABILITIES.findIndex((item) => item.title === capability.title);
            return <CapabilityCard key={capability.title} capability={capability} index={index} onOpen={() => setSelectedCapability(capability)} />;
          })}
        </div>
        <div className="mt-8 flex justify-center">
          {filteredCapabilities.length > 4 && (
            <button type="button" onClick={() => setShowAll((value) => !value)} className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-5 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground">
              {showAll ? "Show fewer systems" : `Explore ${filteredCapabilities.length - 4} more systems`}
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showAll && "rotate-180")} />
            </button>
          )}
        </div>
        <div className="mt-20 grid items-center gap-8 rounded-[2rem] border border-border/50 bg-background/75 p-5 shadow-xl shadow-black/[0.03] backdrop-blur-xl sm:p-8 lg:grid-cols-[1fr_auto]">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><SlidersHorizontal className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-semibold">Your context is the interface.</p>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Lexa adapts to the way you work instead of asking you to adapt to a maze of disconnected tools.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-muted/25 px-4 py-3">
            <div className="flex -space-x-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-cyan-400 text-slate-950"><MessageSquare className="h-3.5 w-3.5" /></span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-violet-400 text-slate-950"><Brain className="h-3.5 w-3.5" /></span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-amber-300 text-slate-950"><Sparkles className="h-3.5 w-3.5" /></span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">One connected system</span>
          </div>
        </div>
      </div>
      {selectedCapability && <CapabilityDetail capability={selectedCapability} onClose={() => setSelectedCapability(null)} />}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Philosophy components                                                      */
/* -------------------------------------------------------------------------- */

function PhilosophyItem({ item, index, isOpen, onToggle }: { item: Philosophy; index: number; isOpen: boolean; onToggle: () => void }) {
  const Icon = item.icon;
  return (
    <div className={cn("group relative overflow-hidden rounded-3xl border transition-all duration-500", isOpen ? "border-primary/35 bg-card shadow-xl shadow-primary/[0.06]" : "border-border/50 bg-card/55 hover:border-primary/20")}>
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-4 p-5 text-left sm:p-6">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-500", item.accent, isOpen && "scale-105 rotate-3")}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.22em] text-primary/70">Principle {item.number}</div>
          <h3 className="truncate text-base font-semibold tracking-[-0.02em] sm:text-lg">{item.title}</h3>
        </div>
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-all", isOpen && "rotate-180 border-primary/30 bg-primary/10 text-primary")}>
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>
      <div className={cn("grid transition-[grid-template-rows,opacity] duration-500", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="px-5 pb-6 pl-20 sm:px-6 sm:pb-7 sm:pl-[6.2rem]">
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">{item.description}</p>
            <div className="mt-4 flex items-start gap-2 border-l-2 border-primary/30 pl-3 text-xs leading-6 text-muted-foreground/80">
              <Sparkles className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{item.detail}</span>
            </div>
          </div>
        </div>
      </div>
      <span className={cn("pointer-events-none absolute bottom-0 left-0 h-0.5 bg-gradient-to-r transition-all duration-700", item.accent, isOpen ? "w-full" : "w-0 group-hover:w-1/2")} />
    </div>
  );
}

function PrinciplesSection() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <section id="principles" className="scroll-mt-20 px-4 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <SectionHeading
              eyebrow="Why Lexa?"
              title="Calm by design. Capable by default."
              description="We build with clarity, privacy, and long-term utility in mind. The product should feel considered before it feels impressive."
              icon={Lightbulb}
            />
            <div className="mt-10 hidden rounded-3xl border border-border/50 bg-muted/20 p-5 lg:block">
              <div className="mb-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                <span>Design signal</span>
                <span className="text-emerald-500">Healthy</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-xs"><span className="text-muted-foreground">Clarity</span><span className="font-medium">94</span></div>
                  <ProgressLine value={94} color="bg-gradient-to-r from-cyan-400 to-blue-500" />
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-xs"><span className="text-muted-foreground">Control</span><span className="font-medium">97</span></div>
                  <ProgressLine value={97} color="bg-gradient-to-r from-violet-400 to-fuchsia-500" />
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-xs"><span className="text-muted-foreground">Utility</span><span className="font-medium">91</span></div>
                  <ProgressLine value={91} color="bg-gradient-to-r from-emerald-400 to-teal-500" />
                </div>
              </div>
              <p className="mt-5 border-t border-border/50 pt-4 text-xs leading-5 text-muted-foreground">A good AI product should leave you with more agency, not more settings to manage.</p>
            </div>
          </div>
          <div className="space-y-3">
            {PHILOSOPHIES.map((item, index) => (
              <PhilosophyItem key={item.title} item={item} index={index} isOpen={openIndex === index} onToggle={() => setOpenIndex(openIndex === index ? -1 : index)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Story and timeline                                                         */
/* -------------------------------------------------------------------------- */

function TimelineSection() {
  const [activeItem, setActiveItem] = useState(2);
  return (
    <section className="relative overflow-hidden bg-slate-950 px-4 py-24 text-white sm:px-6 lg:py-32">
      <AmbientBackdrop dark />
      <GridPattern dark />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
          <div>
            <SectionEyebrow icon={Orbit}>The journey</SectionEyebrow>
            <h2 className="max-w-lg text-3xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">From scattered tools to shared context.</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/45 sm:text-base">Lexa is an ongoing exploration of what becomes possible when intelligence is designed around the human workflow rather than placed beside it.</p>
            <div className="mt-9 flex items-center gap-3 text-xs text-white/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-200/10"><CircleDot className="h-4 w-4 text-cyan-200" /></div>
              <span>Always learning. Always becoming more useful.</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-cyan-300/60 via-violet-300/40 to-white/5 sm:left-6" />
            <div className="space-y-3">
              {TIMELINE.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeItem === index;
                return (
                  <button key={item.year} type="button" onClick={() => setActiveItem(index)} className={cn("group relative flex w-full items-start gap-4 rounded-3xl p-3 text-left transition-all duration-500 sm:gap-5 sm:p-4", isActive ? "bg-white/[0.07]" : "hover:bg-white/[0.035]")}>
                    <span className={cn("relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-500 sm:h-12 sm:w-12", isActive ? "border-cyan-200/50 bg-cyan-200 text-slate-950 shadow-[0_0_24px_rgba(103,232,249,.28)]" : "border-white/15 bg-slate-950 text-white/35 group-hover:border-white/30 group-hover:text-white/60")}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                    <span className="min-w-0 flex-1 pt-1">
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className={cn("text-[10px] font-bold uppercase tracking-[0.2em]", isActive ? "text-cyan-200" : "text-white/30")}>Phase {item.year}</span>
                        {item.status === "current" && <StatusDot label="Now" />}
                      </span>
                      <span className={cn("mt-2 block text-base font-semibold tracking-[-0.02em] sm:text-lg", isActive ? "text-white" : "text-white/60")}>{item.title}</span>
                      <span className={cn("grid transition-[grid-template-rows,opacity] duration-500", isActive ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                        <span className="overflow-hidden text-sm leading-6 text-white/45">{item.description}</span>
                      </span>
                    </span>
                    <ChevronRight className={cn("mt-2 h-4 w-4 shrink-0 transition-all", isActive ? "translate-x-0 text-cyan-200" : "-translate-x-1 text-white/20 group-hover:translate-x-0 group-hover:text-white/50")} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuotePanel() {
  return (
    <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:py-28">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-gradient-to-br from-primary/[0.09] via-background to-violet-500/[0.08] p-7 text-center sm:p-12 lg:p-16">
        <div className="absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background shadow-xl"><Sparkles className="h-5 w-5" /></div>
          <blockquote className="mt-7 text-2xl font-medium leading-tight tracking-[-0.04em] text-foreground sm:text-4xl lg:text-5xl">“The best interface is the one that lets your thinking stay in motion.”</blockquote>
          <div className="mt-7 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"><span className="h-px w-8 bg-border" /><span>Lexa design principle</span><span className="h-px w-8 bg-border" /></div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reliability section                                                        */
/* -------------------------------------------------------------------------- */

function ReliabilityCard({ icon: Icon, label, title, description, value, color }: { icon: LucideIcon; label: string; title: string; description: string; value: string; color: string }) {
  return (
    <div className="group rounded-3xl border border-border/50 bg-background/75 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/[0.06] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", color)}><Icon className="h-5 w-5" /></div>
        <span className="text-2xl font-semibold tracking-[-0.05em] text-foreground">{value}</span>
      </div>
      <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{label}</p>
      <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
      <div className="mt-5 flex items-center gap-2 text-[10px] font-medium text-emerald-500"><Check className="h-3.5 w-3.5" /> Built into the flow</div>
    </div>
  );
}

function ReliabilitySection() {
  const [activeLayer, setActiveLayer] = useState("privacy");
  const layers = [
    { id: "privacy", label: "Privacy", icon: LockKeyhole, detail: "Understandable controls for history, memory, files, and model preferences." },
    { id: "routing", label: "Routing", icon: Waypoints, detail: "A clear path between your task and the intelligence profile best suited to it." },
    { id: "access", label: "Access", icon: KeyRound, detail: "The right context stays available without making you repeat yourself." },
  ];

  return (
    <section className="relative overflow-hidden border-y border-border/40 bg-muted/[0.14] px-4 py-24 sm:px-6 lg:py-32">
      <AmbientBackdrop />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <SectionHeading eyebrow="Reliability & trust" title="Powerful should still feel dependable." description="Lexa is designed around secure data handling, non-intrusive memory management, and infrastructure that keeps the experience responsive as your work grows." icon={ShieldCheck} />
          <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-background/70 px-4 py-3 text-xs text-muted-foreground shadow-sm"><ShieldCheck className="h-4 w-4 text-emerald-500" /><span>Trust is a product feature.</span></div>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <ReliabilityCard icon={ShieldCheck} label="Data posture" title="Privacy by intention" description="Controls are placed where they matter, so your context remains yours to direct." value="01" color="from-emerald-400 to-teal-500" />
          <ReliabilityCard icon={Timer} label="Performance" title="Low-latency by design" description="Streaming, routing, and focused surfaces help you stay inside the work." value="02" color="from-cyan-400 to-blue-500" />
          <ReliabilityCard icon={Database} label="Context" title="Memory you can shape" description="Project rules and preferences remain visible, editable, and purpose-driven." value="03" color="from-violet-400 to-fuchsia-500" />
          <ReliabilityCard icon={Eye} label="Transparency" title="Sources that stay close" description="Research is more useful when the path from claim to source remains legible." value="04" color="from-orange-400 to-rose-500" />
        </div>
        <div className="mt-14 grid gap-6 rounded-[2rem] border border-border/50 bg-background/75 p-5 shadow-xl shadow-black/[0.03] sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Trust layers</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">More power. More legibility.</h3>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">The system should help you understand what is happening, why it is happening, and how to change it.</p>
            <div className="mt-7 space-y-2">
              {layers.map((layer) => {
                const Icon = layer.icon;
                const isActive = activeLayer === layer.id;
                return (
                  <button key={layer.id} type="button" onClick={() => setActiveLayer(layer.id)} className={cn("flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all", isActive ? "border-primary/30 bg-primary/[0.07]" : "border-transparent hover:border-border/60 hover:bg-muted/30")}>
                    <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}><Icon className="h-4 w-4" /></span>
                    <span className={cn("text-sm font-semibold", isActive ? "text-foreground" : "text-muted-foreground")}>{layer.label}</span>
                    <ChevronRight className={cn("ml-auto h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground/30")} />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-slate-950 p-6 text-white sm:p-8">
            <GridPattern dark />
            <CornerMarks />
            <div className="relative z-10 flex h-full min-h-[17rem] flex-col justify-between">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40"><Activity className="h-3.5 w-3.5 text-cyan-200" /> System readout</div><StatusDot label="Active" /></div>
              <div>
                <div className="mb-4 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-200/10"><ShieldCheck className="h-5 w-5 text-cyan-200" /></div><div><p className="text-lg font-semibold">{layers.find((layer) => layer.id === activeLayer)?.label} layer</p><p className="text-xs text-white/40">Configured for your workspace</p></div></div>
                <p className="max-w-lg text-sm leading-7 text-white/55">{layers.find((layer) => layer.id === activeLayer)?.detail}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-5"><div><p className="text-lg font-semibold text-white">100%</p><p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/35">visible</p></div><div><p className="text-lg font-semibold text-white">0</p><p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/35">guesswork</p></div><div><p className="text-lg font-semibold text-white">∞</p><p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/35">control</p></div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* FAQ and final CTA                                                          */
/* -------------------------------------------------------------------------- */

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-20 px-4 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <SectionHeading align="center" eyebrow="Questions, answered" title="A clearer way to understand Lexa." description="A few useful answers before you open the workspace and make it your own." icon={MessageSquare} />
        <div className="mt-12 overflow-hidden rounded-[2rem] border border-border/50 bg-card/60 shadow-xl shadow-black/[0.03]">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question} className={cn("border-b border-border/50 last:border-b-0", isOpen && "bg-muted/[0.22]")}>
                <button type="button" onClick={() => setOpenIndex(isOpen ? null : index)} className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-7 sm:py-6">
                  <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-all", isOpen ? "border-primary bg-primary text-primary-foreground" : "border-border/60 text-muted-foreground")}>{String(index + 1).padStart(2, "0")}</span>
                  <span className="flex-1 text-sm font-semibold tracking-[-0.01em] sm:text-base">{faq.question}</span>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180 text-primary")} />
                </button>
                <div className={cn("grid transition-[grid-template-rows,opacity] duration-500", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                  <div className="overflow-hidden"><p className="px-5 pb-6 pl-16 text-sm leading-7 text-muted-foreground sm:px-7 sm:pb-7 sm:pl-[5.75rem]">{faq.answer}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ onStart }: { onStart: () => void }) {
  return (
    <section className="px-4 pb-24 pt-4 sm:px-6 lg:pb-32">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-slate-950 px-6 py-16 text-white shadow-2xl shadow-primary/[0.13] sm:px-12 sm:py-20 lg:px-20 lg:py-24">
        <AmbientBackdrop dark />
        <GridPattern dark />
        <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <SectionEyebrow icon={Rocket}>Your next workspace</SectionEyebrow>
            <h2 className="text-4xl font-semibold leading-[1.04] tracking-[-0.06em] text-white sm:text-6xl">Make room for better thinking.</h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/50 sm:text-lg">Bring your ideas, questions, files, and unfinished work. Lexa gives them a connected place to become something clearer.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><GlassButton variant="light" icon={ArrowRight} onClick={onStart} className="bg-white text-slate-950 hover:bg-cyan-100">Start building free</GlassButton><GlassButton variant="ghost" icon={ArrowUpRight} onClick={() => scrollToSection("vision")} className="text-white/60 hover:bg-white/10 hover:text-white">Explore the vision</GlassButton></div>
          </div>
          <div className="relative mx-auto h-56 w-56 sm:h-64 sm:w-64"><div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-3xl" /><div className="absolute inset-7 rounded-full border border-cyan-200/20" /><div className="absolute inset-14 rounded-full border border-violet-200/20" /><div className="absolute inset-[4.25rem] flex items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 shadow-[0_0_80px_rgba(34,211,238,.2)] backdrop-blur-xl"><LogoIcon className="h-12 w-12 text-cyan-100" /></div><span className="absolute left-4 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-cyan-200 shadow-[0_0_20px_6px_rgba(103,232,249,.45)]" /><span className="absolute right-4 top-1/3 h-1.5 w-1.5 rounded-full bg-fuchsia-200 shadow-[0_0_18px_5px_rgba(240,171,252,.4)]" /><span className="absolute bottom-7 left-1/3 h-1.5 w-1.5 rounded-full bg-amber-200 shadow-[0_0_18px_5px_rgba(253,230,138,.35)]" /></div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

function AboutNavigation({ activeSection, onNavigate }: { activeSection: string; onNavigate: (target: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sticky top-0 z-40 border-b border-border/40 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-tight"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background"><LogoIcon className="h-4 w-4" /></span><span className="hidden sm:inline">The Lexa perspective</span></div>
        <div className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => <button key={item.target} type="button" onClick={() => onNavigate(item.target)} className={cn("rounded-full px-3.5 py-2 text-[11px] font-semibold transition-colors", activeSection === item.target ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>{item.label}</button>)}
        </div>
        <button type="button" aria-label="Toggle section navigation" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden">{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
      </div>
      <div className={cn("mx-auto max-w-7xl overflow-hidden transition-[max-height,opacity] duration-300 md:hidden", open ? "max-h-64 pb-3 opacity-100" : "max-h-0 opacity-0")}>
        <div className="grid gap-1 rounded-2xl border border-border/50 bg-muted/30 p-2">
          {NAV_ITEMS.map((item) => <button key={item.target} type="button" onClick={() => { onNavigate(item.target); setOpen(false); }} className={cn("rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-colors", activeSection === item.target ? "bg-foreground text-background" : "text-muted-foreground hover:bg-background hover:text-foreground")}>{item.label}</button>)}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main page                                                                  */
/* -------------------------------------------------------------------------- */

export default function About() {
  useSEO({
    title: "About Lexa AI | Your AI Assistant",
    description: "Learn about Lexa AI, an intelligent virtual assistant designed for professionals. Bringing advanced AI models, web search, voice, and productivity into one unified workspace.",
    canonicalUrl: "/about",
  });

  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("vision");
  const [showTopButton, setShowTopButton] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = ["vision", "capabilities", "principles", "faq"]
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    const handleScroll = () => {
      const viewportAnchor = window.scrollY + window.innerHeight * 0.28;
      let current = sections[0]?.id ?? "vision";
      sections.forEach((section) => {
        if (section.offsetTop <= viewportAnchor) current = section.id;
      });
      setActiveSection(current);
      setShowTopButton(window.scrollY > 720);
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = documentHeight > 0 ? (window.scrollY / documentHeight) * 100 : 0;
      if (progressRef.current) progressRef.current.style.width = `${progress}%`;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openAuth = () => navigate("/chat");

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 selection:text-foreground">
      <div ref={progressRef} className="fixed left-0 top-0 z-[70] h-0.5 w-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 transition-[width] duration-150" />
      <NoiseOverlay />
      <PublicNavbar />
      <AboutNavigation activeSection={activeSection} onNavigate={scrollToSection} />
      <main>
        <HeroSection onStart={openAuth} />
        <VisionSection />
        <CapabilitiesSection />
        <PrinciplesSection />
        <TimelineSection />
        <QuotePanel />
        <ReliabilitySection />
        <FAQSection />
        <FinalCTA onStart={openAuth} />
      </main>
      <PublicFooter />
      <button type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className={cn("fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-background/85 text-muted-foreground shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", showTopButton ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0")}>
        <ArrowDown className="h-4 w-4 rotate-180" />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Optional local visual vocabulary                                           */
/* -------------------------------------------------------------------------- */

export function AboutStatusPill({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.17em] text-muted-foreground backdrop-blur-md">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {children}
    </span>
  );
}

export function AboutDivider() {
  return <div aria-hidden="true" className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />;
}

export function AboutKicker({ icon: Icon = Sparkles, children }: { icon?: LucideIcon; children: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </div>
  );
}

export function AboutCodeSnippet() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-slate-950 p-4 font-mono text-[10px] leading-6 text-white/60 shadow-xl">
      <div className="mb-4 flex items-center gap-1.5 border-b border-white/10 pb-3"><span className="h-2 w-2 rounded-full bg-rose-400/70" /><span className="h-2 w-2 rounded-full bg-amber-300/70" /><span className="h-2 w-2 rounded-full bg-emerald-400/70" /><span className="ml-2 text-white/25">context.ts</span></div>
      <div><span className="text-violet-300">const</span> <span className="text-cyan-200">workspace</span> <span className="text-white/40">=</span> <span className="text-amber-200">await</span> <span className="text-emerald-200">lexa</span><span className="text-white/40">.</span><span className="text-cyan-200">understand</span><span className="text-white/40">({"{"}</span></div>
      <div className="pl-5"><span className="text-white/40">intent:</span> <span className="text-pink-200">“make this clearer”</span><span className="text-white/40">,</span></div>
      <div className="pl-5"><span className="text-white/40">context:</span> <span className="text-cyan-200">attachedFiles</span><span className="text-white/40">,</span></div>
      <div className="pl-5"><span className="text-white/40">style:</span> <span className="text-pink-200">“direct, useful, human”</span></div>
      <div><span className="text-white/40">{"}"});</span></div>
      <div className="mt-3 text-emerald-200/75"><span className="text-white/30">// </span>signal found · next step ready</div>
    </div>
  );
}

export function AboutFeatureRow({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/40 bg-background/60 p-4 transition-all hover:border-primary/30 hover:bg-background">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
      <div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{children}</p></div>
    </div>
  );
}

export function AboutMetricStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MetricTile icon={Zap} value="&lt; 1s" label="fast response" />
      <MetricTile icon={Network} value="12+" label="model paths" />
      <MetricTile icon={Globe2} value="Live" label="web context" />
      <MetricTile icon={Users} value="1" label="shared workspace" />
    </div>
  );
}

export function AboutPulse() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 text-xs text-emerald-700 dark:text-emerald-300">
      <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" /></span>
      <span className="font-medium">Lexa is ready for the next question.</span>
      <Activity className="ml-auto h-4 w-4 opacity-70" />
    </div>
  );
}

export function AboutFooterLink({ href, children }: { href: string; children: string }) {
  return <Link to={href} className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">{children}<ArrowUpRight className="h-3 w-3" /></Link>;
}

export function AboutTagCloud() {
  const tags = ["Context-aware", "Multimodal", "Live search", "Workspace memory", "Voice ready", "Model choice", "File intelligence", "Human-centered"];
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => <span key={tag} className={cn("rounded-full border px-3 py-1.5 text-[10px] font-medium transition-transform hover:-translate-y-0.5", index % 3 === 0 ? "border-cyan-500/20 bg-cyan-500/[0.06] text-cyan-700 dark:text-cyan-300" : index % 3 === 1 ? "border-violet-500/20 bg-violet-500/[0.06] text-violet-700 dark:text-violet-300" : "border-border/60 bg-muted/30 text-muted-foreground")}>{tag}</span>)}
    </div>
  );
}

export function AboutEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Sparkles className="h-5 w-5" /></div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

export function AboutLoadingSkeleton() {
  return (
    <div className="space-y-4 rounded-3xl border border-border/50 bg-card/60 p-6">
      <div className="flex items-center gap-3"><ShimmerLine className="h-10 w-10 rounded-2xl" /><div className="flex-1 space-y-2"><ShimmerLine className="w-1/3" /><ShimmerLine className="w-1/2" /></div></div>
      <ShimmerLine className="h-4 w-full" /><ShimmerLine className="h-4 w-4/5" /><ShimmerLine className="mt-4 h-20 w-full rounded-2xl" />
    </div>
  );
}

export function AboutInlineNotice({ icon: Icon = CheckCircle2, children }: { icon?: LucideIcon; children: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{children}</span></div>
  );
}

export function AboutActionCard({ icon: Icon, title, description, action, onClick }: { icon: LucideIcon; title: string; description: string; action: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group flex w-full items-start gap-4 rounded-3xl border border-border/50 bg-card/60 p-5 text-left transition-all hover:-translate-y-1 hover:border-primary/30 hover:bg-card hover:shadow-xl">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span><span className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">{action}<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" /></span></span>
    </button>
  );
}

export function AboutModelBadge({ name, icon: Icon = Cpu, tone = "cyan" }: { name: string; icon?: LucideIcon; tone?: "cyan" | "violet" | "emerald" }) {
  const toneClass = tone === "cyan" ? "border-cyan-500/20 bg-cyan-500/[0.06] text-cyan-700 dark:text-cyan-300" : tone === "violet" ? "border-violet-500/20 bg-violet-500/[0.06] text-violet-700 dark:text-violet-300" : "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-700 dark:text-emerald-300";
  return <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold", toneClass)}><Icon className="h-3.5 w-3.5" />{name}</span>;
}

export function AboutCodeCapability() {
  return (
    <div className="rounded-3xl border border-border/50 bg-card/70 p-5 sm:p-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold"><TerminalSquare className="h-4 w-4 text-primary" />Code intelligence</div><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-300">Ready</span></div>
      <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 font-mono text-[10px] leading-5"><span className="text-muted-foreground/50">01</span><span><span className="text-violet-500 dark:text-violet-300">function</span> <span className="text-cyan-600 dark:text-cyan-200">clarify</span><span className="text-foreground/40">(</span><span className="text-amber-600 dark:text-amber-200">idea</span><span className="text-foreground/40">) {"{"}</span></span><span className="text-muted-foreground/50">02</span><span className="pl-3 text-muted-foreground">return <span className="text-emerald-600 dark:text-emerald-200">lexa</span><span className="text-foreground/40">.</span><span className="text-cyan-600 dark:text-cyan-200">makeUseful</span><span className="text-foreground/40">(idea);</span></span><span className="text-muted-foreground/50">03</span><span className="text-foreground/40">{"}"}</span></div>
      <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4 text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><CheckCheck className="h-3.5 w-3.5 text-emerald-500" />No black box required</span><Braces className="h-4 w-4 opacity-50" /></div>
    </div>
  );
}

export function AboutResearchCapability() {
  return (
    <div className="rounded-3xl border border-border/50 bg-card/70 p-5 sm:p-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold"><Search className="h-4 w-4 text-primary" />Research mode</div><span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Live</span></div>
      <div className="mt-5 space-y-2"><div className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/20 p-3"><Globe2 className="h-4 w-4 text-emerald-500" /><span className="flex-1 text-xs text-muted-foreground">Signals from the live web</span><span className="text-[10px] font-semibold text-emerald-500">84%</span></div><div className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/20 p-3"><FileText className="h-4 w-4 text-violet-500" /><span className="flex-1 text-xs text-muted-foreground">Sources organized</span><Check className="h-3.5 w-3.5 text-emerald-500" /></div><div className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/20 p-3"><Sparkles className="h-4 w-4 text-amber-500" /><span className="flex-1 text-xs text-muted-foreground">Synthesis ready</span><ArrowRight className="h-3.5 w-3.5 text-primary" /></div></div>
    </div>
  );
}

export function AboutCreativeCapability() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-slate-950 p-5 text-white sm:p-6">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-pink-400/20 blur-3xl" /><div className="absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-violet-400/20 blur-3xl" />
      <div className="relative flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold"><ImageIcon className="h-4 w-4 text-pink-200" />Visual studio</div><WandSparkles className="h-4 w-4 text-pink-200/60" /></div>
      <div className="relative mt-5 grid grid-cols-3 gap-2"><div className="aspect-square rounded-2xl bg-gradient-to-br from-pink-300/70 via-violet-400/50 to-slate-900" /><div className="aspect-square rounded-2xl bg-gradient-to-br from-cyan-300/60 via-blue-500/50 to-slate-900" /><div className="aspect-square rounded-2xl bg-gradient-to-br from-amber-200/70 via-orange-400/50 to-slate-900" /></div>
      <div className="relative mt-5 flex items-center justify-between text-[10px] text-white/45"><span>Prompt → visual direction</span><ArrowUpRight className="h-3.5 w-3.5 text-pink-200" /></div>
    </div>
  );
}

export function AboutVoiceCapability() {
  const bars = [18, 34, 48, 35, 72, 56, 88, 64, 45, 69, 82, 42, 31, 57, 75, 44, 28];
  return (
    <div className="rounded-3xl border border-border/50 bg-card/70 p-5 sm:p-6">
      <div className="flex items-center gap-2 text-sm font-semibold"><Headphones className="h-4 w-4 text-primary" />Voice when your hands are full</div>
      <div className="mt-7 flex h-16 items-center justify-center gap-1.5">{bars.map((bar, index) => <span key={index} className="w-1.5 rounded-full bg-gradient-to-t from-orange-400 to-rose-400 transition-all duration-500 hover:scale-y-125" style={{ height: `${bar}%` }} />)}</div>
      <div className="mt-6 flex items-center gap-3 border-t border-border/50 pt-4"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"><Mic2 className="h-3.5 w-3.5" /></div><span className="flex-1 text-xs text-muted-foreground">Speak naturally. Shape later.</span><span className="text-[10px] font-semibold text-primary">00:32</span></div>
    </div>
  );
}

export function AboutPrincipleLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-medium text-muted-foreground"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-cyan-400" />Human context</span><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-violet-400" />Machine scale</span><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" />User control</span></div>
  );
}

export function AboutNavigationHint() {
  return <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.17em] text-muted-foreground/60"><ArrowDown className="h-3.5 w-3.5" />Keep exploring the system</div>;
}

export function AboutSourceBadge({ source }: { source: string }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/25 px-2.5 py-1 text-[9px] text-muted-foreground"><Globe2 className="h-3 w-3 text-emerald-500" />{source}<Check className="h-3 w-3 text-emerald-500" /></span>;
}

export function AboutProgressCard({ title, value, status }: { title: string; value: number; status: string }) {
  return <div className="rounded-2xl border border-border/50 bg-background/70 p-4"><div className="flex items-center justify-between text-xs"><span className="font-semibold">{title}</span><span className="text-muted-foreground">{status}</span></div><div className="mt-3"><ProgressLine value={value} color="bg-gradient-to-r from-cyan-400 to-violet-500" /></div></div>;
}

export function AboutWorkspacePill({ icon: Icon, children }: { icon: LucideIcon; children: string }) {
  return <span className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-background/70 px-3 py-2 text-[10px] font-medium text-muted-foreground"><Icon className="h-3.5 w-3.5 text-primary" />{children}</span>;
}

export function AboutLayerStack() {
  return (
    <div className="relative h-52 overflow-hidden rounded-3xl border border-border/50 bg-slate-950 p-5 text-white">
      <GridPattern dark />
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Context layers</span>
        <Layers3 className="h-4 w-4 text-cyan-200" />
      </div>
      <div className="relative z-10 mt-7 space-y-2">
        <div className="flex items-center justify-between rounded-xl border border-cyan-200/20 bg-cyan-200/10 px-3 py-2 text-xs"><span>Live conversation</span><span className="text-cyan-200">01</span></div>
        <div className="flex items-center justify-between rounded-xl border border-violet-200/20 bg-violet-200/10 px-3 py-2 text-xs"><span>Workspace memory</span><span className="text-violet-200">02</span></div>
        <div className="flex items-center justify-between rounded-xl border border-emerald-200/20 bg-emerald-200/10 px-3 py-2 text-xs"><span>Your control</span><span className="text-emerald-200">03</span></div>
      </div>
    </div>
  );
}
