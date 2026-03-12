import { useState, useCallback, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceChatModeProps {
  isActive: boolean;
  onToggle: () => void;
  isRecording: boolean;
  isTranscribing: boolean;
  isSpeaking: boolean;
  onStartRecording: () => void;
  onStopRecording: () => Promise<string>;
  onSpeak: (text: string) => void;
  onStopSpeaking: () => void;
  disabled?: boolean;
}

export function VoiceChatMode({
  isActive,
  onToggle,
  isRecording,
  isTranscribing,
  isSpeaking,
  onStartRecording,
  onStopRecording,
  onSpeak,
  onStopSpeaking,
  disabled,
}: VoiceChatModeProps) {
  const [holdingMic, setHoldingMic] = useState(false);
  const holdTimeoutRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);

  // Handle push-to-talk
  const handleMouseDown = useCallback(() => {
    if (disabled || isTranscribing) return;
    setHoldingMic(true);
    startTimeRef.current = Date.now();
    
    // Start recording after a small delay to prevent accidental clicks
    holdTimeoutRef.current = setTimeout(() => {
      onStartRecording();
    }, 150);
  }, [disabled, isTranscribing, onStartRecording]);

  const handleMouseUp = useCallback(async () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
    
    if (!holdingMic) return;
    setHoldingMic(false);

    // Only process if held for more than 300ms
    const holdDuration = Date.now() - startTimeRef.current;
    if (holdDuration < 300) {
      return;
    }

    if (isRecording) {
      await onStopRecording();
    }
  }, [holdingMic, isRecording, onStopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
      }
    };
  }, []);

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseDown();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseUp();
  };

  if (!isActive) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        disabled={disabled}
        className="gap-2 h-9 px-3 rounded-xl text-muted-foreground hover:text-foreground"
      >
        <Phone className="h-4 w-4" />
        <span className="hidden sm:inline">Voice Mode</span>
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-lg"
    >
      <div className="flex flex-col items-center gap-8 p-8">
        {/* Status */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Voice Chat Mode</h2>
          <p className="text-muted-foreground">
            {isRecording 
              ? "Listening... Release to send"
              : isTranscribing 
                ? "Processing your message..."
                : isSpeaking 
                  ? "Lexa is speaking..."
                  : "Hold the microphone to speak"
            }
          </p>
        </div>

        {/* Visualizer */}
        <div className="relative">
          <AnimatePresence>
            {(isRecording || isSpeaking) && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ 
                      scale: [1, 1.5 + i * 0.3, 1],
                      opacity: [0.5, 0.2, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className={cn(
                      "absolute inset-0 rounded-full",
                      isRecording ? "bg-primary" : "bg-green-500"
                    )}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Main mic button */}
          <Button
            size="lg"
            className={cn(
              "relative w-32 h-32 rounded-full transition-all",
              isRecording 
                ? "gradient-primary scale-110 shadow-2xl"
                : isTranscribing
                  ? "bg-muted animate-pulse"
                  : isSpeaking
                    ? "bg-green-500 text-white"
                    : "bg-primary/20 hover:bg-primary/30 text-primary"
            )}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            disabled={disabled || isTranscribing}
          >
            {isTranscribing ? (
              <Loader2 className="h-12 w-12 animate-spin" />
            ) : isRecording ? (
              <Mic className="h-12 w-12 text-white" />
            ) : isSpeaking ? (
              <Volume2 className="h-12 w-12" />
            ) : (
              <MicOff className="h-12 w-12" />
            )}
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {isSpeaking && (
            <Button
              variant="outline"
              size="lg"
              onClick={onStopSpeaking}
              className="gap-2 rounded-xl"
            >
              <VolumeX className="h-5 w-5" />
              Stop Speaking
            </Button>
          )}

          <Button
            variant="destructive"
            size="lg"
            onClick={onToggle}
            className="gap-2 rounded-xl"
          >
            <PhoneOff className="h-5 w-5" />
            End Voice Chat
          </Button>
        </div>

        {/* Tips */}
        <div className="flex flex-wrap gap-2 justify-center max-w-md">
          <Badge variant="secondary" className="text-xs">
            Push and hold to speak
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Release to send
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Lexa will respond with voice
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}
