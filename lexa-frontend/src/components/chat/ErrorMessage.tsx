import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ message, onRetry, className }: ErrorMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "flex items-center gap-4 px-5 py-4 rounded-2xl",
        "bg-gradient-to-r from-red-500/10 via-rose-500/10 to-orange-500/5",
        "border border-red-500/20 backdrop-blur-sm",
        "shadow-lg shadow-red-500/5",
        className
      )}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 0.5 }}
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shrink-0 shadow-md shadow-red-500/30"
      >
        <XCircle className="h-5 w-5 text-white" />
      </motion.div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-400 mb-0.5">Something went wrong</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{message}</p>
      </div>
      {onRetry && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 h-9 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl border border-red-500/20 transition-all duration-300"
            onClick={onRetry}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
