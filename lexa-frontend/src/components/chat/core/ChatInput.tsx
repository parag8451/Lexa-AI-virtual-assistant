import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Plus, Sliders, X, Image, FileText, Mic, ChevronDown, ArrowUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import BorderGlow from "@/components/ui/BorderGlow";
import { VoiceButton } from "@/components/chat/voice/VoiceButton";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useSentiment } from "@/hooks/useSentiment";
import { useModelRouting, ComplexityLevel } from "@/hooks/useModelRouting";
import { Badge } from "@/components/ui/badge";

interface ChatInputProps {
  onSend: (message: string, attachments?: File[]) => void;
  isLoading: boolean;
  onStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
  isRecording?: boolean;
  isTranscribing?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => Promise<string>;
  webSearchEnabled?: boolean;
  onToggleWebSearch?: () => void;
  onOpenRealtimeVoice?: () => void;
  autoRouting?: boolean;
  onComplexityChange?: (complexity: ComplexityLevel | null, modelId: string | null) => void;
}

type ModelTier = "fast" | "thinking" | "pro";

const MODEL_TIERS: Record<ModelTier, { label: string; description: string; badge?: string }> = {
  fast: { label: "Fast", description: "Answers quickly", badge: "New" },
  thinking: { label: "Thinking", description: "Solves complex problems", badge: "New" },
  pro: { label: "Pro", description: "Advanced math & code", badge: "New" }
};

