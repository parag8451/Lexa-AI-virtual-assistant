import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  priority: "low" | "medium" | "high";
  status: "active" | "completed" | "paused" | "archived";
  progress: number;
  milestones: Milestone[];
  ai_suggestions: string[];
  last_check_in: string | null;
  created_at: string;
  updated_at: string;
}

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all goals
  const fetchGoals = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("user_goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching goals:", error);
    } else {
      setGoals(data.map(g => ({
        ...g,
        priority: g.priority as Goal["priority"],
        status: g.status as Goal["status"],
        milestones: (g.milestones as unknown as Milestone[]) || [],
        ai_suggestions: (g.ai_suggestions as unknown as string[]) || [],
      })));
    }

    setIsLoading(false);
  }, [user]);

  // Create a new goal
  const createGoal = useCallback(async (
    title: string,
    description?: string,
    targetDate?: string,
    priority: Goal["priority"] = "medium"
  ): Promise<Goal | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("user_goals")
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        target_date: targetDate || null,
        priority,
        milestones: [],
        ai_suggestions: [],
      })
      .select()
      .single();

    if (error) {
      console.error("Create goal error:", error);
      toast.error("Failed to create goal");
      return null;
    }

    const newGoal: Goal = {
      ...data,
      priority: data.priority as Goal["priority"],
      status: data.status as Goal["status"],
      milestones: [],
      ai_suggestions: [],
    };

    setGoals(prev => [newGoal, ...prev]);
    toast.success("Goal created!");
    return newGoal;
  }, [user]);

  // Update a goal
  const updateGoal = useCallback(async (
    goalId: string,
    updates: Partial<Pick<Goal, "title" | "description" | "target_date" | "priority" | "status" | "progress" | "milestones" | "ai_suggestions">>
  ): Promise<boolean> => {
    // Convert to JSON-compatible format for Supabase
    const dbUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.target_date !== undefined) dbUpdates.target_date = updates.target_date;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
    if (updates.milestones !== undefined) dbUpdates.milestones = JSON.parse(JSON.stringify(updates.milestones));
    if (updates.ai_suggestions !== undefined) dbUpdates.ai_suggestions = updates.ai_suggestions;

    const { error } = await supabase
      .from("user_goals")
      .update(dbUpdates)
      .eq("id", goalId);

    if (error) {
      console.error("Update goal error:", error);
      toast.error("Failed to update goal");
      return false;
    }

    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, ...updates, updated_at: new Date().toISOString() }
        : g
    ));
    return true;
  }, []);

  // Delete a goal
  const deleteGoal = useCallback(async (goalId: string) => {
    const { error } = await supabase
      .from("user_goals")
      .delete()
      .eq("id", goalId);

    if (error) {
      console.error("Delete goal error:", error);
      toast.error("Failed to delete goal");
      return;
    }

    setGoals(prev => prev.filter(g => g.id !== goalId));
    toast.success("Goal deleted");
  }, []);

  // Add a milestone
  const addMilestone = useCallback(async (goalId: string, title: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newMilestone: Milestone = {
      id: `ms-${Date.now()}`,
      title,
      completed: false,
    };

    const updatedMilestones = [...goal.milestones, newMilestone];
    await updateGoal(goalId, { milestones: updatedMilestones });
  }, [goals, updateGoal]);

  // Toggle milestone completion
  const toggleMilestone = useCallback(async (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map(m =>
      m.id === milestoneId
        ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : undefined }
        : m
    );

    // Calculate progress
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const progress = updatedMilestones.length > 0 
      ? Math.round((completedCount / updatedMilestones.length) * 100)
      : 0;

    await updateGoal(goalId, { milestones: updatedMilestones, progress });
  }, [goals, updateGoal]);

  // Complete a goal
  const completeGoal = useCallback(async (goalId: string) => {
    await updateGoal(goalId, { status: "completed", progress: 100 });
    toast.success("🎉 Congratulations! Goal completed!");
  }, [updateGoal]);

  // Get active goals
  const getActiveGoals = useCallback(() => {
    return goals.filter(g => g.status === "active");
  }, [goals]);

  // Get goals due soon (within 7 days)
  const getUpcomingGoals = useCallback(() => {
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    
    return goals.filter(g => {
      if (!g.target_date || g.status !== "active") return false;
      const targetDate = new Date(g.target_date);
      return targetDate <= weekFromNow && targetDate >= new Date();
    });
  }, [goals]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user, fetchGoals]);

  return {
    goals,
    isLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    addMilestone,
    toggleMilestone,
    completeGoal,
    getActiveGoals,
    getUpcomingGoals,
    refreshGoals: fetchGoals,
  };
}
