import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type MemoryType = 
  | "preference" 
  | "fact" 
  | "context" 
  | "conversation_summary" 
  | "interest" 
  | "style";

export interface Memory {
  id: string;
  user_id: string;
  memory_type: MemoryType;
  content: string;
  importance: number;
  last_accessed_at: string;
  created_at: string;
  updated_at: string;
}

export function useMemories() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all memories
  const fetchMemories = useCallback(async () => {
    if (!user) {
      setMemories([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from("user_memories")
        .select("*")
        .eq("user_id", user.id)
        .order("importance", { ascending: false })
        .order("last_accessed_at", { ascending: false });

      if (fetchError) throw fetchError;
      setMemories((data as Memory[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load memories");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  // Add a new memory
  const addMemory = useCallback(async (
    content: string,
    type: MemoryType = "fact",
    importance: number = 5
  ) => {
    if (!user) return null;

    try {
      // Check for similar existing memory to avoid duplicates
      const existing = memories.find(m => 
        m.content.toLowerCase().includes(content.toLowerCase().slice(0, 50)) ||
        content.toLowerCase().includes(m.content.toLowerCase().slice(0, 50))
      );

      if (existing) {
        // Update existing memory's importance and timestamp
        const { data, error } = await supabase
          .from("user_memories")
          .update({ 
            importance: Math.min(10, existing.importance + 1),
            last_accessed_at: new Date().toISOString()
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        setMemories(prev => prev.map(m => m.id === existing.id ? data as Memory : m));
        return data as Memory;
      }

      // Create new memory
      const { data, error } = await supabase
        .from("user_memories")
        .insert({
          user_id: user.id,
          content,
          memory_type: type,
          importance,
        })
        .select()
        .single();

      if (error) throw error;
      setMemories(prev => [data as Memory, ...prev]);
      return data as Memory;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add memory");
      return null;
    }
  }, [user, memories]);

  // Get relevant memories for a query
  const getRelevantMemories = useCallback((query: string, limit: number = 10): Memory[] => {
    if (!query || memories.length === 0) return [];

    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    // Score each memory by relevance
    const scored = memories.map(memory => {
      const contentLower = memory.content.toLowerCase();
      let score = memory.importance;

      // Boost for word matches
      queryWords.forEach(word => {
        if (contentLower.includes(word)) {
          score += 2;
        }
      });

      // Boost for recent access
      const daysSinceAccess = (Date.now() - new Date(memory.last_accessed_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceAccess < 1) score += 3;
      else if (daysSinceAccess < 7) score += 1;

      return { memory, score };
    });

    return scored
      .filter(s => s.score > 3)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.memory);
  }, [memories]);

  // Update a memory
  const updateMemory = useCallback(async (id: string, updates: Partial<Memory>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("user_memories")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      setMemories(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update memory");
      return false;
    }
  }, [user]);

  // Delete a memory
  const deleteMemory = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("user_memories")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      setMemories(prev => prev.filter(m => m.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete memory");
      return false;
    }
  }, [user]);

  // Clear all memories
  const clearAllMemories = useCallback(async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("user_memories")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
      setMemories([]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear memories");
      return false;
    }
  }, [user]);

  // Get formatted memories for AI context
  const getMemoryContext = useCallback((query?: string): string => {
    const relevant = query ? getRelevantMemories(query, 8) : memories.slice(0, 8);
    
    if (relevant.length === 0) return "";

    const grouped = relevant.reduce((acc, mem) => {
      const type = mem.memory_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(mem.content);
      return acc;
    }, {} as Record<string, string[]>);

    const sections = Object.entries(grouped).map(([type, items]) => {
      const label = type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
      return `**${label}:**\n${items.map(i => `- ${i}`).join("\n")}`;
    });

    return `## User Context (from memory)\n${sections.join("\n\n")}`;
  }, [memories, getRelevantMemories]);

  return {
    memories,
    isLoading,
    error,
    addMemory,
    updateMemory,
    deleteMemory,
    clearAllMemories,
    getRelevantMemories,
    getMemoryContext,
    refetch: fetchMemories,
  };
}
