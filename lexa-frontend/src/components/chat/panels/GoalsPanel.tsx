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
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Calendar,
  Flag,
  Trophy,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { useGoals, Goal, Milestone } from "@/hooks/useGoals";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function GoalsPanel() {
  const {
    goals,
    isLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    addMilestone,
    toggleMilestone,
    completeGoal,
  } = useGoals();

  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState("");
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    targetDate: "",
    priority: "medium" as Goal["priority"],
  });

  const handleCreate = async () => {
    if (!newGoal.title.trim()) return;
    
    await createGoal(
      newGoal.title,
      newGoal.description || undefined,
      newGoal.targetDate || undefined,
      newGoal.priority
    );
    
    setNewGoal({ title: "", description: "", targetDate: "", priority: "medium" });
    setIsCreating(false);
  };

  const handleAddMilestone = async (goalId: string) => {
    if (!newMilestone.trim()) return;
    await addMilestone(goalId, newMilestone);
    setNewMilestone("");
  };

  const getPriorityColor = (priority: Goal["priority"]) => {
    switch (priority) {
      case "high": return "text-red-500 border-red-500";
      case "medium": return "text-yellow-500 border-yellow-500";
      case "low": return "text-green-500 border-green-500";
    }
  };

  const getStatusBadge = (status: Goal["status"]) => {
    switch (status) {
      case "active": return <Badge className="bg-blue-500/20 text-blue-600">Active</Badge>;
      case "completed": return <Badge className="bg-green-500/20 text-green-600">Completed</Badge>;
      case "paused": return <Badge className="bg-yellow-500/20 text-yellow-600">Paused</Badge>;
      case "archived": return <Badge variant="secondary">Archived</Badge>;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Target className="h-4 w-4" />
          <span className="hidden sm:inline">Goals</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Goal Tracker
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Create Button */}
          <Button 
            className="w-full" 
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Goal
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
                  placeholder="Goal title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                    className="flex-1"
                  />
                  <select
                    className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal(prev => ({ 
                      ...prev, 
                      priority: e.target.value as Goal["priority"] 
                    }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreate} className="flex-1">Create</Button>
                  <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Goals List */}
          <ScrollArea className="h-[calc(100vh-280px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No goals yet</p>
                <p className="text-xs mt-1">Set goals and let Lexa help you achieve them</p>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="border rounded-xl overflow-hidden"
                  >
                    {/* Goal Header */}
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedGoalId(
                        expandedGoalId === goal.id ? null : goal.id
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-1.5 rounded border",
                          getPriorityColor(goal.priority)
                        )}>
                          <Flag className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{goal.title}</h4>
                            {getStatusBadge(goal.status)}
                          </div>
                          {goal.target_date && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(goal.target_date), "MMM d, yyyy")}
                            </p>
                          )}
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-1.5" />
                          </div>
                        </div>
                        {expandedGoalId === goal.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedGoalId === goal.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t bg-muted/30"
                        >
                          <div className="p-4 space-y-4">
                            {goal.description && (
                              <p className="text-sm text-muted-foreground">
                                {goal.description}
                              </p>
                            )}

                            {/* Milestones */}
                            <div>
                              <h5 className="text-sm font-medium mb-2">Milestones</h5>
                              <div className="space-y-2">
                                {goal.milestones.map((milestone) => (
                                  <div
                                    key={milestone.id}
                                    className="flex items-center gap-2"
                                  >
                                    <button
                                      onClick={() => toggleMilestone(goal.id, milestone.id)}
                                      className={cn(
                                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                        milestone.completed
                                          ? "bg-green-500 border-green-500"
                                          : "hover:border-primary"
                                      )}
                                    >
                                      {milestone.completed && (
                                        <Check className="h-3 w-3 text-white" />
                                      )}
                                    </button>
                                    <span className={cn(
                                      "text-sm",
                                      milestone.completed && "line-through text-muted-foreground"
                                    )}>
                                      {milestone.title}
                                    </span>
                                  </div>
                                ))}
                                
                                {/* Add Milestone */}
                                <div className="flex gap-2 mt-2">
                                  <Input
                                    placeholder="Add milestone..."
                                    value={newMilestone}
                                    onChange={(e) => setNewMilestone(e.target.value)}
                                    className="h-8 text-sm"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleAddMilestone(goal.id);
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleAddMilestone(goal.id)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                              {goal.status === "active" && goal.progress < 100 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1"
                                  onClick={() => completeGoal(goal.id)}
                                >
                                  <Trophy className="h-3 w-3" />
                                  Complete
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive gap-1"
                                onClick={() => deleteGoal(goal.id)}
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
