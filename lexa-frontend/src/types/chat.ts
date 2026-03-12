export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  citations?: Citation[];
  attachments?: Attachment[];
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
}

export interface Citation {
  title: string;
  url: string;
  snippet?: string;
}

export interface Attachment {
  type: "image" | "file";
  name: string;
  url: string;
  mimeType?: string;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  tier: "fast" | "balanced" | "pro" | "expert" | "ultra";
  icon: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: "lexa-fast",
    name: "Lexa Fast",
    description: "Fastest responses, perfect for quick tasks",
    tier: "fast",
    icon: "⚡",
  },
  {
    id: "lexa-balanced",
    name: "Lexa Balanced",
    description: "Great balance of speed and quality",
    tier: "balanced",
    icon: "✨",
  },
  {
    id: "lexa-pro",
    name: "Lexa Pro",
    description: "Advanced capabilities for complex tasks",
    tier: "pro",
    icon: "🚀",
  },
  {
    id: "lexa-expert",
    name: "Lexa Expert",
    description: "Best for deep reasoning and analysis",
    tier: "expert",
    icon: "🧠",
  },
  {
    id: "lexa-ultra",
    name: "Lexa Ultra",
    description: "Maximum power for the most demanding tasks",
    tier: "ultra",
    icon: "👑",
  },
];
