import { memo, useState, useCallback } from "react";
import { User, Copy, Check, ExternalLink, Bot, RotateCcw, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
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

  const { displayedContent, isTyping } = useTypewriter(message.content, {
    charDelay: 12,
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
    toast.success(type === "up" ? "Thanks for the feedback!" : "I'll try to improve next time");
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group px-4 md:px-6 py-5",
        isUser ? "" : "bg-muted/30"
      )}
    >
      <div className="max-w-3xl mx-auto w-full flex gap-3.5">
        {/* Avatar */}
        <div
          className={cn(
            "shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5",
            isUser
              ? "bg-muted text-muted-foreground"
              : "bg-foreground text-background"
          )}
        >
          {isUser ? (
            <User className="h-3.5 w-3.5" />
          ) : (
            <Bot className="h-3.5 w-3.5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">
              {isUser ? "You" : "Lexa AI"}
            </span>
            {message.model && !isUser && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">
                {message.model.split("/").pop()}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground/50">
              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Message content */}
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-secondary prose-pre:border prose-pre:border-border prose-code:text-sm">
            <SafeMarkdown content={isUser ? message.content : displayedContent} />
          </div>

          {/* Typing cursor */}
          {(isStreaming || isTyping) && !isUser && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-1.5 h-4 bg-primary rounded-sm ml-0.5"
            />
          )}

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sources</p>
              <div className="flex flex-wrap gap-1.5">
                {message.citations.map((citation, index) => (
                  <a
                    key={index}
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1.5 text-xs bg-muted hover:bg-accent px-2.5 py-1.5 rounded-md transition-colors border border-border/50"
                  >
                    <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-[9px]">
                      {index + 1}
                    </span>
                    <span className="truncate max-w-[160px] text-foreground/80">{citation.title}</span>
                    <ExternalLink className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {!isUser && isLastAssistant && showQuickActions && onQuickAction && !isStreaming && (
            <div className="mt-3 pt-2.5 border-t border-border/40">
              <QuickActions 
                onAction={onQuickAction}
                lastMessage={message.content}
              />
            </div>
          )}

          {/* Action buttons */}
          {!isUser && !isStreaming && (
            <div className="flex items-center justify-between pt-2">
              <EmojiReactions
                messageId={message.id}
                reactions={reactions}
                onReact={handleReaction}
              />

              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-0.5">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={handleCopy}>
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>

                {isLastAssistant && onRegenerate && (
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={onRegenerate}>
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                )}

                <Button
                  variant="ghost" size="sm"
                  className={cn("h-7 w-7 p-0", feedback === "up" ? "text-green-500" : "text-muted-foreground hover:text-foreground")}
                  onClick={() => handleFeedback("up")}
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost" size="sm"
                  className={cn("h-7 w-7 p-0", feedback === "down" ? "text-red-500" : "text-muted-foreground hover:text-foreground")}
                  onClick={() => handleFeedback("down")}
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>

                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={handleShare}>
                  <Share2 className="h-3 w-3" />
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
