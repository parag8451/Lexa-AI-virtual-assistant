import * as React from "react";
import { BookOpen, Bug, ExternalLink, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogoIcon } from "@/components/ui/LogoIcon";
import { SettingsCard, SettingsPage } from "./primitives";

type IconType = React.ComponentType<{ className?: string }>;

const RESOURCES: { icon: IconType; color: string; title: string; description: string; href?: string }[] = [
  { icon: BookOpen, color: "text-primary", title: "Documentation", description: "Learn how to use Lexa", href: "#" },
  { icon: Bug, color: "text-amber-500", title: "Report a Bug", description: "Help us improve the app" },
  { icon: Mail, color: "text-blue-500", title: "Contact Support", description: "Get help from our team" },
  { icon: Shield, color: "text-emerald-500", title: "Privacy & Terms", description: "Read our legal policies" },
];

export function AboutTab() {
  return (
    <SettingsPage title="About & Help" description="Information, legal documents, and support.">
      <SettingsCard className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="gradient-aurora flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg">
          <LogoIcon className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="gradient-text text-xl font-bold">Lexa AI Assistant</h3>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Version 1.0.0 (Production build)</p>
        </div>
      </SettingsCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {RESOURCES.map((resource) => {
          const Icon = resource.icon;
          return (
            <Button
              key={resource.title}
              variant="outline"
              onClick={() => resource.href && window.open(resource.href, "_blank")}
              className="h-14 justify-start gap-3 rounded-xl border-border/40 hover:bg-muted/50"
            >
              <Icon className={cn("h-5 w-5", resource.color)} />
              <span className="text-left">
                <span className="block text-sm font-semibold">{resource.title}</span>
                <span className="block text-xs font-normal text-muted-foreground">{resource.description}</span>
              </span>
            </Button>
          );
        })}
      </div>

      <p className="flex items-center justify-center gap-2 pt-4 text-center text-xs text-muted-foreground">
        Built with \u2764\ufe0f using React, Tailwind & Supabase
        <ExternalLink className="h-3 w-3" />
      </p>
    </SettingsPage>
  );
}