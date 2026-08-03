import { useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, Scale, Brain, Crown, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useModelRouting, ComplexityLevel } from "@/hooks/useModelRouting";
import { cn } from "@/lib/utils";

interface ModelRoutingIndicatorProps {
  message: string;
  isAutoRouting: boolean;
  currentModel: string;
  onModelSuggested?: (modelId: string) => void;
}

export function ModelRoutingIndicator({ 
  message, 
  isAutoRouting,
  currentModel,
  onModelSuggested 
}: ModelRoutingIndicatorProps) {
  const { getRecommendedModel, getComplexityInfo } = useModelRouting();

  const recommendation = useMemo(() => {
    if (!message.trim()) return null;
    return getRecommendedModel(message);
  }, [message, getRecommendedModel]);

  if (!recommendation || !message.trim()) {
    return null;
  }

  const complexityConfig = getComplexityInfo[recommendation.complexity];
  const Icon = {
    simple: Zap,
    moderate: Scale,
    complex: Brain,
    expert: Crown,
  }[recommendation.complexity];

  const isUsingRecommended = currentModel === recommendation.modelId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              "gap-1.5 cursor-help transition-colors",
              isAutoRouting && isUsingRecommended 
                ? "border-primary/50 bg-primary/10" 
                : "border-border"
            )}
          >
            <Icon className={cn("h-3 w-3", complexityConfig.color)} />
            <span className="text-[10px]">{complexityConfig.label}</span>
            {isAutoRouting && (
              <TrendingUp className="h-2.5 w-2.5 text-muted-foreground" />
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium text-sm">{recommendation.reason}</p>
            <p className="text-xs text-muted-foreground">
              {isAutoRouting 
                ? `Auto-selected: ${recommendation.modelName}` 
                : `Recommended: ${recommendation.modelName}`
              }
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </motion.div>
  );
}

// Compact version for the input area
export function ModelRoutingBadge({ 
  complexity,
  isAutoRouting 
}: { 
  complexity: ComplexityLevel | null;
  isAutoRouting: boolean;
}) {
  const { getComplexityInfo } = useModelRouting();
  
  if (!complexity) return null;

  const config = getComplexityInfo[complexity];
  const Icon = {
    simple: Zap,
    moderate: Scale,
    complex: Brain,
    expert: Crown,
  }[complexity];

  return (
    <div className={cn(
      "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
      "bg-muted/80 border border-border/50"
    )}>
      <Icon className={cn("h-2.5 w-2.5", config.color)} />
      <span>{config.label}</span>
      {isAutoRouting && (
        <Sparkles className="h-2.5 w-2.5 text-primary" />
      )}
    </div>
  );
}
