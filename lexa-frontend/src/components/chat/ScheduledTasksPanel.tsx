import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Clock,
  Plus,
  Trash2,
  Play,
  Pause,
  Calendar,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useScheduledTasks, ScheduledTask, ScheduleType } from "@/hooks/useScheduledTasks";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";

const SCHEDULE_LABELS: Record<ScheduleType, string> = {
  once: "One-time",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function ScheduledTasksPanel() {
  const {
    tasks,
    isLoading,
    createTask,
    deleteTask,
    toggleActive,
    runTask,
  } = useScheduledTasks();

  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    prompt: "",
    scheduleType: "daily" as ScheduleType,
    scheduleTime: "09:00",
    scheduleDay: 1,
  });

  const handleCreate = async () => {
    if (!newTask.name.trim() || !newTask.prompt.trim()) return;
    
    await createTask(
      newTask.name,
      newTask.prompt,
      newTask.scheduleType,
      newTask.description || undefined,
      newTask.scheduleTime,
      newTask.scheduleDay
    );
    
    setNewTask({
      name: "",
      description: "",
      prompt: "",
      scheduleType: "daily",
      scheduleTime: "09:00",
      scheduleDay: 1,
    });
    setIsCreating(false);
  };

  const handleRunNow = async (taskId: string) => {
    setRunningTaskId(taskId);
    await runTask(taskId);
    setRunningTaskId(null);
  };

  const getScheduleDescription = (task: ScheduledTask) => {
    const time = task.schedule_time ? format(new Date(`2000-01-01T${task.schedule_time}`), "h:mm a") : "";
    
    switch (task.schedule_type) {
      case "once":
        return "One-time task";
      case "daily":
        return `Every day at ${time}`;
      case "weekly":
        const day = task.schedule_day !== null ? DAYS_OF_WEEK[task.schedule_day] : "Monday";
        return `Every ${day} at ${time}`;
      case "monthly":
        const date = task.schedule_day || 1;
        return `Monthly on the ${date}${getOrdinalSuffix(date)} at ${time}`;
      default:
        return "";
    }
  };

  const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Tasks</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Scheduled Tasks
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Button 
            className="w-full" 
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Scheduled Task
          </Button>

          {/* Create Form */}
          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border rounded-xl p-4 space-y-3"
              >
                <Input
                  placeholder="Task name"
                  value={newTask.name}
                  onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                />
                <Textarea
                  placeholder="AI prompt to execute..."
                  value={newTask.prompt}
                  onChange={(e) => setNewTask(prev => ({ ...prev, prompt: e.target.value }))}
                  rows={3}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newTask.scheduleType}
                    onChange={(e) => setNewTask(prev => ({ 
                      ...prev, 
                      scheduleType: e.target.value as ScheduleType 
                    }))}
                  >
                    <option value="once">One-time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <Input
                    type="time"
                    value={newTask.scheduleTime}
                    onChange={(e) => setNewTask(prev => ({ ...prev, scheduleTime: e.target.value }))}
                  />
                </div>

                {newTask.scheduleType === "weekly" && (
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newTask.scheduleDay}
                    onChange={(e) => setNewTask(prev => ({ 
                      ...prev, 
                      scheduleDay: parseInt(e.target.value) 
                    }))}
                  >
                    {DAYS_OF_WEEK.map((day, i) => (
                      <option key={day} value={i}>{day}</option>
                    ))}
                  </select>
                )}

                {newTask.scheduleType === "monthly" && (
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newTask.scheduleDay}
                    onChange={(e) => setNewTask(prev => ({ 
                      ...prev, 
                      scheduleDay: parseInt(e.target.value) 
                    }))}
                  >
                    {Array.from({ length: 28 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                    ))}
                  </select>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleCreate} className="flex-1">Create</Button>
                  <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tasks List */}
          <ScrollArea className="h-[calc(100vh-280px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No scheduled tasks</p>
                <p className="text-xs mt-1">Schedule recurring AI tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border rounded-xl overflow-hidden"
                  >
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedTaskId(
                        expandedTaskId === task.id ? null : task.id
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-1.5 rounded",
                          task.is_active 
                            ? "bg-green-500/20 text-green-600" 
                            : "bg-muted text-muted-foreground"
                        )}>
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{task.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {SCHEDULE_LABELS[task.schedule_type as ScheduleType]}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getScheduleDescription(task)}
                          </p>
                          {task.next_run_at && task.is_active && (
                            <p className="text-xs text-primary mt-1">
                              Next: {formatDistanceToNow(new Date(task.next_run_at), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                        <Switch
                          checked={task.is_active}
                          onCheckedChange={() => toggleActive(task.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedTaskId === task.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t bg-muted/30"
                        >
                          <div className="p-4 space-y-3">
                            {task.description && (
                              <p className="text-sm text-muted-foreground">
                                {task.description}
                              </p>
                            )}
                            
                            <div className="bg-muted p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Prompt</p>
                              <p className="text-sm">{task.prompt}</p>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <RotateCcw className="h-3 w-3" />
                                {task.run_count} runs
                              </span>
                              {task.last_run_at && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Last: {formatDistanceToNow(new Date(task.last_run_at), { addSuffix: true })}
                                </span>
                              )}
                            </div>

                            {task.last_result && (
                              <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Last Result</p>
                                <p className="text-sm line-clamp-3">{task.last_result}</p>
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() => handleRunNow(task.id)}
                                disabled={runningTaskId === task.id}
                              >
                                {runningTaskId === task.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Play className="h-3 w-3" />
                                )}
                                Run Now
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive gap-1"
                                onClick={() => deleteTask(task.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
