import { forwardRef } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SearchToggleProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const SearchToggle = forwardRef<HTMLButtonElement, SearchToggleProps>(
  function SearchToggle({ enabled, onToggle, disabled }, ref) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-xl transition-all",
              enabled 
                ? "bg-primary/20 text-primary hover:bg-primary/30 glow-soft" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            onClick={onToggle}
            disabled={disabled}
          >
            <Globe className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {enabled ? "Web search ON" : "Enable web search"}
        </TooltipContent>
      </Tooltip>
    );
  }
);
