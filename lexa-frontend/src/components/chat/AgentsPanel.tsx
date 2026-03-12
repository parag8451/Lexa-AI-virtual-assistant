import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Bot,
  Search,
  Code,
  BarChart3,
  Palette,
  ListTodo,
  Play,
  Square,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAgents, AgentConfig, AgentRun, AgentStep, AGENT_CONFIGS } from "@/hooks/useAgents";
import { cn } from "@/lib/utils";

const AGENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  research: Search,
  code: Code,
  analysis: BarChart3,
  creative: Palette,
  planning: ListTodo,
};

export function AgentsPanel() {
  const { currentRun, isRunning, runAgent, stopAgent, clearRun } = useAgents();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [goal, setGoal] = useState("");
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const handleRun = async () => {
    if (!selectedAgent || !goal.trim()) return;
    await runAgent(selectedAgent.type, goal);
  };

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const getStepIcon = (step: AgentStep) => {
    switch (step.status) {
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Bot className="h-4 w-4" />
          <span className="hidden sm:inline">Agents</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Agents
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Agent Selection */}
          {!currentRun && !isRunning && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AGENT_CONFIGS.map((agent) => {
                  const Icon = AGENT_ICONS[agent.type] || Bot;
                  return (
                    <button
                      key={agent.type}
                      onClick={() => setSelectedAgent(agent)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                        selectedAgent?.type === agent.type
                          ? "border-primary bg-primary/10"
                          : "hover:border-primary/50 hover:bg-muted"
                      )}
                    >
                      <div className="text-2xl">{agent.icon}</div>
                      <span className="text-sm font-medium">{agent.name}</span>
                    </button>
                  );
                })}
              </div>

              {selectedAgent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3"
                >
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">
                      {selectedAgent.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedAgent.capabilities.map((cap) => (
                        <Badge key={cap} variant="secondary" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Textarea
                    placeholder={`What do you want the ${selectedAgent.name} to do?`}
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    rows={3}
                  />

                  <Button
                    onClick={handleRun}
                    disabled={!goal.trim()}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Agent
                  </Button>
                </motion.div>
              )}
            </>
          )}

          {/* Running State */}
          {(currentRun || isRunning) && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">
                    {selectedAgent?.icon} {selectedAgent?.name || "Agent"} Running
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    Goal: {currentRun?.goal}
                  </p>
                </div>
                {isRunning && (
                  <Button variant="destructive" size="sm" onClick={stopAgent}>
                    <Square className="h-4 w-4 mr-1" />
                    Stop
                  </Button>
                )}
              </div>

              {/* Progress */}
              {currentRun && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <Badge
                      variant={
                        currentRun.status === "completed"
                          ? "default"
                          : currentRun.status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {currentRun.status}
                    </Badge>
                  </div>
                  <Progress
                    value={
                      (currentRun.steps.filter((s) => s.status === "completed").length /
                        Math.max(currentRun.steps.length, 1)) *
                      100
                    }
                  />
                </div>
              )}

              {/* Steps */}
              <ScrollArea className="flex-1">
                <div className="space-y-2 pr-4">
                  {currentRun?.steps.map((step) => (
                    <div
                      key={step.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleStep(step.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                      >
                        {getStepIcon(step)}
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">{step.title}</p>
                          {step.duration && (
                            <p className="text-xs text-muted-foreground">
                              {(step.duration / 1000).toFixed(1)}s
                            </p>
                          )}
                        </div>
                        {expandedSteps.has(step.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {expandedSteps.has(step.id) && step.result && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t bg-muted/30"
                          >
                            <pre className="p-3 text-xs whitespace-pre-wrap overflow-x-auto">
                              {step.result}
                            </pre>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Final Result */}
              {currentRun?.status === "completed" && currentRun.finalResult && (
                <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <h4 className="font-medium text-green-600 mb-2">Final Result</h4>
                  <p className="text-sm whitespace-pre-wrap">
                    {currentRun.finalResult}
                  </p>
                </div>
              )}

              {/* Actions */}
              {currentRun?.status !== "running" && (
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      clearRun();
                      setGoal("");
                    }}
                    className="flex-1"
                  >
                    New Task
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
