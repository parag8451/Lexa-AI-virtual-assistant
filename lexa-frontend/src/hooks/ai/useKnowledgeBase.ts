import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface KnowledgeDocument {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  file_path: string;
  file_type: string;
  file_size: number;
  content_text: string | null;
  embedding_status: "pending" | "processing" | "completed" | "failed";
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function useKnowledgeBase() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch all documents
  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("knowledge_documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load knowledge base");
    } else {
      setDocuments(data as KnowledgeDocument[]);
    }

    setIsLoading(false);
  }, [user]);

  // Upload a document
  const uploadDocument = useCallback(async (
    file: File,
    description?: string
  ): Promise<KnowledgeDocument | null> => {
    if (!user) return null;
    setIsUploading(true);

    try {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "text/plain",
        "text/markdown",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Unsupported file type. Please upload PDF, TXT, MD, or DOC files.");
        return null;
      }

      // Max 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 10MB.");
        return null;
      }

      // Upload to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("knowledge-documents")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Failed to upload file");
        return null;
      }

      // Extract text for simple text files
      let contentText: string | null = null;
      if (file.type === "text/plain" || file.type === "text/markdown") {
        contentText = await file.text();
      }

      // Create database record
      const { data, error } = await supabase
        .from("knowledge_documents")
        .insert({
          user_id: user.id,
          name: file.name,
          description: description || null,
          file_path: fileName,
          file_type: file.type,
          file_size: file.size,
          content_text: contentText,
          embedding_status: contentText ? "completed" : "pending",
          metadata: {},
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        toast.error("Failed to save document");
        return null;
      }

      setDocuments(prev => [data as KnowledgeDocument, ...prev]);
      toast.success("Document uploaded successfully!");
      return data as KnowledgeDocument;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Something went wrong");
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [user]);

  // Delete a document
  const deleteDocument = useCallback(async (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (!doc) return;

    // Delete from storage
    await supabase.storage
      .from("knowledge-documents")
      .remove([doc.file_path]);

    // Delete from database
    const { error } = await supabase
      .from("knowledge_documents")
      .delete()
      .eq("id", documentId);

    if (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
      return;
    }

    setDocuments(prev => prev.filter(d => d.id !== documentId));
    toast.success("Document deleted");
  }, [documents]);

  // Search documents by content
  const searchDocuments = useCallback((query: string): KnowledgeDocument[] => {
    if (!query.trim()) return documents;
    
    const lowerQuery = query.toLowerCase();
    return documents.filter(doc => 
      doc.name.toLowerCase().includes(lowerQuery) ||
      doc.description?.toLowerCase().includes(lowerQuery) ||
      doc.content_text?.toLowerCase().includes(lowerQuery)
    );
  }, [documents]);

  // Get relevant context for a query (simple keyword matching for now)
  const getRelevantContext = useCallback((query: string, maxChars = 2000): string => {
    const lowerQuery = query.toLowerCase();
    const keywords = lowerQuery.split(/\s+/).filter(k => k.length > 2);
    
    let relevantContent = "";
    
    for (const doc of documents) {
      if (!doc.content_text) continue;
      
      // Check if document is relevant
      const docLower = doc.content_text.toLowerCase();
      const isRelevant = keywords.some(k => docLower.includes(k));
      
      if (isRelevant && relevantContent.length < maxChars) {
        const snippet = doc.content_text.slice(0, 500);
        relevantContent += `\n[From ${doc.name}]: ${snippet}...\n`;
      }
    }
    
    return relevantContent.slice(0, maxChars);
  }, [documents]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, fetchDocuments]);

  return {
    documents,
    isLoading,
    isUploading,
    uploadDocument,
    deleteDocument,
    searchDocuments,
    getRelevantContext,
    refreshDocuments: fetchDocuments,
  };
}
