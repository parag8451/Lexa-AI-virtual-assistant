import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface GeneratedImage {
  id: string;
  user_id: string;
  conversation_id: string | null;
  prompt: string;
  revised_prompt: string | null;
  image_url: string | null;
  file_path: string | null;
  model: string;
  size: string;
  quality: string;
  style: string;
  status: "pending" | "processing" | "completed" | "failed";
  error_message: string | null;
  created_at: string;
}

export type ImageSize = "1024x1024" | "1792x1024" | "1024x1792";
export type ImageQuality = "standard" | "hd";
export type ImageStyle = "vivid" | "natural";

export function useImageGeneration() {
  const { user } = useAuth();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch generated images
  const fetchImages = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("image_generations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching images:", error);
    } else {
      setImages(data as GeneratedImage[]);
    }

    setIsLoading(false);
  }, [user]);

  // Generate an image
  const generateImage = useCallback(async (
    prompt: string,
    options?: {
      size?: ImageSize;
      quality?: ImageQuality;
      style?: ImageStyle;
      conversationId?: string;
    }
  ): Promise<GeneratedImage | null> => {
    if (!user) return null;
    setIsGenerating(true);

    try {
      // Create pending record
      const { data: record, error: recordError } = await supabase
        .from("image_generations")
        .insert({
          user_id: user.id,
          conversation_id: options?.conversationId || null,
          prompt,
          model: "gemini-image",
          size: options?.size || "1024x1024",
          quality: options?.quality || "standard",
          style: options?.style || "vivid",
          status: "processing",
        })
        .select()
        .single();

      if (recordError) {
        console.error("Record error:", recordError);
        toast.error("Failed to create image request");
        return null;
      }

      // Call image generation edge function
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast.error("Not authenticated");
        return null;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({
          prompt,
          size: options?.size || "1024x1024",
          quality: options?.quality || "standard",
          style: options?.style || "vivid",
          generationId: record.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Image generation failed");
      }

      const result = await response.json();

      // Update local state
      const updatedImage: GeneratedImage = {
        ...record,
        status: "completed",
        image_url: result.imageUrl,
        revised_prompt: result.revisedPrompt,
      };

      setImages(prev => [updatedImage, ...prev.filter(i => i.id !== record.id)]);
      toast.success("Image generated!");
      return updatedImage;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Generation failed";
      console.error("Image generation error:", error);
      toast.error(errorMsg);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user]);

  // Edit an existing image
  const editImage = useCallback(async (
    prompt: string,
    sourceImageUrl: string,
    options?: {
      conversationId?: string;
    }
  ): Promise<GeneratedImage | null> => {
    if (!user) return null;
    setIsEditing(true);

    try {
      // Create pending record for the edited image
      const { data: record, error: recordError } = await supabase
        .from("image_generations")
        .insert({
          user_id: user.id,
          conversation_id: options?.conversationId || null,
          prompt: `Edit: ${prompt}`,
          model: "gemini-image-edit",
          size: "1024x1024",
          quality: "standard",
          style: "vivid",
          status: "processing",
        })
        .select()
        .single();

      if (recordError) {
        console.error("Record error:", recordError);
        toast.error("Failed to create edit request");
        return null;
      }

      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast.error("Not authenticated");
        return null;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/edit-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({
          prompt,
          imageUrl: sourceImageUrl,
          generationId: record.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Image editing failed");
      }

      const result = await response.json();

      const updatedImage: GeneratedImage = {
        ...record,
        status: "completed",
        image_url: result.imageUrl,
        revised_prompt: result.revisedPrompt,
      };

      setImages(prev => [updatedImage, ...prev.filter(i => i.id !== record.id)]);
      toast.success("Image edited!");
      return updatedImage;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Editing failed";
      console.error("Image editing error:", error);
      toast.error(errorMsg);
      return null;
    } finally {
      setIsEditing(false);
    }
  }, [user]);

  // Delete an image
  const deleteImage = useCallback(async (imageId: string) => {
    const image = images.find(i => i.id === imageId);
    if (!image) return;

    // Delete from storage if applicable
    if (image.file_path) {
      await supabase.storage
        .from("generated-images")
        .remove([image.file_path]);
    }

    // Delete from database
    const { error } = await supabase
      .from("image_generations")
      .delete()
      .eq("id", imageId);

    if (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete image");
      return;
    }

    setImages(prev => prev.filter(i => i.id !== imageId));
    toast.success("Image deleted");
  }, [images]);

  // Get images for a conversation
  const getConversationImages = useCallback((conversationId: string): GeneratedImage[] => {
    return images.filter(i => i.conversation_id === conversationId);
  }, [images]);

  return {
    images,
    isGenerating,
    isEditing,
    isLoading,
    generateImage,
    editImage,
    deleteImage,
    getConversationImages,
    refreshImages: fetchImages,
  };
}
