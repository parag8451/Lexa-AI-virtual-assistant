import { useState, useEffect, useRef } from "react";

interface UseTypewriterOptions {
  /** Delay between each character in milliseconds */
  charDelay?: number;
  /** Whether the typewriter effect is active */
  enabled?: boolean;
  /** Callback when typing is complete */
  onComplete?: () => void;
}

export function useTypewriter(
  content: string,
  options: UseTypewriterOptions = {}
) {
  const { charDelay = 15, enabled = true, onComplete } = options;
  
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const contentRef = useRef(content);
  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      setDisplayedContent(content);
      setIsTyping(false);
      return;
    }

    // If content grew (streaming), we need to continue typing
    if (content.length > contentRef.current.length) {
      contentRef.current = content;
    }

    // If we're already caught up, nothing to do
    if (indexRef.current >= content.length) {
      if (isTyping) {
        setIsTyping(false);
        onComplete?.();
      }
      return;
    }

    setIsTyping(true);

    const typeNextChar = () => {
      if (indexRef.current < contentRef.current.length) {
        // Type multiple characters at once for faster effect (2-4 chars)
        const charsToAdd = Math.min(
          3, // Add 3 characters at a time for smoother feel
          contentRef.current.length - indexRef.current
        );
        
        indexRef.current += charsToAdd;
        setDisplayedContent(contentRef.current.slice(0, indexRef.current));
        
        timeoutRef.current = setTimeout(typeNextChar, charDelay);
      } else {
        setIsTyping(false);
        onComplete?.();
      }
    };

    // Start typing if not already
    if (!timeoutRef.current) {
      typeNextChar();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [content, charDelay, enabled, onComplete, isTyping]);

  // Reset when content changes completely (new message)
  useEffect(() => {
    if (content !== contentRef.current && !content.startsWith(contentRef.current.slice(0, 10))) {
      // Content is completely new, reset
      contentRef.current = content;
      indexRef.current = 0;
      setDisplayedContent("");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [content]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    displayedContent: enabled ? displayedContent : content,
    isTyping,
    isComplete: indexRef.current >= content.length,
  };
}
