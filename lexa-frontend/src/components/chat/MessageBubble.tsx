import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { messageEntrance } from "@/animations/variants";
import { cn } from "@/lib/utils";

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

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
  index?: number;
}

const MessageBubbleComponent = ({
  message,
  isLast = false,
  index = 0,
}: MessageBubbleProps) => {
  const isUser = message.role === "user";

  // Memoize computed styles to prevent unnecessary recalculations
  const bubbleClasses = useMemo(() => {
    return cn(
      "max-w-2xl px-4 py-3 rounded-lg text-sm leading-relaxed break-words",
      isUser
        ? "bg-blue-600 text-white rounded-br-none"
        : "bg-slate-800 text-slate-100 rounded-bl-none"
    );
  }, [isUser]);

  const containerClasses = useMemo(() => {
    return cn(
      "flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2",
      isUser ? "flex-row-reverse" : "flex-row"
    );
  }, [isUser]);

  // Create a custom comparator for the message content
  // This allows React.memo to properly detect when content has changed
  const contentKey = useMemo(() => {
    return `${message.role}-${message.content.slice(0, 50)}-${message.isStreaming ? "streaming" : "done"}`;
  }, [message.role, message.content, message.isStreaming]);

  return (
    <motion.div
      className={containerClasses}
      variants={messageEntrance}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      key={contentKey}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
          isUser ? "bg-blue-600" : "bg-gradient-to-br from-purple-500 to-pink-500"
        )}
      >
        <span className="text-xs font-bold text-white">
          {isUser ? "U" : "L"}
        </span>
      </div>

      {/* Message bubble */}
      <div className="flex-1 flex flex-col gap-2">
        <div className={bubbleClasses}>
          {/* Content with proper text rendering */}
          <div className="whitespace-pre-wrap">
            {message.content}
            {message.isStreaming && isLast && (
              <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
            )}
          </div>

          {/* Tool calls visualization */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-3 pt-3 border-t border-current border-opacity-20 text-xs opacity-75">
              <div className="font-semibold mb-1">Used tools:</div>
              {message.toolCalls.map((tool, i) => (
                <div key={i} className="ml-2 font-mono text-opacity-75">
                  • {tool.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp (optional) */}
        {message.timestamp && (
          <div className="text-xs text-slate-500 px-2">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Memoized message bubble component
 * Uses custom comparator to detect real content changes
 */
export const MessageBubble = memo(MessageBubbleComponent, (prevProps, nextProps) => {
  // Return true if props are equal (skip rerender), false if different (rerender)
  return (
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.role === nextProps.message.role &&
    prevProps.message.isStreaming === nextProps.message.isStreaming &&
    prevProps.isLast === nextProps.isLast &&
    prevProps.index === nextProps.index &&
    JSON.stringify(prevProps.message.toolCalls) ===
      JSON.stringify(nextProps.message.toolCalls)
  );
});