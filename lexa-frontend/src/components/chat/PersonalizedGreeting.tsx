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
      <div className="flex items-center gap-3 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>

        {/* Minimal greeting: avoid verbose salutations */}
        <span className="text-lg font-medium text-foreground/90">
          How can I help?
        </span>
      </div>

      {/* Subtle prompt with optional name */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-foreground">
        {userName ? `${displayName}` : ""}
      </h1>
    </motion.div>
  );
}
