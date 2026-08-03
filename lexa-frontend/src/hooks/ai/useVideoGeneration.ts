import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface GeneratedVideo {
  id: string;
  user_id: string;
  conversation_id: string | null;
  prompt: string;
  revised_prompt: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  file_path: string | null;
  model: string;
  aspect_ratio: string;
  duration: number;
  status: "pending" | "processing" | "completed" | "failed";
  error_message: string | null;
  created_at: string;
}

export type VideoAspectRatio = "16:9" | "9:16" | "1:1" | "4:3";
export type VideoDuration = 5 | 10;

export function useVideoGeneration() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVideos = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("video_generations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching videos:", error);
    } else {
      setVideos(data as GeneratedVideo[]);
    }

    setIsLoading(false);
  }, [user]);

  const generateVideo = useCallback(async (
    prompt: string,
    options?: {
      aspectRatio?: VideoAspectRatio;
      duration?: VideoDuration;
      startingFrameUrl?: string;
      conversationId?: string;
    }
  ): Promise<GeneratedVideo | null> => {
    if (!user) return null;
    setIsGenerating(true);

    try {
      const { data: record, error: recordError } = await supabase
        .from("video_generations")
        .insert({
          user_id: user.id,
          conversation_id: options?.conversationId || null,
          prompt,
          model: "gemini-video",
          aspect_ratio: options?.aspectRatio || "16:9",
          duration: options?.duration || 5,
          status: "processing",
        })
        .select()
        .single();

      if (recordError) {
        console.error("Record error:", recordError);
        toast.error("Failed to create video request");
        return null;
      }

      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast.error("Not authenticated");
        return null;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({
          prompt,
          aspectRatio: options?.aspectRatio || "16:9",
          duration: options?.duration || 5,
          startingFrameUrl: options?.startingFrameUrl,
          generationId: record.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Video generation failed");
      }

      const result = await response.json();

      const updatedVideo: GeneratedVideo = {
        ...record,
        status: "completed",
        video_url: result.videoUrl,
        revised_prompt: result.revisedPrompt,
      };

      setVideos(prev => [updatedVideo, ...prev.filter(v => v.id !== record.id)]);
      toast.success("Video generated!");
      return updatedVideo;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Generation failed";
      console.error("Video generation error:", error);
      toast.error(errorMsg);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user]);

  const deleteVideo = useCallback(async (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    if (video.file_path) {
      await supabase.storage
        .from("generated-videos")
        .remove([video.file_path]);
    }

    const { error } = await supabase
      .from("video_generations")
      .delete()
      .eq("id", videoId);

    if (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete video");
      return;
    }

    setVideos(prev => prev.filter(v => v.id !== videoId));
    toast.success("Video deleted");
  }, [videos]);

  return {
    videos,
    isGenerating,
    isLoading,
    generateVideo,
    deleteVideo,
    refreshVideos: fetchVideos,
  };
}
