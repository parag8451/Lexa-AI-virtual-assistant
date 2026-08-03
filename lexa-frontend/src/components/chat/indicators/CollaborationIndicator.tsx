import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCollaboration, ActiveUser, TypingIndicator } from "@/hooks/useCollaboration";
import { cn } from "@/lib/utils";

interface CollaborationIndicatorProps {
  conversationId: string;
  className?: string;
}

export function CollaborationIndicator({ conversationId, className }: CollaborationIndicatorProps) {
  const {
    activeUsers,
    typingUsers,
    joinPresence,
    leavePresence,
    subscribeToTyping,
  } = useCollaboration(conversationId);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    joinPresence();
    subscribeToTyping();

    return () => {
      leavePresence();
    };
  }, [joinPresence, leavePresence, subscribeToTyping]);

  if (!mounted || (activeUsers.length === 0 && typingUsers.length === 0)) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Active Users */}
      {activeUsers.length > 0 && (
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {activeUsers.slice(0, 3).map((user, index) => (
              <Tooltip key={user.user_id}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Avatar className="h-6 w-6 border-2 border-background ring-2 ring-green-500">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                        {user.display_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{user.display_name || "User"}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.current_action || "Viewing"}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {activeUsers.length > 3 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium -ml-2">
                  +{activeUsers.length - 3}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{activeUsers.length - 3} more users viewing</p>
              </TooltipContent>
            </Tooltip>
          )}

          <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
            {activeUsers.length === 1 ? "1 viewer" : `${activeUsers.length} viewers`}
          </span>
        </div>
      )}

      {/* Typing Indicators */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs"
          >
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{
                    y: [0, -3, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
            <span className="text-muted-foreground ml-1">
              {typingUsers.length === 1
                ? `${typingUsers[0].display_name || "Someone"} is typing...`
                : `${typingUsers.length} people typing...`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Cursor overlay for collaborative editing (optional)
export function CursorOverlay({ conversationId }: { conversationId: string }) {
  const { activeUsers } = useCollaboration(conversationId);

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <AnimatePresence>
        {activeUsers
          .filter(u => u.cursor_position)
          .map((user) => (
            <motion.div
              key={user.user_id}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                x: user.cursor_position!.x,
                y: user.cursor_position!.y,
              }}
              exit={{ opacity: 0 }}
              className="absolute"
              style={{
                left: user.cursor_position!.x,
                top: user.cursor_position!.y,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.5 3L15 10L10 10.5L8 15L5.5 3Z"
                  fill="currentColor"
                  className="text-primary"
                  stroke="white"
                  strokeWidth="1"
                />
              </svg>
              <span className="absolute top-5 left-2 px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[10px] whitespace-nowrap">
                {user.display_name || "User"}
              </span>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
