export type FAQ = {
  question: string;
  answer: string;
};

export const PRICING_FAQS: FAQ[] = [
  {
    question: "What is included in the Free plan?",
    answer: "The Free plan gives you access to our core AI assistant, basic AI models, and limited daily messages. It's perfect for casual users who want to explore what our platform can do without any commitment.",
  },
  {
    question: "Can I switch plans at any time?",
    answer: "Yes! You can upgrade, downgrade, or change your billing cycle (monthly/yearly) at any time from your account settings. When you upgrade, your new limits apply immediately.",
  },
  {
    question: "Can I cancel my subscription?",
    answer: "Absolutely. You can cancel your subscription at any time. You will retain access to your paid features until the end of your current billing cycle.",
  },
  {
    question: "What happens if I reach my usage limit?",
    answer: "If you reach your daily or monthly usage limits, you can either upgrade to a higher tier for increased limits, or wait for the limits to reset at the start of your next cycle. On our Free plan, you'll be prompted to upgrade when you hit the cap.",
  },
  {
    question: "What AI models are available?",
    answer: "We provide access to a variety of industry-leading models, including fast basic models for everyday tasks, advanced reasoning models for complex logic, and premium multimodal models for audio, video, and large-context processing.",
  },
  {
    question: "Do yearly plans save money?",
    answer: "Yes, our yearly plans offer a 20% discount compared to billing monthly. It's the most cost-effective way to use our platform long-term.",
  },
  {
    question: "Can I use the platform for commercial work?",
    answer: "Yes, all our paid plans (Plus, Pro, and Ultra) grant you full commercial rights to the content, code, and images generated using our platform.",
  },
  {
    question: "Do you offer an API?",
    answer: "Yes, API access is available on the Pro and Ultra plans. You receive monthly API credits included in your subscription, and can purchase additional credits on a pay-as-you-go basis.",
  },
  {
    question: "Is my data private?",
    answer: "We take your privacy seriously. We do not use your personal conversations, uploaded files, or API data to train our foundational models. Your data is encrypted in transit and at rest.",
  },
];
