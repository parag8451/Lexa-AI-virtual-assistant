import { useState, useCallback, useRef, useEffect } from "react";

interface RateLimitState {
  attempts: number;
  lockoutUntil: number | null;
  lastAttempt: number;
}

interface UseAuthRateLimitOptions {
  maxAttempts?: number;
  lockoutDuration?: number; // in seconds
  windowDuration?: number; // in seconds
}

const STORAGE_KEY = "auth_rate_limit";

export function useAuthRateLimit(options: UseAuthRateLimitOptions = {}) {
  const {
    maxAttempts = 5,
    lockoutDuration = 300, // 5 minutes
    windowDuration = 900, // 15 minutes
  } = options;

  const [state, setState] = useState<RateLimitState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if the window has expired
        if (Date.now() - parsed.lastAttempt > windowDuration * 1000) {
          return { attempts: 0, lockoutUntil: null, lastAttempt: 0 };
        }
        return parsed;
      }
    } catch {
      // Ignore parsing errors
    }
    return { attempts: 0, lockoutUntil: null, lastAttempt: 0 };
  });

  const [remainingTime, setRemainingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate remaining lockout time
  useEffect(() => {
    if (state.lockoutUntil && state.lockoutUntil > Date.now()) {
      const updateTimer = () => {
        const remaining = Math.max(0, Math.ceil((state.lockoutUntil! - Date.now()) / 1000));
        setRemainingTime(remaining);
        
        if (remaining <= 0) {
          // Lockout expired
          setState(prev => ({
            ...prev,
            lockoutUntil: null,
            attempts: 0,
          }));
          localStorage.removeItem(STORAGE_KEY);
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } else {
      setRemainingTime(0);
    }
  }, [state.lockoutUntil]);

  // Persist state to localStorage
  useEffect(() => {
    if (state.attempts > 0 || state.lockoutUntil) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const isLocked = state.lockoutUntil !== null && state.lockoutUntil > Date.now();
  const attemptsRemaining = maxAttempts - state.attempts;

  const recordAttempt = useCallback((success: boolean) => {
    if (success) {
      // Reset on successful login
      setState({ attempts: 0, lockoutUntil: null, lastAttempt: 0 });
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    setState(prev => {
      const now = Date.now();
      const newAttempts = prev.attempts + 1;
      
      // Check if we should reset due to window expiration
      if (now - prev.lastAttempt > windowDuration * 1000) {
        return {
          attempts: 1,
          lockoutUntil: null,
          lastAttempt: now,
        };
      }

      // Check if max attempts reached
      if (newAttempts >= maxAttempts) {
        return {
          attempts: newAttempts,
          lockoutUntil: now + (lockoutDuration * 1000),
          lastAttempt: now,
        };
      }

      return {
        ...prev,
        attempts: newAttempts,
        lastAttempt: now,
      };
    });
  }, [maxAttempts, lockoutDuration, windowDuration]);

  const reset = useCallback(() => {
    setState({ attempts: 0, lockoutUntil: null, lastAttempt: 0 });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const formatRemainingTime = useCallback(() => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return minutes > 0 
      ? `${minutes}m ${seconds}s`
      : `${seconds}s`;
  }, [remainingTime]);

  return {
    isLocked,
    attemptsRemaining,
    remainingTime,
    formatRemainingTime,
    recordAttempt,
    reset,
    attempts: state.attempts,
    maxAttempts,
  };
}
