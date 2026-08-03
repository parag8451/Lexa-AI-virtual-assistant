import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Artifact {
  id: string;
  user_id: string;
  conversation_id: string | null;
  title: string;
  content: string;
  artifact_type: "code" | "document" | "diagram" | "table" | "image";
  language: string | null;
  is_pinned: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function useArtifacts() {
  const { user } = useAuth();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all artifacts
  const fetchArtifacts = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("artifacts")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching artifacts:", error);
    } else {
      setArtifacts(data as Artifact[]);
    }

    setIsLoading(false);
  }, [user]);

  // Create a new artifact
  const createArtifact = useCallback(async (
    title: string,
    content: string,
    artifactType: Artifact["artifact_type"] = "code",
    language?: string,
    conversationId?: string
  ): Promise<Artifact | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("artifacts")
      .insert({
        user_id: user.id,
        conversation_id: conversationId || null,
        title,
        content,
        artifact_type: artifactType,
        language: language || null,
        metadata: {},
      })
      .select()
      .single();

    if (error) {
      console.error("Create artifact error:", error);
      toast.error("Failed to create artifact");
      return null;
    }

    setArtifacts(prev => [data as Artifact, ...prev]);
    toast.success("Artifact created!");
    return data as Artifact;
  }, [user]);

  // Update an artifact
  const updateArtifact = useCallback(async (
    artifactId: string,
    updates: Partial<Pick<Artifact, "title" | "content" | "language" | "is_pinned" | "metadata">>
  ): Promise<boolean> => {
    const { error } = await supabase
      .from("artifacts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", artifactId);

    if (error) {
      console.error("Update artifact error:", error);
      toast.error("Failed to update artifact");
      return false;
    }

    setArtifacts(prev => prev.map(a => 
      a.id === artifactId 
        ? { ...a, ...updates, updated_at: new Date().toISOString() }
        : a
    ));
    return true;
  }, []);

  // Delete an artifact
  const deleteArtifact = useCallback(async (artifactId: string) => {
    const { error } = await supabase
      .from("artifacts")
      .delete()
      .eq("id", artifactId);

    if (error) {
      console.error("Delete artifact error:", error);
      toast.error("Failed to delete artifact");
      return;
    }

    setArtifacts(prev => prev.filter(a => a.id !== artifactId));
    toast.success("Artifact deleted");
  }, []);

  // Toggle pin status
  const togglePin = useCallback(async (artifactId: string) => {
    const artifact = artifacts.find(a => a.id === artifactId);
    if (!artifact) return;

    await updateArtifact(artifactId, { is_pinned: !artifact.is_pinned });
  }, [artifacts, updateArtifact]);

  // Get artifacts for a conversation
  const getConversationArtifacts = useCallback((conversationId: string): Artifact[] => {
    return artifacts.filter(a => a.conversation_id === conversationId);
  }, [artifacts]);

  // Get pinned artifacts
  const getPinnedArtifacts = useCallback((): Artifact[] => {
    return artifacts.filter(a => a.is_pinned);
  }, [artifacts]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchArtifacts();
    }
  }, [user, fetchArtifacts]);

  return {
    artifacts,
    isLoading,
    createArtifact,
    updateArtifact,
    deleteArtifact,
    togglePin,
    getConversationArtifacts,
    getPinnedArtifacts,
    refreshArtifacts: fetchArtifacts,
  };
}
