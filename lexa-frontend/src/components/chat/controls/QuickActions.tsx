import { motion } from "framer-motion";
import { MessageSquarePlus, Lightbulb, FileText, Wand2, ArrowRight, ListChecks, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  onAction: (action: string, prompt: string) => void;
  lastMessage?: string;
  className?: string;
}

const QUICK_ACTIONS = [
  {
    id: "follow-up",
    icon: MessageSquarePlus,
    label: "Follow up",
    prompt: "Can you tell me more about this? I'd like to understand deeper.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "explain",
    icon: Lightbulb,
    label: "Explain simply",
    prompt: "Can you explain this in simpler terms, like I'm a beginner?",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    id: "summarize",
    icon: FileText,
    label: "Summarize",
    prompt: "Can you summarize the key points from our conversation?",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "examples",
    icon: BookOpen,
    label: "Give examples",
    prompt: "Can you provide some practical examples for this?",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "steps",
    icon: ListChecks,
    label: "Step by step",
    prompt: "Can you break this down into clear, actionable steps?",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    id: "improve",
    icon: Wand2,
    label: "Improve it",
    prompt: "How can we improve or enhance what you just described?",
    gradient: "from-rose-500 to-red-500",
  },
];

export function QuickActions({ onAction, lastMessage, className }: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {QUICK_ACTIONS.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 * index }}
        >
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "group h-8 px-3 text-xs rounded-full border-border/50",
              "hover:border-transparent hover:text-white transition-all duration-300",
              "hover:shadow-lg hover:shadow-primary/20"
            )}
            onClick={() => onAction(action.id, action.prompt)}
            style={{
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, var(--tw-gradient-stops))`;
              e.currentTarget.classList.add(`bg-gradient-to-r`, action.gradient.split(" ")[0], action.gradient.split(" ")[1]);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <action.icon className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:scale-110" />
            {action.label}
            <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}
