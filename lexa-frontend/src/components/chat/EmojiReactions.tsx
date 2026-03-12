import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmojiReactionsProps {
  messageId: string;
  reactions?: Record<string, number>;
  onReact: (messageId: string, emoji: string) => void;
  className?: string;
}

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "🎉", "🤔", "👏", "🔥"];

export function EmojiReactions({ messageId, reactions = {}, onReact, className }: EmojiReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [animatingEmoji, setAnimatingEmoji] = useState<string | null>(null);

  const handleReact = (emoji: string) => {
    setAnimatingEmoji(emoji);
    onReact(messageId, emoji);
    setShowPicker(false);
    setTimeout(() => setAnimatingEmoji(null), 600);
  };

  const hasReactions = Object.keys(reactions).length > 0;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Existing reactions */}
      <AnimatePresence>
        {hasReactions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 mr-1"
          >
            {Object.entries(reactions).map(([emoji, count]) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                  "bg-primary/10 hover:bg-primary/20 transition-colors",
                  "border border-primary/20"
                )}
                onClick={() => handleReact(emoji)}
              >
                <span className="text-sm">{emoji}</span>
                <span className="text-primary font-medium">{count}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add reaction button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 rounded-full hover:bg-primary/10"
          onClick={() => setShowPicker(!showPicker)}
        >
          <SmilePlus className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Emoji picker */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              className={cn(
                "absolute bottom-full left-0 mb-2 p-2 rounded-xl",
                "bg-popover border border-border shadow-xl",
                "flex gap-1 z-50"
              )}
            >
              {EMOJI_OPTIONS.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-lg",
                    "hover:bg-primary/10 transition-colors text-lg"
                  )}
                  onClick={() => handleReact(emoji)}
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating reaction animation */}
      <AnimatePresence>
        {animatingEmoji && (
          <motion.span
            initial={{ opacity: 1, scale: 1, y: 0 }}
            animate={{ opacity: 0, scale: 2, y: -50 }}
            exit={{ opacity: 0 }}
            className="absolute text-2xl pointer-events-none"
          >
            {animatingEmoji}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
