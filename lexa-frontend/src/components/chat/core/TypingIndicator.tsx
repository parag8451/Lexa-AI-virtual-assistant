import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Lightbulb, Search, Code } from "lucide-react";
import { useState, useEffect } from "react";

const THINKING_PHRASES = [
  { text: "Thinking...", icon: Brain },
  { text: "Analyzing your request...", icon: Search },
  { text: "Generating ideas...", icon: Lightbulb },
  { text: "Crafting response...", icon: Code },
  { text: "Almost there...", icon: Sparkles },
];

export function TypingIndicator() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % THINKING_PHRASES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = THINKING_PHRASES[phraseIndex].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex gap-4 px-4 md:px-6 py-6 bg-gradient-to-r from-primary/5 via-violet-500/5 to-transparent"
    >
      <div className="max-w-3xl mx-auto w-full flex gap-4">
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30"
        >
          <Sparkles className="h-6 w-6 text-white" />
        </motion.div>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Lexa AI</span>
            <motion.span
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[10px] text-white bg-gradient-to-r from-violet-500 to-indigo-500 px-2.5 py-1 rounded-full font-medium shadow-sm"
            >
              thinking
            </motion.span>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50 backdrop-blur-sm">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ 
                    scale: [1, 1.4, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                />
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={phraseIndex}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <CurrentIcon className="h-4 w-4 text-primary" />
                <span>{THINKING_PHRASES[phraseIndex].text}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
