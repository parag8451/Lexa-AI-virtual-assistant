import { useState } from "react";
import { Briefcase, Heart, Palette, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { PersonalityType } from "@/hooks/useUserPreferences";

interface PersonalitySelectorProps {
  value: PersonalityType;
  onChange: (personality: PersonalityType) => void;
  disabled?: boolean;
}

const PERSONALITIES = [
  {
    id: "professional" as PersonalityType,
    label: "Professional",
    description: "Formal, concise, business-focused",
    icon: Briefcase,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "friendly" as PersonalityType,
    label: "Friendly",
    description: "Casual, warm, conversational",
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    id: "creative" as PersonalityType,
    label: "Creative",
    description: "Imaginative, expressive, storytelling",
    icon: Palette,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "empathetic" as PersonalityType,
    label: "Empathetic",
    description: "Supportive, validating, understanding",
    icon: Sparkles,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
];

export function PersonalitySelector({ value, onChange, disabled }: PersonalitySelectorProps) {
  const [open, setOpen] = useState(false);
  const current = PERSONALITIES.find(p => p.id === value) || PERSONALITIES[1];
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn(
            "gap-2 h-9 px-3 rounded-xl",
            current.bgColor,
            current.color
          )}
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{current.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {PERSONALITIES.map((personality) => {
          const Icon = personality.icon;
          const isSelected = value === personality.id;
          return (
            <DropdownMenuItem
              key={personality.id}
              onClick={() => {
                onChange(personality.id);
                setOpen(false);
              }}
              className={cn(
                "flex items-start gap-3 p-3 cursor-pointer",
                isSelected && "bg-accent"
              )}
            >
              <div className={cn("p-2 rounded-lg", personality.bgColor)}>
                <Icon className={cn("h-4 w-4", personality.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{personality.label}</span>
                  {isSelected && <Check className="h-3 w-3 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {personality.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function getPersonalityPrompt(personality: PersonalityType): string {
  switch (personality) {
    case "professional":
      return `You are Lexa AI in Professional mode. Be formal, concise, and business-focused. Use clear, direct language. Avoid casual expressions. Structure responses logically with bullet points when appropriate. Focus on facts and actionable insights.`;
    case "friendly":
      return `You are Lexa AI in Friendly mode. Be warm, casual, and conversational. Use a natural, approachable tone. Include occasional emojis when appropriate 😊. Show genuine interest in the user's questions. Be encouraging and supportive.`;
    case "creative":
      return `You are Lexa AI in Creative mode. Be imaginative, expressive, and use vivid language. Employ metaphors, analogies, and storytelling when helpful. Think outside the box. Offer unique perspectives and creative solutions. Be playful with language while remaining helpful.`;
    case "empathetic":
      return `You are Lexa AI in Empathetic mode. Be emotionally supportive, validating, and deeply understanding. Acknowledge feelings before providing information. Use compassionate language. Listen actively and reflect back what you understand. Prioritize emotional connection while still being helpful.`;
    default:
      return `You are Lexa AI, a helpful, intelligent assistant. Be clear, helpful, and engaging.`;
  }
}
