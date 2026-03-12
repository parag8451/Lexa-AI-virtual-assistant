import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Json } from "@/integrations/supabase/types";

export interface AnalyticsSummary {
  totalMessages: number;
  totalConversations: number;
  avgMessagesPerDay: number;
  mostUsedModel: string | null;
  totalTokensUsed: number;
  avgResponseTime: number;
}

export interface ProductivityScore {
  overallScore: number;
  efficiencyScore: number;
  engagementScore: number;
  goalCompletionScore: number;
  streakDays: number;
}

export function useAnalytics() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [productivityScore, setProductivityScore] = useState<ProductivityScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Get message and conversation counts
      const { count: msgCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true });

      const { count: convCount } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true });

      // Get productivity score for today
      const today = new Date().toISOString().split("T")[0];
      const { data: scoreData } = await supabase
        .from("productivity_scores")
        .select("*")
        .eq("score_date", today)
        .single();

      setSummary({
        totalMessages: msgCount || 0,
        totalConversations: convCount || 0,
        avgMessagesPerDay: Math.round((msgCount || 0) / 30),
        mostUsedModel: "Lexa Pro",
        totalTokensUsed: 0,
        avgResponseTime: 0,
      });

      if (scoreData) {
        setProductivityScore({
          overallScore: scoreData.overall_score,
          efficiencyScore: scoreData.efficiency_score,
          engagementScore: scoreData.engagement_score,
          goalCompletionScore: scoreData.goal_completion_score,
          streakDays: scoreData.streak_days,
        });
      }
    } catch (error) {
      console.error("Analytics fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const trackEvent = useCallback(async (
    eventType: string,
    eventData: Record<string, unknown> = {},
    options?: { conversationId?: string; model?: string; tokens?: number; responseTimeMs?: number }
  ) => {
    if (!user) return;

    await supabase.from("analytics_events").insert([{
      user_id: user.id,
      event_type: eventType,
      event_data: eventData as Json,
      conversation_id: options?.conversationId || null,
      model_used: options?.model || null,
      tokens_used: options?.tokens || null,
      response_time_ms: options?.responseTimeMs || null,
    }]);
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    summary,
    productivityScore,
    isLoading,
    trackEvent,
    refreshAnalytics: fetchAnalytics,
  };
}
