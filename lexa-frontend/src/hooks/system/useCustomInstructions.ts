import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface CustomInstruction {
  id: string;
  user_id: string;
  name: string;
  content: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export function useCustomInstructions() {
  const { user } = useAuth();
  const [instructions, setInstructions] = useState<CustomInstruction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all instructions
  const fetchInstructions = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("custom_instructions")
        .select("*")
        .eq("user_id", user.id)
        .order("priority", { ascending: false });

      if (error) throw error;
      setInstructions((data as CustomInstruction[]) || []);
    } catch (error) {
      console.error("Error fetching instructions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInstructions();
  }, [fetchInstructions]);

  // Get active instructions combined as a single prompt
  const getActiveInstructionsPrompt = useCallback(() => {
    const activeInstructions = instructions.filter(i => i.is_active);
    if (activeInstructions.length === 0) return "";

    const combined = activeInstructions
      .sort((a, b) => b.priority - a.priority)
      .map(i => i.content)
      .join("\n\n");

    return `\n\n**User's Custom Instructions:**\n${combined}`;
  }, [instructions]);

  // Add new instruction
  const addInstruction = useCallback(async (name: string, content: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("custom_instructions")
        .insert({
          user_id: user.id,
          name,
          content,
          is_active: true,
          priority: instructions.length,
        })
        .select()
        .single();

      if (error) throw error;
      
      setInstructions(prev => [...prev, data as CustomInstruction]);
      toast.success("Custom instruction added");
      return data as CustomInstruction;
    } catch (error) {
      console.error("Error adding instruction:", error);
      toast.error("Failed to add instruction");
      return null;
    }
  }, [user, instructions.length]);

  // Update instruction
  const updateInstruction = useCallback(async (
    id: string, 
    updates: Partial<Pick<CustomInstruction, "name" | "content" | "is_active" | "priority">>
  ) => {
    try {
      const { error } = await supabase
        .from("custom_instructions")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setInstructions(prev => 
        prev.map(i => i.id === id ? { ...i, ...updates } : i)
      );
      toast.success("Instruction updated");
    } catch (error) {
      console.error("Error updating instruction:", error);
      toast.error("Failed to update instruction");
    }
  }, []);

  // Delete instruction
  const deleteInstruction = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("custom_instructions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setInstructions(prev => prev.filter(i => i.id !== id));
      toast.success("Instruction deleted");
    } catch (error) {
      console.error("Error deleting instruction:", error);
      toast.error("Failed to delete instruction");
    }
  }, []);

  // Toggle instruction active state
  const toggleInstruction = useCallback(async (id: string) => {
    const instruction = instructions.find(i => i.id === id);
    if (!instruction) return;

    await updateInstruction(id, { is_active: !instruction.is_active });
  }, [instructions, updateInstruction]);

  return {
    instructions,
    isLoading,
    activeCount: instructions.filter(i => i.is_active).length,
    getActiveInstructionsPrompt,
    addInstruction,
    updateInstruction,
    deleteInstruction,
    toggleInstruction,
    refetch: fetchInstructions,
  };
}
