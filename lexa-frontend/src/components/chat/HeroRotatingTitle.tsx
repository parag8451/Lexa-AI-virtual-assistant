import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  intervalMs?: number; // default 7800ms
  className?: string;
}

export function HeroRotatingTitle({
  intervalMs = 7800,
  className = "",
}: HeroRotatingTitleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const currentSentence = HERO_ROTATING_MESSAGES[currentIndex];

  // Typing animation for current message
  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedText(currentSentence);
      return;
    }

    setTypedText("");
    let charIdx = 0;
    const typingSpeed = Math.max(30, Math.min(50, Math.floor(1800 / currentSentence.length)));

    const typeTimer = setInterval(() => {
      charIdx++;
      setTypedText(currentSentence.slice(0, charIdx));
      if (charIdx >= currentSentence.length) {
        clearInterval(typeTimer);
      }
    }, typingSpeed);

    return () => clearInterval(typeTimer);
  }, [currentIndex, currentSentence, prefersReducedMotion]);

  // Interval timer for rotating through sentences
  useEffect(() => {
    if (isHovered || prefersReducedMotion) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_ROTATING_MESSAGES.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs, isHovered, prefersReducedMotion]);

  return (
    <div
      className={`w-full max-w-4xl min-h-[3.2em] sm:min-h-[2.6em] flex items-center justify-center mb-3 select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={currentSentence}
    >
      <AnimatePresence mode="wait">
        <motion.h1
          key={currentIndex}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, transition: { duration: 0.35, ease: "easeIn" } }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15] text-center"
        >
          <span className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            {typedText}
          </span>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
            className={`inline-block w-[3px] h-[0.85em] bg-[#38BDF8] ml-1.5 align-middle rounded-full shadow-[0_0_10px_#38BDF8] ${
              prefersReducedMotion ? "hidden" : ""
            }`}
          />
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}

export default HeroRotatingTitle;
