import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, MessageSquare, Clock, Sparkles, TrendingUp, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";
import type { Mood } from "@/hooks/useSentiment";

interface ConversationInsightsProps {
  messages: Message[];
  overallMood?: Mood;
  className?: string;
}

interface InsightStat {
  icon: typeof MessageSquare;
  label: string;
  value: string | number;
  color: string;
}

export function ConversationInsights({ messages, overallMood, className }: ConversationInsightsProps) {
  const insights = useMemo(() => {
    const userMessages = messages.filter(m => m.role === "user");
    const assistantMessages = messages.filter(m => m.role === "assistant");
    
    // Calculate average response length
    const avgResponseLength = assistantMessages.length > 0
      ? Math.round(assistantMessages.reduce((acc, m) => acc + m.content.length, 0) / assistantMessages.length)
      : 0;
    
    // Calculate total words
    const totalWords = messages.reduce((acc, m) => acc + m.content.split(/\s+/).length, 0);
    
    // Estimate topics discussed (simplified)
    const topics = new Set<string>();
    const topicKeywords = [
      { keywords: ["code", "function", "programming", "javascript", "python", "react"], topic: "Coding" },
      { keywords: ["explain", "what is", "how does", "understand"], topic: "Learning" },
      { keywords: ["write", "create", "generate", "make"], topic: "Creative" },
      { keywords: ["help", "fix", "solve", "problem"], topic: "Problem Solving" },
      { keywords: ["idea", "think", "opinion", "suggest"], topic: "Brainstorming" },
    ];
    
    messages.forEach(m => {
      const lowerContent = m.content.toLowerCase();
      topicKeywords.forEach(({ keywords, topic }) => {
        if (keywords.some(k => lowerContent.includes(k))) {
          topics.add(topic);
        }
      });
    });

    return {
      messageCount: messages.length,
      userMessageCount: userMessages.length,
      assistantMessageCount: assistantMessages.length,
      avgResponseLength,
      totalWords,
      topics: Array.from(topics).slice(0, 3),
    };
  }, [messages]);

  const stats: InsightStat[] = [
    {
      icon: MessageSquare,
      label: "Messages",
      value: insights.messageCount,
      color: "text-blue-500",
    },
    {
      icon: Clock,
      label: "Words exchanged",
      value: insights.totalWords.toLocaleString(),
      color: "text-green-500",
    },
    {
      icon: TrendingUp,
      label: "Avg. response",
      value: `${Math.round(insights.avgResponseLength / 50)} sentences`,
      color: "text-purple-500",
    },
    {
      icon: Brain,
      label: "Mood",
      value: overallMood || "Neutral",
      color: "text-pink-500",
    },
  ];

  if (messages.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <BarChart3 className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Conversation Insights</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 p-2 rounded-xl bg-muted/30"
          >
            <stat.icon className={cn("w-4 h-4", stat.color)} />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
              <p className="text-sm font-semibold text-foreground capitalize truncate">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {insights.topics.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Topics discussed
          </p>
          <div className="flex flex-wrap gap-1">
            {insights.topics.map((topic) => (
              <span
                key={topic}
                className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
