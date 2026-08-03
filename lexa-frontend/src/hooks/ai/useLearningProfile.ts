import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface WritingStyle {
  formality: "casual" | "neutral" | "formal";
  verbosity: "concise" | "balanced" | "detailed";
  technicalLevel: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface TopicOfInterest {
  topic: string;
  weight: number;
  lastMentioned: string;
}

export interface ExpertiseLevel {
  [domain: string]: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface CommunicationPreferences {
  preferredResponseLength: "short" | "medium" | "long";
  useEmojis: boolean;
  useCodeBlocks: boolean;
  useBulletPoints: boolean;
  preferredLanguage: string;
}

export interface InteractionPatterns {
  averageMessageLength: number;
  commonTimeOfDay: string[];
  frequentActions: string[];
  topCategories: string[];
}

export interface LearningProfile {
  id: string;
  user_id: string;
  writing_style: WritingStyle;
  topics_of_interest: TopicOfInterest[];
  expertise_levels: ExpertiseLevel;
  communication_preferences: CommunicationPreferences;
  interaction_patterns: InteractionPatterns;
  total_messages: number;
  total_conversations: number;
  last_analyzed_at: string | null;
  created_at: string;
  updated_at: string;
}

const DEFAULT_PROFILE: Omit<LearningProfile, "id" | "user_id" | "created_at" | "updated_at"> = {
  writing_style: {
    formality: "neutral",
    verbosity: "balanced",
    technicalLevel: "intermediate",
  },
  topics_of_interest: [],
  expertise_levels: {},
  communication_preferences: {
    preferredResponseLength: "medium",
    useEmojis: true,
    useCodeBlocks: true,
    useBulletPoints: true,
    preferredLanguage: "en",
  },
  interaction_patterns: {
    averageMessageLength: 0,
    commonTimeOfDay: [],
    frequentActions: [],
    topCategories: [],
  },
  total_messages: 0,
  total_conversations: 0,
  last_analyzed_at: null,
};

export function useLearningProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch or create profile
  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("learning_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!data) {
        // Create new profile
        const { data: newProfile, error: createError } = await supabase
          .from("learning_profiles")
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) throw createError;
        setProfile(parseProfile(newProfile));
      } else {
        setProfile(parseProfile(data));
      }
    } catch (error) {
      console.error("Error fetching learning profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Parse JSON fields from database
  const parseProfile = (data: any): LearningProfile => ({
    ...data,
    writing_style: data.writing_style || DEFAULT_PROFILE.writing_style,
    topics_of_interest: data.topics_of_interest || DEFAULT_PROFILE.topics_of_interest,
    expertise_levels: data.expertise_levels || DEFAULT_PROFILE.expertise_levels,
    communication_preferences: data.communication_preferences || DEFAULT_PROFILE.communication_preferences,
    interaction_patterns: data.interaction_patterns || DEFAULT_PROFILE.interaction_patterns,
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update profile field (converts typed objects to JSON for Supabase)
  const updateProfile = useCallback(async (updates: Partial<LearningProfile>) => {
    if (!user || !profile) return;

    try {
      // Cast complex objects to JSON-compatible format for Supabase
      const dbUpdates: Record<string, any> = {};
      for (const [key, value] of Object.entries(updates)) {
        dbUpdates[key] = value;
      }

      const { error } = await supabase
        .from("learning_profiles")
        .update(dbUpdates)
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error("Error updating learning profile:", error);
    }
  }, [user, profile]);

  // Analyze message and update profile
  const analyzeMessage = useCallback(async (message: string, role: "user" | "assistant") => {
    if (!profile || role !== "user") return;

    // Extract topics (simple keyword extraction)
    const words = message.toLowerCase().split(/\W+/).filter(w => w.length > 4);
    const techKeywords = ["code", "programming", "javascript", "python", "react", "api", "database", "function", "variable", "algorithm"];
    const businessKeywords = ["meeting", "project", "deadline", "report", "client", "strategy", "budget", "team"];
    const creativeKeywords = ["design", "creative", "idea", "story", "write", "art", "music", "content"];

    // Detect domains
    const detectedDomains: string[] = [];
    if (words.some(w => techKeywords.includes(w))) detectedDomains.push("technology");
    if (words.some(w => businessKeywords.includes(w))) detectedDomains.push("business");
    if (words.some(w => creativeKeywords.includes(w))) detectedDomains.push("creative");

    // Update interaction patterns
    const newPatterns = {
      ...profile.interaction_patterns,
      averageMessageLength: Math.round(
        (profile.interaction_patterns.averageMessageLength * profile.total_messages + message.length) /
        (profile.total_messages + 1)
      ),
      topCategories: [...new Set([...profile.interaction_patterns.topCategories, ...detectedDomains])].slice(0, 5),
    };

    // Detect writing style from message
    const isQuestion = message.includes("?");
    const isLong = message.length > 200;
    const hasTechnicalTerms = words.some(w => techKeywords.includes(w));

    let writingStyle = { ...profile.writing_style };
    if (hasTechnicalTerms && profile.total_messages > 10) {
      writingStyle.technicalLevel = "advanced";
    }
    if (isLong && profile.total_messages > 5) {
      writingStyle.verbosity = "detailed";
    }

    await updateProfile({
      interaction_patterns: newPatterns,
      writing_style: writingStyle,
      total_messages: profile.total_messages + 1,
      last_analyzed_at: new Date().toISOString(),
    });
  }, [profile, updateProfile]);

  // Generate personalized prompt additions
  const getPersonalizationPrompt = useCallback(() => {
    if (!profile || profile.total_messages < 5) return "";

    const parts: string[] = [];

    // Writing style
    if (profile.writing_style.technicalLevel === "advanced" || profile.writing_style.technicalLevel === "expert") {
      parts.push("The user has technical expertise - feel free to use technical terminology.");
    }
    if (profile.writing_style.verbosity === "concise") {
      parts.push("The user prefers concise responses.");
    } else if (profile.writing_style.verbosity === "detailed") {
      parts.push("The user appreciates detailed explanations.");
    }

    // Topics of interest
    if (profile.topics_of_interest.length > 0) {
      const topTopics = profile.topics_of_interest
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 3)
        .map(t => t.topic);
      parts.push(`User is interested in: ${topTopics.join(", ")}.`);
    }

    // Expertise levels
    const expertAreas = Object.entries(profile.expertise_levels)
      .filter(([_, level]) => level === "advanced" || level === "expert")
      .map(([area]) => area);
    if (expertAreas.length > 0) {
      parts.push(`User has expertise in: ${expertAreas.join(", ")}.`);
    }

    if (parts.length === 0) return "";
    return `\n\n**User Profile Insights:**\n${parts.join("\n")}`;
  }, [profile]);

  // Set expertise level for a domain
  const setExpertise = useCallback(async (domain: string, level: "beginner" | "intermediate" | "advanced" | "expert") => {
    if (!profile) return;

    const newExpertise = {
      ...profile.expertise_levels,
      [domain]: level,
    };

    await updateProfile({ expertise_levels: newExpertise });
  }, [profile, updateProfile]);

  // Update communication preferences
  const setPreferences = useCallback(async (preferences: Partial<CommunicationPreferences>) => {
    if (!profile) return;

    const newPrefs = {
      ...profile.communication_preferences,
      ...preferences,
    };

    await updateProfile({ communication_preferences: newPrefs });
  }, [profile, updateProfile]);

  return {
    profile,
    isLoading,
    updateProfile,
    analyzeMessage,
    getPersonalizationPrompt,
    setExpertise,
    setPreferences,
    refetch: fetchProfile,
  };
}
