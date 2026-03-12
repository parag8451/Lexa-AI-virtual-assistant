import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Plus, Sliders, X, Image, FileText, Mic, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { VoiceButton } from "./VoiceButton";
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

        {/* Main Input Container - Premium dark rounded box */}
        <div className={cn(
          "relative rounded-2xl overflow-hidden",
          "glass-card",
          "focus-within:border-primary/30 focus-within:shadow-lg focus-within:shadow-primary/5",
          "transition-all duration-300"
        )}>
          {/* Gradient accent line at top on focus */}
          <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-primary/0 to-transparent transition-all duration-300 group-focus-within:via-primary/40" />

          {/* Top section - Input area */}
          <div className="p-4 pb-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading || disabled}
              className={cn(
                "w-full min-h-[24px] max-h-[200px] bg-transparent border-0 resize-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-muted-foreground/50 text-foreground text-base",
                "p-0"
              )}
              rows={1}
            />
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 pb-3">
            {/* Left side - Actions */}
            <div className="flex items-center gap-1">
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
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || disabled}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach files</TooltipContent>
              </Tooltip>

              {/* Tools button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-1.5 transition-all",
                      webSearchEnabled && "text-primary bg-primary/10 hover:bg-primary/15"
                    )}
                    onClick={onToggleWebSearch}
                    disabled={isLoading || disabled}
                  >
                    <Sliders className="h-4 w-4" />
                    <span className="text-sm font-medium">Tools</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle web search</TooltipContent>
              </Tooltip>
            </div>

            {/* Right side - Model selector & Voice */}
            <div className="flex items-center gap-2">
              {/* Model Tier Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 rounded-lg bg-muted/40 hover:bg-muted/60 text-foreground gap-1.5 transition-all border border-border/20"
                    disabled={isLoading || disabled}
                  >
                    <span className="font-medium">{MODEL_TIERS[selectedTier].label}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
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
                        "h-8 w-8 rounded-lg transition-all",
                        isRecording
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 shadow-sm shadow-red-500/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                      onClick={isRecording ? handleVoiceStop : onStartRecording}
                      disabled={isLoading || disabled || isTranscribing}
                    >
                      <Mic className={cn("h-5 w-5", isRecording && "animate-pulse")} />
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
                      className={cn(
                        "h-8 w-8 rounded-lg transition-all",
                        "gradient-primary text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                      )}
                      onClick={handleSubmit}
                      disabled={isLoading || disabled}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send message</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
