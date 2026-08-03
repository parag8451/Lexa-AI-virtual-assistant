import { useState, useCallback, useRef, useEffect } from "react";

interface UseSearchThrottleOptions {
  cooldownSeconds?: number;
  onCooldownChange?: (remaining: number) => void;
}

export function useSearchThrottle(options: UseSearchThrottleOptions = {}) {
  const { cooldownSeconds = 30, onCooldownChange } = options;
  
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [lastSearchTime, setLastSearchTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load last search time from storage
  useEffect(() => {
    const stored = localStorage.getItem("lexa_last_search_time");
    if (stored) {
      const time = parseInt(stored, 10);
      const elapsed = (Date.now() - time) / 1000;
      if (elapsed < cooldownSeconds) {
        setLastSearchTime(time);
        setIsOnCooldown(true);
        setRemainingSeconds(Math.ceil(cooldownSeconds - elapsed));
      }
    }
  }, [cooldownSeconds]);

  // Countdown timer
  useEffect(() => {
    if (isOnCooldown && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          const next = prev - 1;
          onCooldownChange?.(next);
          if (next <= 0) {
            setIsOnCooldown(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            return 0;
          }
          return next;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isOnCooldown, remainingSeconds, onCooldownChange]);

  // Check if can search
  const canSearch = useCallback((): boolean => {
    if (!lastSearchTime) return true;
    const elapsed = (Date.now() - lastSearchTime) / 1000;
    return elapsed >= cooldownSeconds;
  }, [lastSearchTime, cooldownSeconds]);

  // Record a search
  const recordSearch = useCallback(() => {
    const now = Date.now();
    setLastSearchTime(now);
    localStorage.setItem("lexa_last_search_time", now.toString());
    setIsOnCooldown(true);
    setRemainingSeconds(cooldownSeconds);
    onCooldownChange?.(cooldownSeconds);
  }, [cooldownSeconds, onCooldownChange]);

  // Start cooldown (e.g., after rate limit response)
  const startCooldown = useCallback((seconds?: number) => {
    const duration = seconds || cooldownSeconds;
    setIsOnCooldown(true);
    setRemainingSeconds(duration);
    setLastSearchTime(Date.now());
    localStorage.setItem("lexa_last_search_time", Date.now().toString());
    onCooldownChange?.(duration);
  }, [cooldownSeconds, onCooldownChange]);

  // Clear cooldown (e.g., for testing)
  const clearCooldown = useCallback(() => {
    setIsOnCooldown(false);
    setRemainingSeconds(0);
    setLastSearchTime(null);
    localStorage.removeItem("lexa_last_search_time");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  return {
    isOnCooldown,
    remainingSeconds,
    canSearch,
    recordSearch,
    startCooldown,
    clearCooldown,
  };
}
