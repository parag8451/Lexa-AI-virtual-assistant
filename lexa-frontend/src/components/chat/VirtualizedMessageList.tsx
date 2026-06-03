import { useMemo, useRef, useEffect, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion } from "framer-motion";
import { MessageBubble } from "./MessageBubble";
import { messageListContainer } from "@/animations/variants";
import { TypingIndicator } from "./TypingIndicator";

interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
  toolCalls?: Array<{
    name: string;
    input: Record<string, unknown>;
  }>;
}

interface VirtualizedMessageListProps {
  messages: Message[];
  isLoading?: boolean;
  containerClassName?: string;
  overscanCount?: number;
}

export function VirtualizedMessageList({
  messages,
  isLoading = false,
  containerClassName = "",
  overscanCount = 5,
}: VirtualizedMessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollToBottomRef = useRef<HTMLDivElement>(null);

  // Filter out system messages from display
  const displayMessages = useMemo(() => {
    return messages.filter((m) => m.role !== "system");
  }, [messages]);

  // Virtualizer for efficient rendering of large lists
  const rowVirtualizer = useVirtualizer({
    count: displayMessages.length + (isLoading ? 1 : 0),
    getScrollMargin: () => 40, // Leave space for top margin
    getItemKey: (index) => {
      if (index === displayMessages.length && isLoading) return "typing-indicator";
      return displayMessages[index]?.id || index;
    },
    size: 60, // Estimated item height - will be measured
    overscan: overscanCount,
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    scrollMarginOffset: 40,
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (scrollToBottomRef.current) {
      scrollToBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    // Small delay to ensure DOM has updated
    const timer = setTimeout(scrollToBottom, 0);
    return () => clearTimeout(timer);
  }, [displayMessages.length, isLoading, scrollToBottom]);

  return (
    <div
      ref={parentRef}
      className={`flex-1 overflow-y-auto px-4 py-8 ${containerClassName}`}
      style={{
        contain: "strict",
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const isTypingIndicator =
            virtualItem.index === displayMessages.length;

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {isTypingIndicator ? (
                <motion.div
                  variants={messageListContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <TypingIndicator />
                </motion.div>
              ) : (
                <MessageBubble
                  message={displayMessages[virtualItem.index]}
                  isLast={
                    virtualItem.index === displayMessages.length - 1 &&
                    !isLoading
                  }
                  index={virtualItem.index}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Scroll target */}
      <div ref={scrollToBottomRef} className="h-0" />
    </div>
  );
}