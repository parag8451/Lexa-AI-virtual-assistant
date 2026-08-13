import { Brain, Search, Code2, Sparkles, Zap, Mic } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export type FeatureHighlight = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const FEATURE_HIGHLIGHTS: FeatureHighlight[] = [
  {
    title: "AI Models",
    description: "Choose from powerful models optimized for reasoning, creativity, coding, and everyday tasks.",
    icon: Brain,
  },
  {
    title: "Deep Research",
    description: "Let AI investigate complex topics and produce structured, source-backed answers.",
    icon: Search,
  },
  {
    title: "AI Agents",
    description: "Automate multi-step workflows with intelligent agents that run in the background.",
    icon: Zap,
  },
  {
    title: "Creative Studio",
    description: "Generate stunning images, videos, and creative content from simple natural language prompts.",
    icon: Sparkles,
  },
  {
    title: "Developer Tools",
    description: "Build AI-powered products with powerful APIs, SDKs, and developer-first documentation.",
    icon: Code2,
  },
  {
    title: "Voice AI",
    description: "Have natural, real-time conversations with your AI using advanced low-latency voice models.",
    icon: Mic,
  },
];