export function ChatInput({
  onSend,
  isLoading,
  onStop,
  disabled,
  placeholder = "Ask Lexa AI",
  isRecording = false,
  isTranscribing = false,
  onStartRecording,
  onStopRecording,
  webSearchEnabled = false,
  onToggleWebSearch,
  onOpenRealtimeVoice,
  autoRouting = true,
  onComplexityChange
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedTier, setSelectedTier] = useState<ModelTier>("fast");
  const [detectedComplexity, setDetectedComplexity] = useState<ComplexityLevel | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const moodTimeoutRef = useRef<NodeJS.Timeout>();

  const { analyzeSentiment } = useSentiment();
  const { analyzeComplexity, routeMessage } = useModelRouting();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [input]);

  // Focus on mount and after sending
  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  // Analyze sentiment and complexity as user types (debounced)
  useEffect(() => {
    if (moodTimeoutRef.current) {
      clearTimeout(moodTimeoutRef.current);
    }
    if (input.length > 5) {
      moodTimeoutRef.current = setTimeout(() => {
        if (input.length > 10) {
          analyzeSentiment(input);
        }
        if (autoRouting && input.length > 3) {
          const complexity = analyzeComplexity(input);
          setDetectedComplexity(complexity);
          const recommendedModel = routeMessage(input);
          onComplexityChange?.(complexity, recommendedModel);
        }
      }, 500);
    } else {
      setDetectedComplexity(null);
      onComplexityChange?.(null, null);
    }
    return () => {
      if (moodTimeoutRef.current) {
        clearTimeout(moodTimeoutRef.current);
      }
    };
  }, [input, analyzeSentiment, analyzeComplexity, routeMessage, autoRouting, onComplexityChange]);

  const handleSubmit = useCallback(() => {
    if (!input.trim() && attachments.length === 0) return;
    if (isLoading || disabled) return;
    onSend(input.trim(), attachments.length > 0 ? attachments : undefined);
    setInput("");
    setAttachments([]);
    setDetectedComplexity(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, attachments, isLoading, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setInput("");
      setAttachments([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleVoiceStop = async () => {
    if (onStopRecording) {
      const transcription = await onStopRecording();
      if (transcription) {
        setInput(prev => prev + (prev ? " " : "") + transcription);
      }
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return Image;
    return FileText;
  };

  return (
    <TooltipProvider>
      <div className="w-full max-w-2xl mx-auto px-4 pb-6">
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((file, index) => {
              const FileIcon = getFileIcon(file);
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-muted/50 border border-border/50 px-3 py-2 rounded-xl text-sm group"
                >
                  <FileIcon className="w-4 h-4 text-primary" />
                  <span className="truncate max-w-[120px] text-foreground">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Main Input Container - Ultra Premium Glass Box with BorderGlow */}
        <BorderGlow 
          glowColor="217 91 60" // Primary blue glow
          glowIntensity={1.5}
          borderRadius={28}
          className="w-full relative z-30"
          animated={true}
        >
          <div className={cn(
            "relative rounded-[28px] overflow-hidden",
            "bg-[#1A1D24]/70 backdrop-blur-3xl",
            "border border-white/[0.08]",
            "shadow-2xl shadow-black/40",
            "focus-within:bg-[#1A1D24]/85 focus-within:border-white/[0.12]",
            "transition-all duration-300"
          )}>
          {/* Gradient accent line at top on focus */}
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-500 group-focus-within:via-white/20" />

          {/* Top section - Input area */}
          <div className="p-4 pb-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What responsive web experience shall we design?"
              disabled={isLoading || disabled}
              className={cn(
                "w-full min-h-[48px] max-h-[200px] bg-transparent border-0 resize-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-white/40 text-white/90 text-[15px] leading-relaxed",
                "p-2 px-3 mt-2 font-medium tracking-wide"
              )}
              rows={1}
            />
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 pb-3">
            {/* Left side - Actions */}
            <div className="flex items-center gap-3 pl-2">
              {/* Add/Attach button */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-white/50 hover:text-white/90 hover:bg-white/5 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || disabled}
                  >
                    <Plus className="h-5 w-5 stroke-[1.5]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach files</TooltipContent>
              </Tooltip>

              {/* Segmented Control (App / Web) styled from reference image */}
              <div className="flex items-center bg-[#2A2D35]/80 rounded-full p-1 border border-white/5 shadow-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-4 rounded-full text-white/50 hover:text-white/90 font-medium text-[13px] gap-1.5 transition-all"
                  disabled={isLoading || disabled}
                >
                  <FileText className="h-3.5 w-3.5" />
                  App
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-4 rounded-full font-medium text-[13px] gap-1.5 transition-all",
                    webSearchEnabled 
                      ? "bg-primary/20 text-primary hover:bg-primary/30" 
                      : "bg-[#3A3E4A] text-white/90 hover:bg-[#444855] shadow-sm"
                  )}
                  onClick={onToggleWebSearch}
                  disabled={isLoading || disabled}
                >
                  <Sliders className="h-3.5 w-3.5" />
                  Web
                </Button>
              </div>
            </div>

            {/* Right side - Model selector & Voice */}
            <div className="flex items-center gap-1.5 pr-2">
              {/* Tools button (styled like Color Palette icon in reference) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-white/50 hover:text-white/90 hover:bg-white/5 transition-all"
                    onClick={onToggleWebSearch}
                    disabled={isLoading || disabled}
                  >
                    <Sliders className="h-[18px] w-[18px]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tools</TooltipContent>
              </Tooltip>

              {/* Model Tier Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-4 rounded-full bg-[#2A2D35]/80 hover:bg-[#343842] text-white/90 gap-2 transition-all border border-white/5 shadow-sm"
                    disabled={isLoading || disabled}
                  >
                    <Sparkles className="h-[14px] w-[14px] text-white/70" />
                    <span className="font-semibold text-[13px] tracking-wide">3 Flash</span>
                    <ChevronDown className="h-3.5 w-3.5 text-white/50 ml-0.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 glass-strong border-border/30 shadow-xl">
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                    Lexa AI Models
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(Object.entries(MODEL_TIERS) as [ModelTier, typeof MODEL_TIERS[ModelTier]][]).map(([tier, config]) => (
                    <DropdownMenuItem
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={cn(
                        "flex items-center justify-between cursor-pointer py-2.5 rounded-lg transition-all",
                        selectedTier === tier && "bg-primary/10"
                      )}
                    >
                      <div>
                        <div className="font-semibold">{config.label}</div>
                        <div className="text-xs text-muted-foreground">{config.description}</div>
                      </div>
                      {config.badge && (
                        <Badge variant="secondary" className="bg-primary/15 text-primary text-[10px] px-1.5 py-0.5 font-semibold">
                          {config.badge}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Voice button */}
              {onStartRecording && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-9 w-9 rounded-full transition-all",
                        isRecording
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          : "text-white/50 hover:text-white/90 hover:bg-white/5"
                      )}
                      onClick={isRecording ? handleVoiceStop : onStartRecording}
                      disabled={isLoading || disabled || isTranscribing}
                    >
                      <Mic className={cn("h-[18px] w-[18px]", isRecording && "animate-pulse")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isRecording ? "Stop recording" : "Voice input"}
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Send button */}
              {(input.trim() || attachments.length > 0) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className={cn(
                        "h-9 w-9 rounded-full transition-all",
                        "text-white/50 hover:text-white/90 hover:bg-white/5"
                      )}
                      onClick={handleSubmit}
                      disabled={isLoading || disabled}
                    >
                      <ArrowUp className="h-[20px] w-[20px]" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send message</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
        </BorderGlow>
      </div>
    </TooltipProvider>
  );
}
