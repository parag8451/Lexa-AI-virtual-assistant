import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export const HERO_ROTATING_MESSAGES = [
  "Where Intelligence Meets Conversation",
  "What can I help you create today?",
  "Every great idea starts with a conversation.",
  "Turning questions into answers.",
  "From curiosity to clarity.",
  "Think bigger. Build smarter.",
  "Explore ideas without limits.",
  "Your next breakthrough starts here.",
  "Intelligence that adapts to you.",
  "Ask anything. Discover more.",
  "Reasoning beyond words.",
  "Knowledge at the speed of thought.",
  "Designed to think with you.",
  "Helping you solve what matters.",
  "From inspiration to execution.",
  "One conversation. Endless possibilities.",
  "Create, learn, and explore.",
  "Where ideas become reality.",
  "Powered by intelligence. Guided by you.",
  "Making complex things simple.",
  "Your AI for work, learning, and creativity.",
  "Every prompt is a new beginning.",
  "Imagine it. Build it.",
  "Think freely. Create confidently.",
  "Answers when you need them.",
  "Let's solve something together.",
  "Built to understand. Ready to help.",
  "Smarter conversations start here.",
  "The future begins with a question.",
  "Explore what's possible.",
  "Your intelligent partner for every task.",
];

interface HeroRotatingTitleProps {
  pauseDurationMs?: number; // Time to hold completed sentence on screen (default 10000ms = 10s)
  typingSpeedMs?: number;   // Typing speed per letter (default 50ms)
  fadeDurationMs?: number;  // Smooth fade transition between sentences (default 400ms)
  className?: string;
}

export function HeroRotatingTitle({
  pauseDurationMs = 10000,
  typingSpeedMs = 50,
  fadeDurationMs = 400,
  className = "",
}: HeroRotatingTitleProps) {
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isFading, setIsFading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isHoveredRef = useRef(false);
  isHoveredRef.current = isHovered;

  const currentSentence = HERO_ROTATING_MESSAGES[index];

  useEffect(() => {
    let typeInterval: NodeJS.Timeout | null = null;
    let fadeTimer: NodeJS.Timeout | null = null;
    let hoverCheckInterval: NodeJS.Timeout | null = null;

    // Reset text for new sentence
    setDisplayedText("");
    setIsFading(false);

    let charIdx = 0;

    // Letter-by-letter typing animation (50ms per character)
    typeInterval = setInterval(() => {
      charIdx++;
      setDisplayedText(currentSentence.slice(0, charIdx));

      if (charIdx >= currentSentence.length) {
        if (typeInterval) clearInterval(typeInterval);

        // Sentence fully typed -> hold on screen for 10 seconds (10000ms)
        let elapsed = 0;
        hoverCheckInterval = setInterval(() => {
          if (!isHoveredRef.current) {
            elapsed += 250;
            if (elapsed >= pauseDurationMs) {
              if (hoverCheckInterval) clearInterval(hoverCheckInterval);

              // Smooth fade transition
              setIsFading(true);

              fadeTimer = setTimeout(() => {
                setIndex((prev) => (prev + 1) % HERO_ROTATING_MESSAGES.length);
              }, fadeDurationMs);
            }
          }
        }, 250);
      }
    }, typingSpeedMs);

    return () => {
      if (typeInterval) clearInterval(typeInterval);
      if (fadeTimer) clearTimeout(fadeTimer);
      if (hoverCheckInterval) clearInterval(hoverCheckInterval);
    };
  }, [index, currentSentence, typingSpeedMs, pauseDurationMs, fadeDurationMs]);

  return (
    <div
      className={`w-full max-w-4xl min-h-[1.2em] flex items-center justify-center select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={currentSentence}
    >
      <h1
        className={`text-4xl md:text-6xl font-medium tracking-tight text-white leading-[1.2] text-center transition-all duration-300 ${
          isFading
            ? "opacity-0 -translate-y-1 blur-sm"
            : "opacity-100 translate-y-0 blur-0"
        }`}
      >
        <span className="bg-gradient-to-b from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent font-semibold">
          {displayedText}
        </span>
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block w-[2.5px] h-[0.75em] bg-[#38BDF8] ml-1.5 align-middle rounded-full"
        />
      </h1>
    </div>
  );
}

export default HeroRotatingTitle;
