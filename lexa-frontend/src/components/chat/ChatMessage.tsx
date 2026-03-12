import { memo, useState, useCallback } from "react";
import { User, Copy, Check, ExternalLink, Sparkles, RotateCcw, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";
import { SafeMarkdown } from "./SafeMarkdown";
import { SpeakButton } from "./SpeakButton";
import { QuickActions } from "./QuickActions";
import { EmojiReactions } from "./EmojiReactions";
import { useTypewriter } from "@/hooks/useTypewriter";
import { toast } from "sonner";
interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  isSpeaking?: boolean;
  onSpeak?: (text: string) => void;
  onStopSpeaking?: () => void;
  onRegenerate?: () => void;
  isLastAssistant?: boolean;
  onQuickAction?: (action: string, prompt: string) => void;
  showQuickActions?: boolean;
}

export const ChatMessage = memo(function ChatMessage({
  message,
  isStreaming,
  isSpeaking = false,
  onSpeak,
  onStopSpeaking,
  onRegenerate,
  isLastAssistant = false,
  onQuickAction,
  showQuickActions = false,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const isUser = message.role === "user";

  // Typewriter effect for streaming assistant messages
  const { displayedContent, isTyping } = useTypewriter(message.content, {
    charDelay: 12, // Fast but visible typing effect
    enabled: !isUser && isStreaming,
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ text: message.content });
    } else {
      await navigator.clipboard.writeText(message.content);
      toast.success("Copied to clipboard for sharing");
    }
  };

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type);
    toast.success(type === "up" ? "Thanks for the feedback! 💙" : "I'll try to improve next time 🙏");
  };

  const handleReaction = useCallback((messageId: string, emoji: string) => {
    setReactions(prev => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));
    toast.success(`Reacted with ${emoji}`);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group flex gap-4 px-4 md:px-6 py-6 transition-colors duration-200",
        isUser ? "bg-transparent" : "bg-muted/[0.08]"
      )}
    >
      <div className="max-w-3xl mx-auto w-full flex gap-4">
        {/* Avatar */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={cn(
            "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/5",
            isUser 
              ? "gradient-primary" 
              : "bg-gradient-to-br from-violet-600 to-indigo-600"
          )}
        >
          {isUser ? (
            <User className="h-5 w-5 text-white" />
          ) : (
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          )}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">
              {isUser ? "You" : "Lexa AI"}
            </span>
            {message.model && !isUser && (
              <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-semibold border border-primary/10">
                {message.model.split("/").pop()}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground/60">
              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Sanitized Markdown content with typewriter effect */}
          <div className={cn(
            "prose-sm max-w-none",
            !isUser && "glass-card rounded-xl p-4 border border-border/20"
          )}>
            <SafeMarkdown content={isUser ? message.content : displayedContent} />
          </div>

          {/* Typing cursor */}
          {(isStreaming || isTyping) && !isUser && (
            <span className="inline-flex items-center gap-1 ml-1">
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-2 h-5 bg-primary rounded-sm"
              />
            </span>
          )}

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-4 space-y-2"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-px bg-gradient-to-r from-primary/50 to-transparent" />
                Sources
                <span className="w-6 h-px bg-gradient-to-l from-primary/50 to-transparent" />
              </p>
              <div className="flex flex-wrap gap-2">
                {message.citations.map((citation, index) => (
                  <a
                    key={index}
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-2 text-xs glass-card hover:bg-muted/50 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                  >
                    <span className="w-5 h-5 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                      {index + 1}
                    </span>
                    <span className="truncate max-w-[180px] text-foreground/80 font-medium">{citation.title}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Actions for last assistant message */}
          {!isUser && isLastAssistant && showQuickActions && onQuickAction && !isStreaming && (
            <div className="mt-4 pt-3 border-t border-border/30">
              <QuickActions 
                onAction={onQuickAction}
                lastMessage={message.content}
              />
            </div>
          )}

          {/* Action buttons for assistant messages */}
          {!isUser && !isStreaming && (
            <div className="flex items-center justify-between pt-3">
              {/* Emoji Reactions */}
              <EmojiReactions
                messageId={message.id}
                reactions={reactions}
                onReact={handleReaction}
              />

              {/* Other actions */}
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60 transition-all"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>

                {isLastAssistant && onRegenerate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60 transition-all"
                    onClick={onRegenerate}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-2.5 text-xs rounded-lg transition-all",
                    feedback === "up" ? "text-green-500 bg-green-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                  onClick={() => handleFeedback("up")}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-2.5 text-xs rounded-lg transition-all",
                    feedback === "down" ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                  onClick={() => handleFeedback("down")}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60 transition-all"
                  onClick={handleShare}
                >
                  <Share2 className="h-3.5 w-3.5" />
                </Button>

                {onSpeak && (
                  <SpeakButton
                    isSpeaking={isSpeaking}
                    onSpeak={() => onSpeak(message.content)}
                    onStop={onStopSpeaking || (() => {})}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
