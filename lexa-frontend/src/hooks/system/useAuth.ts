import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    try {
      // SECURITY: Clear ALL Lexa-related data from localStorage on sign-out.
      const keysToRemove = [
        "lexa_saved_conversations_v3",
        "lexa_gemini_key",
        "lexa_elevenlabs_key",
        "auth_rate_limit",
        "lexa_last_search_time",
        "lexa_notifications",
        "theme",
        "onboarding_completed",
      ];
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
    } catch (e) {}
    
    // Redirect to auth page to force login flow
    try {
      window.location.href = "/auth";
    } catch (e) {}
  };

  return { user, session, loading, signOut };
}
