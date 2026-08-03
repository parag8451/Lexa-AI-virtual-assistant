import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, Loader2, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtimeVoice } from "@/hooks/useRealtimeVoice";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RealtimeVoiceChatProps {
  isActive: boolean;
  onClose: () => void;
}

export function RealtimeVoiceChat({ isActive, onClose }: RealtimeVoiceChatProps) {
  const {
    status,
    isSpeaking,
    isConnecting,
    messages,
    currentTranscript,
    startConversation,
    stopConversation,
    getInputVolume,
    getOutputVolume,
  } = useRealtimeVoice();

  const [inputLevel, setInputLevel] = useState(0);
  const [outputLevel, setOutputLevel] = useState(0);
  const animationRef = useRef<number>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Monitor audio levels for visualization
  useEffect(() => {
    if (status !== "connected") return;

    const updateLevels = () => {
      setInputLevel(getInputVolume?.() || 0);
      setOutputLevel(getOutputVolume?.() || 0);
      animationRef.current = requestAnimationFrame(updateLevels);
    };

    updateLevels();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [status, getInputVolume, getOutputVolume]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentTranscript]);

  // Start conversation when modal opens
  useEffect(() => {
    if (isActive && status === "disconnected" && !isConnecting) {
      startConversation();
    }
  }, [isActive, status, isConnecting, startConversation]);

  const handleClose = () => {
    stopConversation();
    onClose();
  };

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="flex flex-col items-center w-full max-w-2xl h-[80vh] mx-4"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              animate={{ scale: isSpeaking ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-2xl glow-blue"
            >
              <Sparkles className="h-10 w-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold gradient-text">Real-Time Voice Chat</h2>
            <p className="text-muted-foreground mt-1">
              {status === "connected"
                ? isSpeaking
                  ? "Lexa is speaking..."
                  : "Listening... speak naturally"
                : isConnecting
                  ? "Connecting..."
                  : "Voice chat ready"
              }
            </p>
          </div>

          {/* Audio Visualizer */}
          <div className="relative flex items-center justify-center gap-8 mb-6">
            {/* Input (User) Visualizer */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div 
                  className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center transition-transform"
                  style={{ transform: `scale(${1 + inputLevel * 0.5})` }}
                >
                  <Mic className={cn(
                    "h-6 w-6",
                    inputLevel > 0.1 ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                {status === "connected" && inputLevel > 0.05 && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/30"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </div>
              <span className="text-xs text-muted-foreground">You</span>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {status === "connected" && (
                <motion.div
                  className="flex gap-1"
                  animate={{ opacity: [0.5, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                >
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-green-500"
                    />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Output (AI) Visualizer */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div 
                  className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center transition-transform"
                  style={{ transform: `scale(${1 + outputLevel * 0.5})` }}
                >
                  <Volume2 className={cn(
                    "h-6 w-6",
                    isSpeaking ? "text-violet-500" : "text-muted-foreground"
                  )} />
                </div>
                {isSpeaking && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-violet-500/30"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </div>
              <span className="text-xs text-muted-foreground">Lexa</span>
            </div>
          </div>

          {/* Conversation Log */}
          <ScrollArea className="flex-1 w-full rounded-xl border border-border/50 bg-muted/20 p-4 mb-6">
            <div className="space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3 items-start",
                    msg.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    msg.role === "user" 
                      ? "gradient-primary" 
                      : "bg-gradient-to-br from-violet-600 to-indigo-600"
                  )}>
                    {msg.role === "user" 
                      ? <User className="h-4 w-4 text-white" />
                      : <Sparkles className="h-4 w-4 text-white" />
                    }
                  </div>
                  <div className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-foreground"
                  )}>
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-[10px] opacity-70 mt-1 block">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Live transcripts */}
              {currentTranscript && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 items-start flex-row-reverse"
                >
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="max-w-[75%] rounded-2xl px-4 py-2 bg-primary/50 text-primary-foreground">
                    <p className="text-sm italic">{currentTranscript}...</p>
                  </div>
                </motion.div>
              )}


              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {status === "disconnected" && !isConnecting && (
              <Button
                size="lg"
                onClick={startConversation}
                className="gap-2 rounded-xl gradient-primary text-white shadow-lg hover:shadow-xl"
              >
                <Phone className="h-5 w-5" />
                Start Voice Chat
              </Button>
            )}

            {isConnecting && (
              <Button size="lg" disabled className="gap-2 rounded-xl">
                <Loader2 className="h-5 w-5 animate-spin" />
                Connecting...
              </Button>
            )}

            {status === "connected" && (
              <Button
                size="lg"
                variant="destructive"
                onClick={handleClose}
                className="gap-2 rounded-xl"
              >
                <PhoneOff className="h-5 w-5" />
                End Call
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              onClick={handleClose}
              className="rounded-xl"
            >
              Close
            </Button>
          </div>

          {/* Tips */}
          <p className="text-xs text-muted-foreground mt-4 text-center max-w-md">
            💡 Tip: Speak naturally and Lexa will respond in real-time. 
            The conversation is fully bidirectional - just like a phone call!
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
