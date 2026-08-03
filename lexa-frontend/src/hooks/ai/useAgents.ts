import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface AgentStep {
  id: string;
  type: "think" | "search" | "execute" | "code" | "analyze" | "summarize";
  title: string;
  content: string;
  status: "pending" | "running" | "completed" | "failed";
  duration?: number;
  result?: string;
}

export interface AgentRun {
  id: string;
  goal: string;
  steps: AgentStep[];
  status: "running" | "completed" | "failed" | "paused";
  startedAt: string;
  completedAt?: string;
  finalResult?: string;
}

export type AgentType = "research" | "code" | "analysis" | "creative" | "planning";

export interface AgentConfig {
  type: AgentType;
  name: string;
  description: string;
  icon: string;
  capabilities: string[];
}

export const AGENT_CONFIGS: AgentConfig[] = [
  {
    type: "research",
    name: "Research Agent",
    description: "Deep research and information gathering",
    icon: "🔍",
    capabilities: ["Web search", "Data synthesis", "Source verification", "Report generation"],
  },
  {
    type: "code",
    name: "Code Agent",
    description: "Code generation, review, and debugging",
    icon: "💻",
    capabilities: ["Code generation", "Bug fixing", "Code review", "Refactoring"],
  },
  {
    type: "analysis",
    name: "Analysis Agent",
    description: "Data analysis and insights extraction",
    icon: "📊",
    capabilities: ["Data analysis", "Pattern recognition", "Trend identification", "Visualization"],
  },
  {
    type: "creative",
    name: "Creative Agent",
    description: "Creative content and ideation",
    icon: "🎨",
    capabilities: ["Content creation", "Brainstorming", "Storytelling", "Design concepts"],
  },
  {
    type: "planning",
    name: "Planning Agent",
    description: "Project planning and task breakdown",
    icon: "📋",
    capabilities: ["Task breakdown", "Timeline creation", "Resource planning", "Risk assessment"],
  },
];

export function useAgents() {
  const { user } = useAuth();
  const [currentRun, setCurrentRun] = useState<AgentRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Generate a step ID
  const generateStepId = () => `step-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // Add a step to the current run
  const addStep = useCallback((step: Omit<AgentStep, "id">) => {
    const newStep: AgentStep = { ...step, id: generateStepId() };
    setCurrentRun(prev => {
      if (!prev) return null;
      return { ...prev, steps: [...prev.steps, newStep] };
    });
    return newStep.id;
  }, []);

  // Update a step
  const updateStep = useCallback((stepId: string, updates: Partial<AgentStep>) => {
    setCurrentRun(prev => {
      if (!prev) return null;
      return {
        ...prev,
        steps: prev.steps.map(s => s.id === stepId ? { ...s, ...updates } : s),
      };
    });
  }, []);

  // Simulate agent thinking (calls AI for reasoning)
  const think = useCallback(async (prompt: string): Promise<string> => {
    const session = await supabase.auth.getSession();
    if (!session.data.session) throw new Error("Not authenticated");

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.session.access_token}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        model: "lexa-balanced",
      }),
      signal: abortRef.current?.signal,
    });

    if (!response.ok) throw new Error("AI request failed");

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
    
    return result;
  }, []);

  // Run an agent with a goal
  const runAgent = useCallback(async (
    agentType: AgentType,
    goal: string,
    onUpdate?: (run: AgentRun) => void
  ): Promise<AgentRun> => {
    if (!user) throw new Error("Not authenticated");
    
    setIsRunning(true);
    abortRef.current = new AbortController();

    const run: AgentRun = {
      id: `run-${Date.now()}`,
      goal,
      steps: [],
      status: "running",
      startedAt: new Date().toISOString(),
    };
    setCurrentRun(run);
    onUpdate?.(run);

    try {
      // Step 1: Analyze the goal
      const analyzeStepId = generateStepId();
      run.steps.push({
        id: analyzeStepId,
        type: "think",
        title: "Analyzing goal",
        content: `Understanding: "${goal}"`,
        status: "running",
      });
      setCurrentRun({ ...run });
      onUpdate?.({ ...run });

      const startTime = Date.now();
      const analysis = await think(`You are a ${agentType} agent. Analyze this goal and break it down into 3-5 concrete steps. Goal: ${goal}. Respond with a numbered list of steps.`);
      
      run.steps = run.steps.map(s => 
        s.id === analyzeStepId 
          ? { ...s, status: "completed", result: analysis, duration: Date.now() - startTime }
          : s
      );
      setCurrentRun({ ...run });
      onUpdate?.({ ...run });

      // Step 2: Execute the plan
      const executeStepId = generateStepId();
      run.steps.push({
        id: executeStepId,
        type: "execute",
        title: "Executing plan",
        content: "Working through the steps...",
        status: "running",
      });
      setCurrentRun({ ...run });
      onUpdate?.({ ...run });

      const execStart = Date.now();
      const execution = await think(`You are a ${agentType} agent. Based on this plan:\n${analysis}\n\nExecute each step for the goal: "${goal}". Provide detailed output for each step.`);

      run.steps = run.steps.map(s =>
        s.id === executeStepId
          ? { ...s, status: "completed", result: execution, duration: Date.now() - execStart }
          : s
      );
      setCurrentRun({ ...run });
      onUpdate?.({ ...run });

      // Step 3: Summarize results
      const summarizeStepId = generateStepId();
      run.steps.push({
        id: summarizeStepId,
        type: "summarize",
        title: "Summarizing results",
        content: "Creating final summary...",
        status: "running",
      });
      setCurrentRun({ ...run });
      onUpdate?.({ ...run });

      const sumStart = Date.now();
      const summary = await think(`Summarize the results of this agent run:\n\nGoal: ${goal}\n\nExecution:\n${execution}\n\nProvide a clear, actionable summary with key findings and next steps.`);

      run.steps = run.steps.map(s =>
        s.id === summarizeStepId
          ? { ...s, status: "completed", result: summary, duration: Date.now() - sumStart }
          : s
      );

      run.status = "completed";
      run.completedAt = new Date().toISOString();
      run.finalResult = summary;
      setCurrentRun({ ...run });
      onUpdate?.({ ...run });

      toast.success("Agent completed successfully!");
      return run;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Agent failed";
      run.status = "failed";
      run.completedAt = new Date().toISOString();
      setCurrentRun({ ...run });
      
      if (errorMsg !== "Aborted") {
        toast.error(`Agent failed: ${errorMsg}`);
      }
      throw error;
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  }, [user, think]);

  // Stop the current run
  const stopAgent = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsRunning(false);
    setCurrentRun(prev => prev ? { ...prev, status: "paused" } : null);
    toast.info("Agent stopped");
  }, []);

  // Clear the current run
  const clearRun = useCallback(() => {
    setCurrentRun(null);
  }, []);

  return {
    currentRun,
    isRunning,
    runAgent,
    stopAgent,
    clearRun,
    agentConfigs: AGENT_CONFIGS,
  };
}
