import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Mood } from "@/hooks/useSentiment";

interface MoodIndicatorProps {
  mood: Mood | null;
  emoji: string;
  response?: string;
  show: boolean;
}

const MOOD_COLORS: Record<Mood, string> = {
  happy: "from-yellow-400 to-orange-400",
  excited: "from-pink-500 to-red-500",
  sad: "from-blue-400 to-indigo-500",
  frustrated: "from-orange-500 to-red-600",
  confused: "from-purple-400 to-violet-500",
  curious: "from-cyan-400 to-blue-500",
  grateful: "from-pink-400 to-rose-500",
  neutral: "from-gray-400 to-slate-500",
};

const MOOD_BG_COLORS: Record<Mood, string> = {
  happy: "bg-yellow-500/10 border-yellow-500/30",
  excited: "bg-pink-500/10 border-pink-500/30",
  sad: "bg-blue-500/10 border-blue-500/30",
  frustrated: "bg-orange-500/10 border-orange-500/30",
  confused: "bg-purple-500/10 border-purple-500/30",
  curious: "bg-cyan-500/10 border-cyan-500/30",
  grateful: "bg-pink-500/10 border-pink-500/30",
  neutral: "bg-gray-500/10 border-gray-500/30",
};

export function MoodIndicator({ mood, emoji, response, show }: MoodIndicatorProps) {
  if (!mood) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-sm",
            MOOD_BG_COLORS[mood]
          )}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 0.6, 
              ease: "easeInOut",
              repeat: 1
            }}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-xl",
              "bg-gradient-to-br shadow-lg",
              MOOD_COLORS[mood]
            )}
          >
            {emoji}
          </motion.div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground capitalize">{mood} vibes detected</p>
            {response && (
              <p className="text-xs text-muted-foreground mt-0.5">{response}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
