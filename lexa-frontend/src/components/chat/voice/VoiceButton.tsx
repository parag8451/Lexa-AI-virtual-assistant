import { forwardRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  isRecording: boolean;
  isTranscribing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
}

export const VoiceButton = forwardRef<HTMLButtonElement, VoiceButtonProps>(
  function VoiceButton(
    { isRecording, isTranscribing, onStartRecording, onStopRecording, disabled },
    ref
  ) {
    if (isTranscribing) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={ref}
              variant="ghost"
              size="icon"
              disabled
              className="h-9 w-9 rounded-xl"
            >
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Transcribing...</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-xl transition-all",
              isRecording 
                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={disabled}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isRecording ? "Stop recording" : "Voice input"}
        </TooltipContent>
      </Tooltip>
    );
  }
);
