import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface TemplateVariable {
  name: string;
  description?: string;
  defaultValue?: string;
}

export interface SmartTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  content: string;
  variables: TemplateVariable[];
  category: string;
  icon: string;
  usage_count: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

// Default templates for new users
const DEFAULT_TEMPLATES: Omit<SmartTemplate, "id" | "user_id" | "created_at" | "updated_at">[] = [
  {
    name: "Code Review",
    description: "Get a thorough code review with suggestions",
    content: "Please review this {{language}} code and provide:\n1. Code quality assessment\n2. Potential bugs or issues\n3. Performance improvements\n4. Best practices suggestions\n\n```{{language}}\n{{code}}\n```",
    variables: [
      { name: "language", description: "Programming language", defaultValue: "javascript" },
      { name: "code", description: "Code to review" }
    ],
    category: "coding",
    icon: "Code",
    usage_count: 0,
    is_favorite: false,
  },
  {
    name: "Email Draft",
    description: "Draft a professional email",
    content: "Write a {{tone}} email to {{recipient}} about {{subject}}.\n\nKey points to include:\n{{points}}\n\nSign off as {{name}}.",
    variables: [
      { name: "tone", description: "Email tone", defaultValue: "professional" },
      { name: "recipient", description: "Who is this for" },
      { name: "subject", description: "Email subject" },
      { name: "points", description: "Key points to cover" },
      { name: "name", description: "Your name" }
    ],
    category: "writing",
    icon: "Mail",
    usage_count: 0,
    is_favorite: false,
  },
  {
    name: "Explain Like I'm 5",
    description: "Get simple explanations of complex topics",
    content: "Explain {{topic}} in simple terms that a 5-year-old could understand. Use analogies and examples from everyday life.",
    variables: [
      { name: "topic", description: "Topic to explain" }
    ],
    category: "learning",
    icon: "Lightbulb",
    usage_count: 0,
    is_favorite: false,
  },
  {
    name: "Meeting Summary",
    description: "Summarize meeting notes into action items",
    content: "Summarize these meeting notes into:\n1. Key decisions made\n2. Action items with owners\n3. Next steps and deadlines\n4. Open questions\n\nMeeting notes:\n{{notes}}",
    variables: [
      { name: "notes", description: "Raw meeting notes" }
    ],
    category: "productivity",
    icon: "FileText",
    usage_count: 0,
    is_favorite: false,
  },
  {
    name: "Debug Helper",
    description: "Get help debugging code issues",
    content: "I'm getting this error in my {{language}} code:\n\nError: {{error}}\n\nCode:\n```{{language}}\n{{code}}\n```\n\nPlease help me:\n1. Understand what's causing this error\n2. Fix the issue\n3. Prevent similar issues in the future",
    variables: [
      { name: "language", description: "Programming language", defaultValue: "javascript" },
      { name: "error", description: "Error message" },
      { name: "code", description: "Problematic code" }
    ],
    category: "coding",
    icon: "Bug",
    usage_count: 0,
    is_favorite: false,
  },
];

export const TEMPLATE_CATEGORIES = [
  { id: "all", name: "All Templates", icon: "Sparkles" },
  { id: "coding", name: "Coding", icon: "Code" },
  { id: "writing", name: "Writing", icon: "PenTool" },
  { id: "learning", name: "Learning", icon: "GraduationCap" },
  { id: "productivity", name: "Productivity", icon: "Target" },
  { id: "general", name: "General", icon: "Layers" },
];

export function useSmartTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<SmartTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Parse database row to SmartTemplate
  const parseTemplate = (row: any): SmartTemplate => ({
    ...row,
    variables: (Array.isArray(row.variables) ? row.variables : []) as TemplateVariable[],
  });

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("smart_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("usage_count", { ascending: false });

      if (error) throw error;

      // If no templates exist, create defaults
      if (!data || data.length === 0) {
        await createDefaultTemplates();
        return;
      }

      setTemplates(data.map(parseTemplate));
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create default templates for new users
  const createDefaultTemplates = useCallback(async () => {
    if (!user) return;

    try {
      const templatesWithUser = DEFAULT_TEMPLATES.map(t => ({
        ...t,
        user_id: user.id,
        variables: t.variables as unknown as any, // Cast for Supabase JSON
      }));

      const { data, error } = await supabase
        .from("smart_templates")
        .insert(templatesWithUser)
        .select();

      if (error) throw error;

      setTemplates((data || []).map(parseTemplate));
    } catch (error) {
      console.error("Error creating default templates:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Fill template with values
  const fillTemplate = useCallback((template: SmartTemplate, values: Record<string, string>) => {
    let content = template.content;
    
    template.variables.forEach(variable => {
      const value = values[variable.name] || variable.defaultValue || `[${variable.name}]`;
      const regex = new RegExp(`{{${variable.name}}}`, "g");
      content = content.replace(regex, value);
    });

    return content;
  }, []);

  // Add new template
  const addTemplate = useCallback(async (template: Omit<SmartTemplate, "id" | "user_id" | "created_at" | "updated_at" | "usage_count">) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("smart_templates")
        .insert({
          ...template,
          variables: template.variables as unknown as any, // Cast for Supabase JSON
          user_id: user.id,
          usage_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      const parsed = parseTemplate(data);
      setTemplates(prev => [parsed, ...prev]);
      toast.success("Template created");
      return parsed;
    } catch (error) {
      console.error("Error adding template:", error);
      toast.error("Failed to create template");
      return null;
    }
  }, [user]);

  // Update template
  const updateTemplate = useCallback(async (id: string, updates: Partial<Omit<SmartTemplate, "variables">> & { variables?: any }) => {
    try {
      const { error } = await supabase
        .from("smart_templates")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setTemplates(prev =>
        prev.map(t => t.id === id ? { ...t, ...updates } : t)
      );
      toast.success("Template updated");
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template");
    }
  }, []);

  // Delete template
  const deleteTemplate = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("smart_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success("Template deleted");
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  }, []);

  // Increment usage count
  const useTemplate = useCallback(async (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;

    try {
      await supabase
        .from("smart_templates")
        .update({ usage_count: template.usage_count + 1 })
        .eq("id", id);

      setTemplates(prev =>
        prev.map(t => t.id === id ? { ...t, usage_count: t.usage_count + 1 } : t)
      );
    } catch (error) {
      console.error("Error updating usage count:", error);
    }
  }, [templates]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;

    await updateTemplate(id, { is_favorite: !template.is_favorite });
  }, [templates, updateTemplate]);

  return {
    templates,
    isLoading,
    favorites: templates.filter(t => t.is_favorite),
    getByCategory: (category: string) => 
      category === "all" ? templates : templates.filter(t => t.category === category),
    fillTemplate,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
    toggleFavorite,
    refetch: fetchTemplates,
  };
}
