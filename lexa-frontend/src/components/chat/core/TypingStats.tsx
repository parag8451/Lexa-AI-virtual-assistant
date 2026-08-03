import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Type, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface TypingStatsProps {
  text: string;
  isVisible: boolean;
  className?: string;
}

export function TypingStats({ text, isVisible, className }: TypingStatsProps) {
  const stats = useMemo(() => {
    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    // Estimate response time based on complexity
    let estimatedTime = "< 5s";
    if (wordCount > 50) {
      estimatedTime = "~15s";
    } else if (wordCount > 20) {
      estimatedTime = "~10s";
    } else if (wordCount > 10) {
      estimatedTime = "~7s";
    }

    // Determine complexity
    let complexity = "Quick";
    if (text.includes("?") && wordCount > 15) {
      complexity = "Detailed";
    }
    if (text.toLowerCase().includes("explain") || text.toLowerCase().includes("how")) {
      complexity = "Explanatory";
    }
    if (text.toLowerCase().includes("code") || text.toLowerCase().includes("write")) {
      complexity = "Technical";
    }

    return {
      charCount,
      wordCount,
      estimatedTime,
      complexity,
    };
  }, [text]);

  return (
    <AnimatePresence>
      {isVisible && text.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className={cn(
            "flex items-center gap-4 text-[10px] text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-1">
            <Type className="w-3 h-3" />
            <span>{stats.charCount} chars</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>~{stats.estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>{stats.complexity}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
