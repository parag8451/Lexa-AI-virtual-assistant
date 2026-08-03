import { useState, useCallback } from "react";

export type Mood = "happy" | "sad" | "frustrated" | "curious" | "neutral" | "excited" | "confused" | "grateful";

interface SentimentResult {
  mood: Mood;
  confidence: number;
  emoji: string;
  response: string;
}

// Sentiment analysis patterns
const SENTIMENT_PATTERNS: { pattern: RegExp; mood: Mood; weight: number }[] = [
  // Happy/Positive
  { pattern: /\b(thank|thanks|appreciate|grateful|awesome|amazing|great|love|wonderful|fantastic|excellent|perfect|happy|glad|joy|delighted|pleased|excited)\b/i, mood: "happy", weight: 3 },
  { pattern: /\b(good|nice|cool|fine|okay|like|enjoy|fun|helpful|useful)\b/i, mood: "happy", weight: 1 },
  { pattern: /[!]{2,}|😊|😄|🎉|❤️|💕|🙏|👍|✨/g, mood: "happy", weight: 2 },
  
  // Excited
  { pattern: /\b(wow|omg|incredible|unbelievable|mind-?blown|can't wait|exciting|thrilled|pumped)\b/i, mood: "excited", weight: 3 },
  { pattern: /[!]{3,}|🎊|🚀|🔥|💯|⚡/g, mood: "excited", weight: 2 },
  
  // Sad/Negative
  { pattern: /\b(sad|unhappy|depressed|down|disappointed|upset|hurt|crying|terrible|awful|horrible|worst)\b/i, mood: "sad", weight: 3 },
  { pattern: /\b(bad|not good|miss|lonely|tired|exhausted)\b/i, mood: "sad", weight: 1 },
  { pattern: /😢|😭|😔|💔|😞/g, mood: "sad", weight: 2 },
  
  // Frustrated/Angry
  { pattern: /\b(frustrated|annoyed|angry|hate|stupid|ridiculous|absurd|unacceptable|furious|mad)\b/i, mood: "frustrated", weight: 3 },
  { pattern: /\b(can't|won't work|broken|bug|error|wrong|problem|issue|fail|failed)\b/i, mood: "frustrated", weight: 1 },
  { pattern: /😤|😠|😡|🤬|💢/g, mood: "frustrated", weight: 2 },
  
  // Confused
  { pattern: /\b(confused|don't understand|unclear|what|how|why|help me understand|lost|puzzled)\b/i, mood: "confused", weight: 3 },
  { pattern: /\?{2,}|🤔|😕|🤷/g, mood: "confused", weight: 2 },
  
  // Curious
  { pattern: /\b(curious|wondering|interested|tell me|explain|how does|what is|why does|learn|discover)\b/i, mood: "curious", weight: 2 },
  { pattern: /\b(can you|could you|would you|please show|teach me)\b/i, mood: "curious", weight: 1 },
  
  // Grateful
  { pattern: /\b(thank you so much|really appreciate|you're the best|you're amazing|lifesaver|saved me|so helpful)\b/i, mood: "grateful", weight: 3 },
  { pattern: /🙏|💖|🥰/g, mood: "grateful", weight: 2 },
];

const MOOD_RESPONSES: Record<Mood, { emoji: string; responses: string[] }> = {
  happy: {
    emoji: "😊",
    responses: [
      "I'm so glad to help! 🌟",
      "Your positivity is contagious! ✨",
      "That's wonderful to hear! 🎉",
    ],
  },
  excited: {
    emoji: "🎉",
    responses: [
      "I love your enthusiasm! 🚀",
      "Let's channel that energy! ⚡",
      "This is going to be great! 🔥",
    ],
  },
  sad: {
    emoji: "💙",
    responses: [
      "I'm here for you. Let me help. 💙",
      "I understand. Let's work through this together. 🤗",
      "Take your time. I'm here to support you. 💫",
    ],
  },
  frustrated: {
    emoji: "🤝",
    responses: [
      "I understand the frustration. Let me help fix this. 🛠️",
      "Don't worry, we'll figure this out together. 💪",
      "I hear you. Let's tackle this step by step. 🎯",
    ],
  },
  confused: {
    emoji: "💡",
    responses: [
      "Let me break this down for you. 📚",
      "Great question! Let me clarify. 🔍",
      "I'll explain this clearly. 💡",
    ],
  },
  curious: {
    emoji: "🔮",
    responses: [
      "Great curiosity! Let me explore this with you. 🔮",
      "What a fascinating topic! 🌍",
      "I love your inquisitive mind! 🧠",
    ],
  },
  grateful: {
    emoji: "💖",
    responses: [
      "You're so welcome! It's my pleasure! 💖",
      "I'm always here to help! 🌈",
      "Making your day better is what I do! ⭐",
    ],
  },
  neutral: {
    emoji: "✨",
    responses: [
      "Let's get started! ✨",
      "I'm ready to assist! 🎯",
      "Let me help you with that! 💫",
    ],
  },
};

export function useSentiment() {
  const [currentMood, setCurrentMood] = useState<SentimentResult | null>(null);
  const [moodHistory, setMoodHistory] = useState<Mood[]>([]);

  const analyzeSentiment = useCallback((text: string): SentimentResult => {
    const scores: Record<Mood, number> = {
      happy: 0,
      sad: 0,
      frustrated: 0,
      curious: 0,
      neutral: 0,
      excited: 0,
      confused: 0,
      grateful: 0,
    };

    // Calculate scores based on patterns
    for (const { pattern, mood, weight } of SENTIMENT_PATTERNS) {
      const matches = text.match(pattern);
      if (matches) {
        scores[mood] += matches.length * weight;
      }
    }

    // Find the dominant mood
    let maxScore = 0;
    let dominantMood: Mood = "neutral";
    
    for (const [mood, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        dominantMood = mood as Mood;
      }
    }

    // Calculate confidence (0-1)
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? Math.min(maxScore / totalScore, 1) : 0.5;

    const moodData = MOOD_RESPONSES[dominantMood];
    const randomResponse = moodData.responses[Math.floor(Math.random() * moodData.responses.length)];

    const result: SentimentResult = {
      mood: dominantMood,
      confidence,
      emoji: moodData.emoji,
      response: randomResponse,
    };

    setCurrentMood(result);
    setMoodHistory(prev => [...prev.slice(-9), dominantMood]);

    return result;
  }, []);

  const getOverallMood = useCallback((): Mood => {
    if (moodHistory.length === 0) return "neutral";
    
    const counts = moodHistory.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<Mood, number>);

    return Object.entries(counts).reduce((a, b) => 
      (counts[a[0] as Mood] || 0) > (counts[b[0] as Mood] || 0) ? a : b
    )[0] as Mood;
  }, [moodHistory]);

  return {
    currentMood,
    moodHistory,
    analyzeSentiment,
    getOverallMood,
  };
}
