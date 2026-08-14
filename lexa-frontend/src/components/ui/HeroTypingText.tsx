import React, { useState, useEffect } from "react";

const quotes = [
  { line1: "Your Intelligent", line2: "AI Assistant" },
  { line1: "Your Creative", line2: "AI Partner" },
  { line1: "Your Strategic", line2: "AI Advisor" },
  { line1: "Your Ultimate", line2: "AI Copilot" }
];

export function HeroTypingText() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentQuote = quotes[quoteIndex];
    const fullText = `${currentQuote.line1}\n${currentQuote.line2}`;
    
    let timeout: NodeJS.Timeout;
    
    if (isDeleting) {
      if (charIndex === 0) {
        setIsDeleting(false);
        setQuoteIndex((prev) => (prev + 1) % quotes.length);
        timeout = setTimeout(() => {}, 500); // pause before typing next
      } else {
        timeout = setTimeout(() => {
          setCharIndex((prev) => prev - 1);
        }, 40); // deleting speed
      }
    } else {
      if (charIndex === fullText.length) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 3000); // pause at the end of typing
      } else {
        timeout = setTimeout(() => {
          setCharIndex((prev) => prev + 1);
        }, 80); // typing speed
      }
    }
    
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, quoteIndex]);

  const currentQuote = quotes[quoteIndex];
  const fullText = `${currentQuote.line1}\n${currentQuote.line2}`;
  const currentText = fullText.substring(0, charIndex);
  
  const lines = currentText.split('\n');
  const renderedLine1 = lines[0] || "";
  const renderedLine2 = lines[1] || "";

  return (
    <h1
      className="text-6xl sm:text-7xl md:text-[6rem] lg:text-[7.5rem] text-white font-medium tracking-tight leading-[1.05] text-center"
      style={{ fontFamily: "'Google Sans', sans-serif", minHeight: "2.2em" }}
    >
      <div className="hero-title-line text-[#00A3FF]">
        {renderedLine1 || "\u00A0"}
      </div>
      <div className="hero-title-line flex justify-center items-center">
        {renderedLine2.split("").map((char, i) => (
          <span key={i} className={i < 2 ? "text-[#00A3FF]" : ""}>
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
        <span className="inline-block w-[0.1em] h-[0.9em] bg-white ml-2 animate-pulse rounded-sm" />
      </div>
    </h1>
  );
}
