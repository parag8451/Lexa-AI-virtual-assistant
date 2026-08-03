import { motion } from "framer-motion";
import { ChevronDown, Check, Zap, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { AI_MODELS, type AIModel } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ selectedModel, onModelChange, disabled }: ModelSelectorProps) {
  const currentModel = AI_MODELS.find((m) => m.id === selectedModel) || AI_MODELS[0];
  
  const standardModels = AI_MODELS.filter((m) => m.tier === "fast" || m.tier === "balanced");
  const advancedModels = AI_MODELS.filter((m) => m.tier === "pro" || m.tier === "expert" || m.tier === "ultra");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            className={cn(
              "gap-2 font-medium h-10 px-4 rounded-xl",
              "bg-gradient-to-r from-muted/50 to-muted/30",
              "hover:from-primary/10 hover:to-violet-500/10",
              "border border-border/50 hover:border-primary/30",
              "transition-all duration-300"
            )}
            disabled={disabled}
          >
            <span className="text-lg">{currentModel.icon}</span>
            <span className="text-sm font-medium">{currentModel.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className={cn(
          "w-80 p-2",
          "bg-gradient-to-b from-popover/98 to-popover/95",
          "backdrop-blur-xl border-border/50",
          "shadow-2xl shadow-black/20 rounded-2xl"
        )}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground font-medium flex items-center gap-2 px-3 py-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Zap className="h-3 w-3 text-white" />
          </div>
          Standard Models
        </DropdownMenuLabel>
        {standardModels.map((model, idx) => (
          <ModelMenuItem
            key={model.id}
            model={model}
            isSelected={model.id === selectedModel}
            onSelect={() => onModelChange(model.id)}
            isFastest={idx === 0}
          />
        ))}
        
        <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground font-medium flex items-center gap-2 px-3 py-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Crown className="h-3 w-3 text-white" />
          </div>
          Advanced Models
        </DropdownMenuLabel>
        {advancedModels.map((model) => (
          <ModelMenuItem
            key={model.id}
            model={model}
            isSelected={model.id === selectedModel}
            onSelect={() => onModelChange(model.id)}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ModelMenuItem({
  model,
  isSelected,
  onSelect,
  isFastest,
}: {
  model: AIModel;
  isSelected: boolean;
  onSelect: () => void;
  isFastest?: boolean;
}) {
  return (
    <DropdownMenuItem
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 p-3 cursor-pointer rounded-xl mx-1 my-0.5 transition-all duration-200",
        isSelected 
          ? "bg-gradient-to-r from-primary/15 to-violet-500/10 border border-primary/20" 
          : "hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/40 border border-transparent"
      )}
    >
      <motion.span 
        className="text-xl shrink-0 mt-0.5"
        whileHover={{ scale: 1.2, rotate: 10 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {model.icon}
      </motion.span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium text-sm transition-colors",
            isSelected && "bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent"
          )}>
            {model.name}
          </span>
          {isFastest && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 font-medium flex items-center gap-1 border border-green-500/20">
              <Zap className="h-2.5 w-2.5" />
              Fastest
            </span>
          )}
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
              className="ml-auto"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary to-violet-500 flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            </motion.div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{model.description}</p>
      </div>
    </DropdownMenuItem>
  );
}
