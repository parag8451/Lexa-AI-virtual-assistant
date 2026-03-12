import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonalizedGreetingProps {
  userName?: string;
  className?: string;
}

export function PersonalizedGreeting({ userName, className }: PersonalizedGreetingProps) {
  const displayName = userName || "there";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("mb-6", className)}
    >
      {/* Greeting with animated icon */}
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
        </motion.div>
        <span className="text-lg font-medium bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Hi {displayName}
        </span>
      </div>

      {/* Main heading */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-foreground">
        Where should we start?
      </h1>
    </motion.div>
  );
}
