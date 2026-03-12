import { useState } from "react";
import { 
  MoreHorizontal, 
  BookOpen, 
  FileCode, 
  Bot, 
  Target, 
  Clock, 
  Image, 
  Users, 
  BarChart3,
  Sparkles,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { KnowledgeBasePanel } from "./KnowledgeBasePanel";
import { ArtifactsPanel } from "./ArtifactsPanel";
import { AgentsPanel } from "./AgentsPanel";
import { GoalsPanel } from "./GoalsPanel";
import { ScheduledTasksPanel } from "./ScheduledTasksPanel";
import { MediaGenerationPanel } from "./MediaGenerationPanel";
import { WorkspacePanel } from "./WorkspacePanel";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { cn } from "@/lib/utils";

interface FeatureItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  component: React.ReactNode;
  gradient: string;
}

export function MobileFeatureMenu() {
  const [open, setOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features: FeatureItem[] = [
    {
      id: "knowledge",
      label: "Knowledge Base",
      icon: BookOpen,
      description: "Upload documents for AI context",
      component: <KnowledgeBasePanel />,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: "artifacts",
      label: "Artifacts",
      icon: FileCode,
      description: "Code & content canvas",
      component: <ArtifactsPanel conversationId={undefined} />,
      gradient: "from-orange-500 to-amber-500",
    },
    {
      id: "agents",
      label: "AI Agents",
      icon: Bot,
      description: "Autonomous task execution",
      component: <AgentsPanel />,
      gradient: "from-pink-500 to-rose-500",
    },
    {
      id: "goals",
      label: "Goals",
      icon: Target,
      description: "Track your objectives",
      component: <GoalsPanel />,
      gradient: "from-indigo-500 to-violet-500",
    },
    {
      id: "tasks",
      label: "Scheduled Tasks",
      icon: Clock,
      description: "Recurring AI prompts",
      component: <ScheduledTasksPanel />,
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      id: "media",
      label: "Media Studio",
      icon: Image,
      description: "Create images & videos with AI",
      component: <MediaGenerationPanel />,
      gradient: "from-rose-500 to-pink-500",
    },
    {
      id: "workspaces",
      label: "Workspaces",
      icon: Users,
      description: "Team collaboration",
      component: <WorkspacePanel />,
      gradient: "from-teal-500 to-emerald-500",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      description: "Usage insights",
      component: <AnalyticsPanel />,
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  const activeFeatureData = features.find(f => f.id === activeFeature);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden h-9 w-9 relative"
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {activeFeature ? activeFeatureData?.label : "AI Features"}
          </SheetTitle>
        </SheetHeader>
        
        {activeFeature ? (
          <div className="flex flex-col h-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveFeature(null)}
              className="self-start mb-4"
            >
              <X className="h-4 w-4 mr-2" />
              Back to features
            </Button>
            <div className="flex-1 overflow-y-auto">
              {activeFeatureData?.component}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-8">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className={cn(
                  "flex flex-col items-start gap-2 p-4 rounded-xl",
                  "bg-card border border-border/50",
                  "hover:border-primary/40 hover:bg-accent/30",
                  "transition-all duration-200 text-left",
                  "active:scale-[0.98]"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  "bg-gradient-to-br shadow-lg",
                  feature.gradient
                )}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">{feature.label}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {feature.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
