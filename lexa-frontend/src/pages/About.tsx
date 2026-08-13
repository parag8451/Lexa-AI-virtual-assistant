import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight, MessageSquare, Globe, Mic, Brain,
  Image as ImageIcon, Code2, Sparkles, Shield, Cpu, Zap, Layers, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function About() {
  useSEO({
    title: "About Lexa AI | Your AI Assistant",
    description: "Learn about Lexa AI, an intelligent virtual assistant designed for professionals. Bringing advanced AI models, web search, voice, and productivity into one unified workspace.",
    canonicalUrl: "/about",
  });

  const navigate = useNavigate();

  const CAPABILITIES = [
    {
      icon: MessageSquare,
      title: "Multimodal AI Conversations",
      description: "Fluid, context-aware dialogue that retains conversation context and adapts to complex inquiries with logical reasoning."
    },
    {
      icon: Cpu,
      title: "Multi-Model Orchestration",
      description: "Switch seamlessly between OpenAI GPT-4o, Google Gemini 1.5 Pro, Anthropic Claude 3.5 Sonnet, and custom models in one interface."
    },
    {
      icon: Globe,
      title: "Real-Time Web Search",
      description: "Live internet access for up-to-date facts, research synthesis, and verified citations directly within your chats."
    },
    {
      icon: Mic,
      title: "Voice AI & Speech Synthesis",
      description: "Natural hands-free voice interactions with rapid speech-to-text transcription and crisp audio playback."
    },
    {
      icon: ImageIcon,
      title: "Image & Video Generation",
      description: "Generate high-resolution visual art with DALL-E 3 and cinematic video clips directly from simple text prompts."
    },
    {
      icon: Brain,
      title: "Personalized Memory & Workspaces",
      description: "Configurable user instructions and project-level workspaces that align the AI with your personal workflow."
    },
    {
      icon: Code2,
      title: "Full-Stack Code Intelligence",
      description: "Write, analyze, debug, and explain code snippets with syntax highlighting and step-by-step logic."
    },
    {
      icon: Layers,
      title: "Document & File Analysis",
      description: "Attach code files, images, PDFs, or spreadsheets for immediate summarization and data extraction."
    }
  ];

  const PHILOSOPHIES = [
    {
      title: "Model Choice & Freedom",
      description: "Instead of locking you into a single proprietary model, Lexa brings the world's most capable AI engines into one cohesive workspace."
    },
    {
      title: "Thoughtful Simplicity",
      description: "Powerful AI capabilities shouldn't require complex configurations. Lexa provides an intuitive interface focused on your flow state."
    },
    {
      title: "User Control & Privacy",
      description: "You maintain control over your conversation history, uploaded files, model preferences, and personal memory settings."
    },
    {
      title: "Practical Daily Assistance",
      description: "Built for tangible work—writing, researching, coding, brainstorming, and automation—without gimmick features."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      <PublicNavbar />

      <main className="flex-1">
        {/* ──────── Hero Section ──────── */}
        <section className="relative pt-24 pb-20 px-4 md:px-6 overflow-hidden border-b border-border/20 bg-gradient-to-b from-muted/20 via-background to-background">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-muted/40 backdrop-blur-md text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground">The Vision Behind Lexa</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground leading-[1.1]">
              Meet Lexa — Your AI, <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                Built to Think With You
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto mb-10 leading-relaxed">
              Lexa AI is a modern intelligence platform designed to bring together the world's top language models, web search, voice, and multimodal tools into a unified, distraction-free environment.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="w-full sm:w-auto h-13 px-8 text-base rounded-full font-medium shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95"
              >
                Start Using Lexa <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('what-is-lexa')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto h-13 px-8 text-base rounded-full border-border/60"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* ──────── What is Lexa? ──────── */}
        <section id="what-is-lexa" className="py-24 px-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">What is Lexa?</span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                An intelligent workspace crafted for modern productivity.
              </h2>
              <p className="text-muted-foreground leading-relaxed font-light">
                Lexa AI was created to solve a fundamental problem: professionals today often have to juggle multiple separate subscription services, different interfaces, and fragmented conversation histories to leverage top AI tools.
              </p>
              <p className="text-muted-foreground leading-relaxed font-light">
                Whether you need to draft complex documents, debug code in real-time, search live web sources, transcribe voice ideas, or generate visual media, Lexa integrates all these workflows into a single interface.
              </p>
              <div className="space-y-3 pt-2">
                {[
                  "Unified access to OpenAI, Google, and Anthropic models",
                  "Built-in real-time web research & verified citations",
                  "Seamless document, code file, and image analysis",
                  "Persistent memory tailored to your workspace rules"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm font-medium text-foreground/90">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-8 rounded-[2.5rem] border border-border/40 bg-gradient-to-br from-card via-muted/10 to-background shadow-xl space-y-6">
                <div className="flex items-center gap-4 pb-4 border-b border-border/40">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Lexa Engine Overview</h3>
                    <p className="text-xs text-muted-foreground">High-performance AI Orchestration</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed font-light">
                  <p>
                    By maintaining low-latency model routing, structured memory stores, and real-time streaming sockets, Lexa delivers lightning-fast responses while giving you full control over parameters and model selection.
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-background border border-border/40">
                      <div className="text-2xl font-bold text-foreground">Multi-Model</div>
                      <div className="text-xs text-muted-foreground">GPT-4o, Gemini 1.5, Claude</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-background border border-border/40">
                      <div className="text-2xl font-bold text-foreground">&lt; 1s</div>
                      <div className="text-xs text-muted-foreground">Response latency</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────── Why Lexa? (Product Philosophy) ──────── */}
        <section className="py-24 px-4 bg-muted/20 border-y border-border/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Why Lexa?</span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2 mb-4">
                Our Core Principles
              </h2>
              <p className="text-muted-foreground font-light">
                We build features with clarity, privacy, and long-term utility in mind.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {PHILOSOPHIES.map((item, idx) => (
                <div key={idx} className="p-8 rounded-3xl border border-border/40 bg-background shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary font-bold">
                    0{idx + 1}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground font-light leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────── Product Capabilities Overview ──────── */}
        <section className="py-24 px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Capabilities</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2 mb-4">
              Everything Implemented in Lexa
            </h2>
            <p className="text-muted-foreground font-light">
              Explore the full toolset available directly within your dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CAPABILITIES.map((cap, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-border/40 bg-card hover:bg-muted/20 transition-all flex flex-col h-full">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <cap.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-base mb-2">{cap.title}</h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed flex-1">{cap.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ──────── Product & Engineering Focus ──────── */}
        <section className="py-20 px-4 bg-muted/10 border-t border-border/20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Shield className="w-10 h-10 text-primary mx-auto opacity-80" />
            <h2 className="text-3xl font-bold tracking-tight">Built for Reliability & Trust</h2>
            <p className="text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
              Lexa AI is designed around secure data handling, non-intrusive memory management, and scalable API infrastructure. We continually optimize response times, model routing accuracy, and UI accessibility.
            </p>
          </div>
        </section>

        {/* ──────── Final CTA ──────── */}
        <section className="py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-[3rem] bg-foreground text-background p-12 md:p-16 text-center overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                  Experience Lexa Today
                </h2>
                <p className="text-background/70 text-lg font-light mb-8 max-w-xl mx-auto">
                  Unlock access to top-tier AI models and productivity tools in one seamless interface.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-background text-foreground hover:bg-background/90 h-13 px-8 rounded-full text-base font-semibold shadow-xl transition-transform active:scale-95"
                >
                  Start Building Free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
