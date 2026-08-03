import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  MessageSquare, 
  Globe, 
  Mic, 
  Brain,
  Target,
  Image,
  Users,
  ChevronRight,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Lexa AI",
    description: "Your emotionally intelligent AI companion that truly understands you. Let's take a quick tour of what you can do!",
    icon: Sparkles,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "chat",
    title: "Natural Conversations",
    description: "Chat naturally with multiple AI models. Lexa remembers context and adapts to your communication style.",
    icon: MessageSquare,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "search",
    title: "Real-time Web Search",
    description: "Enable web search to get up-to-date information with citations. Perfect for research and current events.",
    icon: Globe,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "voice",
    title: "Voice Conversations",
    description: "Speak naturally with Lexa using voice input and realistic AI speech. It's like talking to a friend!",
    icon: Mic,
    gradient: "from-orange-500 to-amber-500",
  },
  {
    id: "memory",
    title: "Persistent Memory",
    description: "Lexa remembers important information about you across conversations, creating a truly personalized experience.",
    icon: Brain,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: "goals",
    title: "Goal Tracking",
    description: "Set and track your goals with AI-powered suggestions and milestone tracking to stay on course.",
    icon: Target,
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    id: "images",
    title: "Image Generation",
    description: "Create stunning images with DALL-E 3. Just describe what you want and Lexa will bring it to life!",
    icon: Image,
    gradient: "from-rose-500 to-pink-500",
  },
  {
    id: "collaborate",
    title: "Team Workspaces",
    description: "Collaborate with your team in shared workspaces. Share conversations and work together seamlessly.",
    icon: Users,
    gradient: "from-teal-500 to-emerald-500",
  },
];

const STORAGE_KEY = "lexa-onboarding-completed";

interface OnboardingTourProps {
  onComplete?: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Small delay to let the app load first
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
    onComplete?.();
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-accent transition-colors z-10"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 pt-6 pb-2">
              {ONBOARDING_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === currentStep 
                      ? "w-6 bg-primary" 
                      : index < currentStep
                        ? "w-1.5 bg-primary/50"
                        : "w-1.5 bg-muted"
                  )}
                />
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-6 pt-4 text-center"
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className={cn(
                    "w-20 h-20 rounded-2xl flex items-center justify-center",
                    "bg-gradient-to-br shadow-lg",
                    step.gradient
                  )}>
                    <step.icon className="h-10 w-10 text-white" />
                  </div>
                </div>

                {/* Text */}
                <h2 className="text-xl font-bold mb-2">{step.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Actions */}
            <div className="p-6 pt-0 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Skip tour
              </Button>
              <Button
                onClick={handleNext}
                className="gap-2"
              >
                {isLastStep ? "Get Started" : "Next"}
                {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to reset onboarding (for testing)
export function useResetOnboarding() {
  return () => localStorage.removeItem(STORAGE_KEY);
}
