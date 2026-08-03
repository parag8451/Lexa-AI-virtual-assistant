import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type ScheduleType = "once" | "daily" | "weekly" | "monthly";

export interface ScheduledTask {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  prompt: string;
  schedule_type: ScheduleType;
  schedule_time: string | null; // HH:MM format
  schedule_day: number | null; // 0-6 for weekly, 1-31 for monthly
  next_run_at: string | null;
  last_run_at: string | null;
  last_result: string | null;
  run_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useScheduledTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("scheduled_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      setTasks(data as ScheduledTask[]);
    }

    setIsLoading(false);
  }, [user]);

  // Calculate next run time
  const calculateNextRun = (
    scheduleType: ScheduleType,
    scheduleTime?: string,
    scheduleDay?: number
  ): Date | null => {
    const now = new Date();
    
    if (scheduleType === "once") {
      return null;
    }

    const [hours, minutes] = (scheduleTime || "09:00").split(":").map(Number);
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    switch (scheduleType) {
      case "daily":
        if (next <= now) {
          next.setDate(next.getDate() + 1);
        }
        break;
      case "weekly":
        const targetDay = scheduleDay ?? 1; // Monday by default
        const currentDay = next.getDay();
        const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
        if (next <= now || currentDay !== targetDay) {
          next.setDate(next.getDate() + daysUntil);
        } else if (next <= now) {
          next.setDate(next.getDate() + 7);
        }
        break;
      case "monthly":
        const targetDate = scheduleDay ?? 1;
        next.setDate(targetDate);
        if (next <= now) {
          next.setMonth(next.getMonth() + 1);
        }
        break;
    }

    return next;
  };

  // Create a new task
  const createTask = useCallback(async (
    name: string,
    prompt: string,
    scheduleType: ScheduleType,
    description?: string,
    scheduleTime?: string,
    scheduleDay?: number
  ): Promise<ScheduledTask | null> => {
    if (!user) return null;

    const nextRun = calculateNextRun(scheduleType, scheduleTime, scheduleDay);

    const { data, error } = await supabase
      .from("scheduled_tasks")
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        prompt,
        schedule_type: scheduleType,
        schedule_time: scheduleTime || null,
        schedule_day: scheduleDay || null,
        next_run_at: nextRun?.toISOString() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Create task error:", error);
      toast.error("Failed to create scheduled task");
      return null;
    }

    setTasks(prev => [data as ScheduledTask, ...prev]);
    toast.success("Scheduled task created!");
    return data as ScheduledTask;
  }, [user]);

  // Update a task
  const updateTask = useCallback(async (
    taskId: string,
    updates: Partial<Pick<ScheduledTask, "name" | "description" | "prompt" | "schedule_type" | "schedule_time" | "schedule_day" | "is_active">>
  ): Promise<boolean> => {
    let nextRun: Date | null = null;
    
    if (updates.schedule_type || updates.schedule_time || updates.schedule_day) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        nextRun = calculateNextRun(
          updates.schedule_type || task.schedule_type,
          updates.schedule_time || task.schedule_time || undefined,
          updates.schedule_day ?? task.schedule_day ?? undefined
        );
      }
    }

    const { error } = await supabase
      .from("scheduled_tasks")
      .update({
        ...updates,
        ...(nextRun && { next_run_at: nextRun.toISOString() }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (error) {
      console.error("Update task error:", error);
      toast.error("Failed to update task");
      return false;
    }

    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, ...updates, ...(nextRun && { next_run_at: nextRun.toISOString() }), updated_at: new Date().toISOString() }
        : t
    ));
    return true;
  }, [tasks]);

  // Delete a task
  const deleteTask = useCallback(async (taskId: string) => {
    const { error } = await supabase
      .from("scheduled_tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      console.error("Delete task error:", error);
      toast.error("Failed to delete task");
      return;
    }

    setTasks(prev => prev.filter(t => t.id !== taskId));
    toast.success("Task deleted");
  }, []);

  // Toggle task active status
  const toggleActive = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    await updateTask(taskId, { is_active: !task.is_active });
    toast.success(task.is_active ? "Task paused" : "Task activated");
  }, [tasks, updateTask]);

  // Run a task manually
  const runTask = useCallback(async (taskId: string): Promise<string | null> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      toast.error("Not authenticated");
      return null;
    }

    try {
      toast.loading("Running task...", { id: "task-run" });

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: task.prompt }],
          model: "google/gemini-2.5-flash",
        }),
      });

      if (!response.ok) throw new Error("Request failed");

      const text = await response.text();
      let result = "";
      
      // Parse SSE response
      const lines = text.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          try {
            const json = JSON.parse(line.slice(6));
            if (json.choices?.[0]?.delta?.content) {
              result += json.choices[0].delta.content;
            }
          } catch {}
        }
      }

      // Update task with result
      const nextRun = calculateNextRun(task.schedule_type, task.schedule_time || undefined, task.schedule_day ?? undefined);
      
      await supabase
        .from("scheduled_tasks")
        .update({
          last_run_at: new Date().toISOString(),
          last_result: result.slice(0, 5000), // Limit result size
          run_count: task.run_count + 1,
          next_run_at: nextRun?.toISOString() || null,
        })
        .eq("id", taskId);

      setTasks(prev => prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              last_run_at: new Date().toISOString(),
              last_result: result.slice(0, 5000),
              run_count: t.run_count + 1,
              next_run_at: nextRun?.toISOString() || null,
            }
          : t
      ));

      toast.success("Task completed!", { id: "task-run" });
      return result;
    } catch (error) {
      console.error("Run task error:", error);
      toast.error("Task failed", { id: "task-run" });
      return null;
    }
  }, [tasks]);

  // Get active tasks
  const getActiveTasks = useCallback(() => {
    return tasks.filter(t => t.is_active);
  }, [tasks]);

  // Get upcoming tasks
  const getUpcomingTasks = useCallback(() => {
    return tasks
      .filter(t => t.is_active && t.next_run_at)
      .sort((a, b) => new Date(a.next_run_at!).getTime() - new Date(b.next_run_at!).getTime());
  }, [tasks]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  return {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    toggleActive,
    runTask,
    getActiveTasks,
    getUpcomingTasks,
    refreshTasks: fetchTasks,
  };
}
