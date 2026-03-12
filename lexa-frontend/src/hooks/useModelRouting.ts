import { useState, useCallback, useMemo } from "react";
import { AI_MODELS } from "@/types/chat";

export type ComplexityLevel = "simple" | "moderate" | "complex" | "expert";

export interface ModelRoutingResult {
  modelId: string;
  modelName: string;
  complexity: ComplexityLevel;
  reason: string;
}

// Keywords and patterns for complexity detection
const SIMPLE_PATTERNS = [
  /^(hi|hello|hey|thanks|ok|yes|no|bye)/i,
  /^what is/i,
  /^who is/i,
  /^when (is|was|did)/i,
  /^define/i,
  /\?$/,
];

const MODERATE_PATTERNS = [
  /explain/i,
  /how (do|does|can|to)/i,
  /compare/i,
  /summarize/i,
  /translate/i,
  /list/i,
  /\d+ (steps|ways|tips|points)/i,
];

const COMPLEX_PATTERNS = [
  /analyze/i,
  /debug/i,
  /optimize/i,
  /refactor/i,
  /implement/i,
  /design (a |an |the )?system/i,
  /architecture/i,
  /algorithm/i,
  /```[\s\S]*```/, // Code blocks
  /write (a |an |the )?(complete|full|entire)/i,
];

const EXPERT_PATTERNS = [
  /research paper/i,
  /scientific/i,
  /mathematical proof/i,
  /complex algorithm/i,
  /distributed system/i,
  /machine learning/i,
  /neural network/i,
  /security audit/i,
  /performance optimization/i,
  /comprehensive analysis/i,
];

// Model tiers for routing
const MODEL_TIERS = {
  fast: "lexa-fast",
  balanced: "lexa-balanced",
  powerful: "lexa-pro",
  expert: "lexa-expert",
};

export function useModelRouting() {
  const [autoRouting, setAutoRouting] = useState(true);
  const [preferredComplexity, setPreferredComplexity] = useState<ComplexityLevel | "auto">("auto");

  // Analyze message complexity
  const analyzeComplexity = useCallback((message: string): ComplexityLevel => {
    const messageLength = message.length;
    const wordCount = message.split(/\s+/).length;
    const hasCodeBlock = /```[\s\S]*```/.test(message);
    const questionCount = (message.match(/\?/g) || []).length;

    // Check patterns from most complex to least
    if (EXPERT_PATTERNS.some(p => p.test(message))) {
      return "expert";
    }
    if (COMPLEX_PATTERNS.some(p => p.test(message)) || hasCodeBlock || wordCount > 150) {
      return "complex";
    }
    if (MODERATE_PATTERNS.some(p => p.test(message)) || wordCount > 50 || questionCount > 2) {
      return "moderate";
    }
    if (SIMPLE_PATTERNS.some(p => p.test(message)) || wordCount < 10) {
      return "simple";
    }

    // Default based on length
    if (messageLength < 50) return "simple";
    if (messageLength < 200) return "moderate";
    return "complex";
  }, []);

  // Get recommended model based on complexity
  const getRecommendedModel = useCallback((message: string): ModelRoutingResult => {
    const complexity = analyzeComplexity(message);

    let modelId: string;
    let reason: string;

    switch (complexity) {
      case "simple":
        modelId = MODEL_TIERS.fast;
        reason = "Quick query detected - using Lexa Fast for instant response";
        break;
      case "moderate":
        modelId = MODEL_TIERS.balanced;
        reason = "Balanced query - using Lexa Balanced for quality and speed";
        break;
      case "complex":
        modelId = MODEL_TIERS.powerful;
        reason = "Complex request detected - using Lexa Pro for best results";
        break;
      case "expert":
        modelId = MODEL_TIERS.expert;
        reason = "Expert-level query - using Lexa Expert for maximum accuracy";
        break;
    }

    const model = AI_MODELS.find(m => m.id === modelId);

    return {
      modelId,
      modelName: model?.name || "Unknown",
      complexity,
      reason,
    };
  }, [analyzeComplexity]);

  // Route message to appropriate model
  const routeMessage = useCallback((message: string, manualModel?: string): string => {
    if (!autoRouting || manualModel) {
      return manualModel || AI_MODELS[0].id;
    }

    if (preferredComplexity !== "auto") {
      // User has set a preferred complexity level
      switch (preferredComplexity) {
        case "simple": return MODEL_TIERS.fast;
        case "moderate": return MODEL_TIERS.balanced;
        case "complex": return MODEL_TIERS.powerful;
        case "expert": return MODEL_TIERS.expert;
      }
    }

    const { modelId } = getRecommendedModel(message);
    return modelId;
  }, [autoRouting, preferredComplexity, getRecommendedModel]);

  // Get complexity indicator for UI
  const getComplexityInfo = useMemo(() => ({
    simple: { label: "Quick", color: "text-green-500", icon: "Zap" },
    moderate: { label: "Balanced", color: "text-blue-500", icon: "Scale" },
    complex: { label: "Deep", color: "text-purple-500", icon: "Brain" },
    expert: { label: "Expert", color: "text-amber-500", icon: "Crown" },
  }), []);

  return {
    autoRouting,
    setAutoRouting,
    preferredComplexity,
    setPreferredComplexity,
    analyzeComplexity,
    getRecommendedModel,
    routeMessage,
    getComplexityInfo,
    modelTiers: MODEL_TIERS,
  };
}
