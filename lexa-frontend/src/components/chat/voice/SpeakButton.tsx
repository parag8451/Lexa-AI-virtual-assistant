import { forwardRef } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SpeakButtonProps {
  isSpeaking: boolean;
  isLoading?: boolean;
  onSpeak: () => void;
  onStop: () => void;
}

export const SpeakButton = forwardRef<HTMLButtonElement, SpeakButtonProps>(
  function SpeakButton({ isSpeaking, isLoading, onSpeak, onStop }, ref) {
    if (isLoading) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button ref={ref} variant="ghost" size="sm" disabled className="h-8 px-2 rounded-lg">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Generating speech...</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2 rounded-lg transition-all",
              isSpeaking 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={isSpeaking ? onStop : onSpeak}
          >
            {isSpeaking ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isSpeaking ? "Stop speaking" : "Read aloud"}
        </TooltipContent>
      </Tooltip>
    );
  }
);
