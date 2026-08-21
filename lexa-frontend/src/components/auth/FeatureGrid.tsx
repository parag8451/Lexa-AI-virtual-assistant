import * as React from "react";
import { Mic, ScanText, ShieldCheck, Sparkles } from "lucide-react";
import { LogoIcon } from "@/components/ui/LogoIcon";

type Feature = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: Sparkles,
    title: "Smart conversations",
    description: "Context-aware chat that remembers what matters to you.",
  },
  { icon: ScanText, title: "Live OCR & vision", description: "Scan documents and read images in real time." },
  { icon: Mic, title: "Natural voice", description: "Talk to Lexa and hear lifelike responses." },
  { icon: ShieldCheck, title: "Private & secure", description: "Your conversations stay encrypted and yours." },
];

export function FeatureGrid() {
  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3">
        <div className="gradient-aurora flex h-11 w-11 items-center justify-center rounded-xl shadow-lg shadow-primary/20">
          <LogoIcon className="h-6 w-6 text-white" />
        </div>
        <span className="gradient-text text-xl font-bold">Lexa AI</span>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold leading-[1.1] tracking-tight xl:text-5xl">
          Think, create, and get answers <span className="gradient-text">faster</span>.
        </h1>
        <p className="max-w-md text-base text-muted-foreground">
          Your all-in-one AI assistant for conversations, documents, vision, and voice — beautifully fast and private.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm transition-colors hover:bg-white/[0.06]"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold">{feature.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground">Trusted by thousands of curious minds every day.</p>
    </div>
  );
}
