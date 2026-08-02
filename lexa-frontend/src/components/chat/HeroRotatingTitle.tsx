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
  pauseDurationMs?: number; // Time to keep sentence on screen (default 7500ms)
  typingSpeedMs?: number;   // Typing speed per character (default 45ms)
  fadeDurationMs?: number;  // Transition fade duration (default 380ms)
  className?: string;
}

export function HeroRotatingTitle({
  pauseDurationMs = 7500,
  typingSpeedMs = 45,
  fadeDurationMs = 380,
  className = "",
}: HeroRotatingTitleProps) {
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [phase, setPhase] = useState<"typing" | "paused" | "fading">("typing");
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const isHoveredRef = useRef(isHovered);
  isHoveredRef.current = isHovered;

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const currentSentence = HERO_ROTATING_MESSAGES[index];

  // Core Typewriter State Machine
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (prefersReducedMotion) {
      setDisplayedText(currentSentence);
      timeoutId = setTimeout(() => {
        if (!isHoveredRef.current) {
          setIndex((prev) => (prev + 1) % HERO_ROTATING_MESSAGES.length);
        }
      }, pauseDurationMs);
      return () => clearTimeout(timeoutId);
    }

    if (phase === "typing") {
      if (displayedText.length < currentSentence.length) {
        timeoutId = setTimeout(() => {
          setDisplayedText(currentSentence.slice(0, displayedText.length + 1));
        }, typingSpeedMs);
      } else {
        // Full sentence typed out -> pause for 7.5 seconds
        setPhase("paused");
      }
    } else if (phase === "paused") {
      const checkAndAdvance = () => {
        if (isHoveredRef.current) {
          // If hovered, retry check every 250ms
          timeoutId = setTimeout(checkAndAdvance, 250);
        } else {
          timeoutId = setTimeout(() => {
            if (isHoveredRef.current) {
              checkAndAdvance();
            } else {
              setPhase("fading");
            }
          }, pauseDurationMs);
        }
      };

      checkAndAdvance();
    } else if (phase === "fading") {
      timeoutId = setTimeout(() => {
        setIndex((prev) => (prev + 1) % HERO_ROTATING_MESSAGES.length);
        setDisplayedText("");
        setPhase("typing");
      }, fadeDurationMs);
    }

    return () => clearTimeout(timeoutId);
  }, [displayedText, phase, currentSentence, typingSpeedMs, pauseDurationMs, fadeDurationMs, prefersReducedMotion]);

  return (
    <div
      className={`w-full max-w-4xl min-h-[3.2em] sm:min-h-[2.6em] flex items-center justify-center mb-3 select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={currentSentence}
    >
      <h1
        className={`text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15] text-center transition-all duration-300 ${
          phase === "fading"
            ? "opacity-0 -translate-y-2.5 blur-[2px]"
            : "opacity-100 translate-y-0 blur-0"
        }`}
      >
        <span className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          {displayedText}
        </span>
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          className={`inline-block w-[3px] h-[0.85em] bg-[#38BDF8] ml-1.5 align-middle rounded-full shadow-[0_0_10px_#38BDF8] ${
            prefersReducedMotion ? "hidden" : ""
          }`}
        />
      </h1>
    </div>
  );
}

export default HeroRotatingTitle;
