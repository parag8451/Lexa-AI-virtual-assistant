import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

// Allowed file types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function useFileUpload() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = useCallback(async (files: File[]): Promise<UploadedFile[]> => {
    if (!user) {
      toast.error("Please sign in to upload files");
      return [];
    }

    setIsUploading(true);
    const uploaded: UploadedFile[] = [];

    try {
      for (const file of files) {
        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
          toast.error(`File type not allowed: ${file.name}`);
          continue;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`File too large (max 10MB): ${file.name}`);
          continue;
        }

        const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin";
        // Sanitize filename
        const safeFileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("chat-attachments")
          .upload(safeFileName, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        // Use signed URLs (1 hour expiry) - bucket is private for security
        const { data: signedData, error: signedError } = await supabase.storage
          .from("chat-attachments")
          .createSignedUrl(safeFileName, 3600);

        if (signedError || !signedData?.signedUrl) {
          console.error("Signed URL error:", signedError);
          toast.error(`Failed to get secure URL for ${file.name}`);
          // Do not fall back to public URL - fail securely instead
          continue;
        }

        uploaded.push({
          name: file.name,
          url: signedData.signedUrl,
          type: file.type,
          size: file.size,
        });
      }

      if (uploaded.length > 0) {
        toast.success(`Uploaded ${uploaded.length} file(s)`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
    }

    return uploaded;
  }, [user]);

  return { uploadFiles, isUploading };
}
