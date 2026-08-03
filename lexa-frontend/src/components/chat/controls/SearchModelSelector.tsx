import { Globe, Zap, Brain, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SearchModel {
  id: string;
  name: string;
  description: string;
  icon: typeof Globe;
  speed: "fast" | "medium" | "slow";
  quality: "standard" | "high" | "premium";
}

export const SEARCH_MODELS: SearchModel[] = [
  {
    id: "lexa-search-fast",
    name: "Lexa Search Fast",
    description: "Quick web searches with instant results",
    icon: Zap,
    speed: "fast",
    quality: "high",
  },
  {
    id: "lexa-search-pro",
    name: "Lexa Search Pro",
    description: "Deep web analysis with comprehensive results",
    icon: Brain,
    speed: "slow",
    quality: "premium",
  },
  {
    id: "lexa-search-balanced",
    name: "Lexa Search Balanced",
    description: "Balanced speed and depth",
    icon: Globe,
    speed: "medium",
    quality: "high",
  },
];

interface SearchModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
  cooldownRemaining?: number;
}

export function SearchModelSelector({
  value,
  onChange,
  disabled,
  cooldownRemaining = 0,
}: SearchModelSelectorProps) {
  const current = SEARCH_MODELS.find(m => m.id === value) || SEARCH_MODELS[0];
  const Icon = current.icon;

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case "fast": return "text-green-500 bg-green-500/10";
      case "medium": return "text-yellow-500 bg-yellow-500/10";
      case "slow": return "text-orange-500 bg-orange-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "premium": return "text-purple-500 bg-purple-500/10";
      case "high": return "text-blue-500 bg-blue-500/10";
      case "standard": return "text-muted-foreground bg-muted";
      default: return "text-muted-foreground bg-muted";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="gap-2 h-9 px-3 rounded-xl"
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{current.name}</span>
          {cooldownRemaining > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
              <Clock className="h-3 w-3 mr-1" />
              {cooldownRemaining}s
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Search Models
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SEARCH_MODELS.map((model) => {
          const ModelIcon = model.icon;
          const isSelected = value === model.id;
          return (
            <DropdownMenuItem
              key={model.id}
              onClick={() => onChange(model.id)}
              className={cn(
                "flex items-start gap-3 p-3 cursor-pointer",
                isSelected && "bg-accent"
              )}
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <ModelIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{model.name}</span>
                  {isSelected && (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {model.description}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className={cn("text-[10px]", getSpeedColor(model.speed))}>
                    {model.speed}
                  </Badge>
                  <Badge variant="outline" className={cn("text-[10px]", getQualityColor(model.quality))}>
                    {model.quality}
                  </Badge>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
