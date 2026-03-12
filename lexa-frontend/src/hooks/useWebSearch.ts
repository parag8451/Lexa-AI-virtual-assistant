import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/lib/streaming";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface Citation {
  title: string;
  url: string;
  snippet?: string;
}

export interface WebSearchResult {
  content: string;
  citations: Citation[];
  rateLimited?: boolean;
  retryAfter?: number;
}

export function useWebSearch() {
  const search = useCallback(async (
    query: string,
    conversationHistory: ChatMessage[] = [],
    searchModel?: string
  ): Promise<WebSearchResult> => {
    // Get the current user's session token for authenticated requests
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error("Please sign in to use web search");
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/web-search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ query, conversationHistory, searchModel }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Please sign in to use web search");
      }
      if (response.status === 413) {
        throw new Error("Query too long. Please shorten your search.");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Web search failed");
    }

    const result = await response.json();
    
    // Check for rate limiting response (200 but with rate_limited flag)
    if (result.rate_limited) {
      return {
        content: result.content,
        citations: [],
        rateLimited: true,
        retryAfter: result.retry_after_seconds || 30,
      };
    }

    return result;
  }, []);

  return { search };
}
