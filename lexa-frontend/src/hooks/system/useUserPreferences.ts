import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type PersonalityType = "professional" | "friendly" | "creative" | "empathetic";

export interface UserPreferences {
  id: string;
  user_id: string;
  personality: PersonalityType;
  voice_enabled: boolean;
  voice_id: string;
  preferred_search_model: string;
  search_cooldown_seconds: number;
  created_at: string;
  updated_at: string;
}

const DEFAULT_PREFERENCES: Partial<UserPreferences> = {
  personality: "friendly",
  voice_enabled: false,
  voice_id: "JBFqnCBsd6RMkjVDRZzb",
  preferred_search_model: "lexa-search-fast",
  search_cooldown_seconds: 30,
};

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        // Create default preferences if none exist
        const { data: newData, error: insertError } = await supabase
          .from("user_preferences")
          .insert({ user_id: user.id, ...DEFAULT_PREFERENCES })
          .select()
          .single();

        if (insertError) throw insertError;
        setPreferences(newData as UserPreferences);
      } else {
        setPreferences(data as UserPreferences);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preferences");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!user || !preferences) return false;

    try {
      const { error: updateError } = await supabase
        .from("user_preferences")
        .update(updates)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setPreferences(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update preferences");
      return false;
    }
  }, [user, preferences]);

  // Personality helpers
  const setPersonality = useCallback((personality: PersonalityType) => {
    return updatePreferences({ personality });
  }, [updatePreferences]);

  const setVoiceEnabled = useCallback((enabled: boolean) => {
    return updatePreferences({ voice_enabled: enabled });
  }, [updatePreferences]);

  const setSearchModel = useCallback((model: string) => {
    return updatePreferences({ preferred_search_model: model });
  }, [updatePreferences]);

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    setPersonality,
    setVoiceEnabled,
    setSearchModel,
    refetch: fetchPreferences,
  };
}
