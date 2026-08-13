export type PricingPlan = {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  billingForever?: boolean;
  description: string;
  ctaText: string;
  highlighted?: boolean;
  badge?: string;
  features: string[];
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    billingForever: true,
    description: "Everything you need to get started with AI.",
    ctaText: "Get Started",
    features: [
      "Access to core AI assistant",
      "Basic AI models",
      "Limited daily messages",
      "Basic image generation",
      "Standard response speed",
      "Conversation history",
      "Basic file uploads",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    priceMonthly: 499,
    priceYearly: 4790,
    description: "More power and higher limits for everyday AI use.",
    ctaText: "Start Plus",
    features: [
      "Everything in Free",
      "Higher message limits",
      "Advanced AI models",
      "Faster responses",
      "Image generation",
      "File and document analysis",
      "Web research",
      "Voice conversations",
      "Custom AI assistants",
      "Priority access",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 1499,
    priceYearly: 14390,
    description: "Advanced AI capabilities for professionals, creators, and developers.",
    ctaText: "Start Pro",
    highlighted: true,
    badge: "Most Popular",
    features: [
      "Everything in Plus",
      "Highest AI usage limits",
      "Premium reasoning models",
      "Advanced research",
      "Advanced image generation",
      "Video generation",
      "Large file analysis",
      "Long-context conversations",
      "Advanced voice mode",
      "Priority compute",
      "Custom agents",
      "API credits",
      "Early access to new AI features",
    ],
  },
  {
    id: "ultra",
    name: "Ultra",
    priceMonthly: 3999,
    priceYearly: 38390,
    description: "The ultimate AI experience for heavy users and power workflows.",
    ctaText: "Get Ultra",
    badge: "Maximum Power",
    features: [
      "Everything in Pro",
      "Maximum usage limits",
      "Highest-priority AI models",
      "Maximum context",
      "Advanced agentic workflows",
      "Unlimited/very high usage where supported",
      "Premium video generation",
      "Advanced research tools",
      "Maximum file processing",
      "Dedicated priority compute",
      "Increased API credits",
      "Experimental model access",
      "New feature previews",
    ],
  },
];

export const COMPARISON_CATEGORIES = [
  {
    name: "AI Models",
    features: [
      { name: "Basic models", free: "Yes", plus: "Yes", pro: "Yes", ultra: "Yes" },
      { name: "Advanced models", free: "-", plus: "Yes", pro: "Yes", ultra: "Yes" },
      { name: "Reasoning models", free: "-", plus: "-", pro: "Yes", ultra: "Yes" },
      { name: "Premium models", free: "-", plus: "-", pro: "-", ultra: "Yes" },
    ]
  },
  {
    name: "Usage",
    features: [
      { name: "Messages", free: "100/day", plus: "500/day", pro: "2000/day", ultra: "Unlimited" },
      { name: "Context length", free: "8K", plus: "32K", pro: "128K", ultra: "1M+" },
      { name: "File uploads", free: "5/day", plus: "50/day", pro: "Unlimited", ultra: "Unlimited" },
      { name: "Image generation", free: "10/day", plus: "100/day", pro: "Unlimited", ultra: "Unlimited" },
      { name: "Video generation", free: "-", plus: "-", pro: "5/day", ultra: "50/day" },
    ]
  },
  {
    name: "AI Tools",
    features: [
      { name: "Web research", free: "Basic", plus: "Advanced", pro: "Pro", ultra: "Maximum" },
      { name: "Voice mode", free: "Standard", plus: "Advanced", pro: "Advanced", ultra: "Premium" },
      { name: "Custom assistants", free: "-", plus: "Up to 5", pro: "Unlimited", ultra: "Unlimited" },
      { name: "AI agents", free: "-", plus: "-", pro: "Yes", ultra: "Yes" },
      { name: "Advanced research", free: "-", plus: "-", pro: "Yes", ultra: "Yes" },
    ]
  },
  {
    name: "Developer",
    features: [
      { name: "API access", free: "-", plus: "-", pro: "Yes", ultra: "Yes" },
      { name: "API credits", free: "-", plus: "-", pro: "₹500/mo", ultra: "₹2,500/mo" },
      { name: "Model access", free: "Standard", plus: "Standard", pro: "Early", ultra: "Experimental" },
      { name: "Priority compute", free: "-", plus: "-", pro: "Standard", ultra: "Dedicated" },
    ]
  },
  {
    name: "Storage",
    features: [
      { name: "Conversation history", free: "30 days", plus: "Unlimited", pro: "Unlimited", ultra: "Unlimited" },
      { name: "File storage", free: "1GB", plus: "10GB", pro: "100GB", ultra: "1TB" },
      { name: "Cloud storage", free: "Basic", plus: "Standard", pro: "Premium", ultra: "Enterprise" },
    ]
  }
];
