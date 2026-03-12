import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Focus, X, Play, Pause, RotateCcw, Timer, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FocusModeProps {
  isActive: boolean;
  onToggle: () => void;
}

const FOCUS_DURATIONS = [15, 25, 45, 60]; // minutes

export function FocusMode({ isActive, onToggle }: FocusModeProps) {
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [timeRemaining, setTimeRemaining] = useState(selectedDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (soundEnabled) {
              // Play completion sound
              const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH6Onpqfm5WUlJqgoJiblY+HeGtubXqGk5ybm5+gnpqVjoR3aGVqd4OSlpidoKCenJeRhXlqYF5oeIaUmZ2foZ6amJOKfG5hXWZ0hJOanJ+gn5yYk4l7bWBdZnSFk5ucn6Cfm5iTiXttYF1mdIWTm5yfoJ+bmJOJe21gXWZ0hZObnJ+gn5uYk4l7bWBdZg==");
              audio.play().catch(() => {});
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, soundEnabled]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const resetTimer = useCallback(() => {
    setTimeRemaining(selectedDuration * 60);
    setIsRunning(false);
  }, [selectedDuration]);

  const selectDuration = useCallback((duration: number) => {
    setSelectedDuration(duration);
    setTimeRemaining(duration * 60);
    setIsRunning(false);
    setShowSettings(false);
  }, []);

  const progress = ((selectedDuration * 60 - timeRemaining) / (selectedDuration * 60)) * 100;

  return (
    <>
      {/* Focus mode button in header */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 px-4 gap-2 rounded-xl transition-all duration-300",
            isActive 
              ? "bg-gradient-to-r from-primary/20 to-violet-500/20 text-primary border border-primary/30 shadow-md shadow-primary/10" 
              : "hover:bg-muted/50"
          )}
          onClick={onToggle}
        >
          <Focus className={cn("w-4 h-4", isActive && "text-primary")} />
          <span className="hidden sm:inline text-sm font-medium">Focus</span>
        </Button>
      </motion.div>

      {/* Focus mode panel */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-16 right-4 z-50"
          >
            <div className={cn(
              "p-5 rounded-2xl border border-border/50",
              "bg-gradient-to-b from-card/98 to-card/95",
              "backdrop-blur-xl shadow-2xl shadow-black/20",
              "w-72"
            )}>
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/30"
                  >
                    <Focus className="w-4 h-4 text-white" />
                  </motion.div>
                  <span className="text-sm font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Focus Mode</span>
                </div>
                <motion.div whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full hover:bg-muted"
                    onClick={onToggle}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>

              {/* Timer display */}
              <div className="relative mb-5 p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                <motion.div
                  key={timeRemaining}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  className="text-5xl font-bold text-center bg-gradient-to-r from-foreground via-primary to-violet-400 bg-clip-text text-transparent"
                >
                  {formatTime(timeRemaining)}
                </motion.div>
                
                {/* Progress bar */}
                <div className="h-1.5 bg-muted/50 rounded-full mt-4 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary via-violet-500 to-violet-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 mb-5">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-11 w-11 p-0 rounded-full border-border/50 hover:border-primary/50 hover:bg-primary/10"
                    onClick={resetTimer}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="sm"
                    className={cn(
                      "h-14 w-14 p-0 rounded-full shadow-lg transition-all duration-300",
                      isRunning 
                        ? "bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/30" 
                        : "bg-gradient-to-br from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-primary/30"
                    )}
                    onClick={() => setIsRunning(!isRunning)}
                  >
                    {isRunning ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5 text-white" />
                    )}
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-11 w-11 p-0 rounded-full border-border/50 transition-all",
                      soundEnabled ? "hover:border-primary/50 hover:bg-primary/10" : "text-muted-foreground"
                    )}
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </Button>
                </motion.div>
              </div>

              {/* Duration selector */}
              <div className="relative">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-9 text-xs rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/50"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Timer className="w-3.5 h-3.5 mr-2 text-primary" />
                    {selectedDuration} minute session
                  </Button>
                </motion.div>

                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="mt-2 flex gap-1.5"
                    >
                      {FOCUS_DURATIONS.map((duration, index) => (
                        <motion.div
                          key={duration}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1"
                        >
                          <Button
                            variant={selectedDuration === duration ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "w-full h-9 text-xs rounded-xl transition-all",
                              selectedDuration === duration 
                                ? "bg-gradient-to-r from-primary to-violet-600 shadow-md shadow-primary/30" 
                                : "border-border/50 hover:border-primary/50"
                            )}
                            onClick={() => selectDuration(duration)}
                          >
                            {duration}m
                          </Button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
