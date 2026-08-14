import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { z } from "zod";
import { OAuthButtons } from "./OAuthButtons";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { useAuthRateLimit } from "@/hooks/useAuthRateLimit";
import { motion, AnimatePresence } from "framer-motion";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

interface AuthFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function AuthForm({ loading, setLoading }: AuthFormProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Rate limiting for brute-force protection
  const {
    isLocked,
    attemptsRemaining,
    formatRemainingTime,
    recordAttempt,
  } = useAuthRateLimit({
    maxAttempts: 5,
    lockoutDuration: 300, // 5 min lockout
    windowDuration: 900,  // 15 min window
  });

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      toast({
        variant: "destructive",
        title: "Too many attempts",
        description: `Please wait ${formatRemainingTime()} before trying again.`,
      });
      return;
    }

    if (!validateForm()) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      recordAttempt(false);
      const remaining = attemptsRemaining - 1;
      const warningMessage =
        remaining <= 2 && remaining > 0
          ? ` (${remaining} attempts remaining)`
          : remaining === 0
          ? " Account temporarily locked."
          : "";

      toast({
        variant: "destructive",
        title: "Sign in failed",
        description:
          (error.message === "Invalid login credentials"
            ? "Invalid email or password."
            : error.message) + warningMessage,
      });
    } else {
      recordAttempt(true);
      toast({
        title: "Welcome back!",
        description: "Redirecting to your assistant workspace...",
      });
      navigate("/chat");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName || email.split("@")[0],
        },
      },
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message,
      });
    } else {
      if (data?.session) {
        toast({
          title: "Account created!",
          description: "Welcome to Lexa AI.",
        });
        navigate("/chat");
      } else {
        toast({
          title: "Check your email",
          description: "We sent you a confirmation link to complete registration.",
        });
      }
    }
  };

  if (showForgotPassword) {
    return (
      <div className="w-full max-w-md bg-white/50 dark:bg-zinc-900/50 backdrop-blur-2xl rounded-3xl border border-white/70 dark:border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.06)] p-6 sm:p-8">
        <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white/50 dark:bg-zinc-900/50 backdrop-blur-2xl rounded-3xl border border-white/70 dark:border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.06)] p-6 sm:p-8 relative">
      {/* ─── Mode Switcher (Pill tabs) ─── */}
      <div className="flex p-1 rounded-full border border-white/80 dark:border-white/10 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md mb-6 shadow-sm">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setErrors({});
          }}
          className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
            mode === "signin"
              ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm scale-100"
              : "text-muted-foreground hover:text-foreground scale-95"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setErrors({});
          }}
          className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
            mode === "signup"
              ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm scale-100"
              : "text-muted-foreground hover:text-foreground scale-95"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Lockout alert */}
      {isLocked && (
        <div className="mb-4 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Security Lockout: Try again in {formatRemainingTime()}</span>
        </div>
      )}

      {/* ─── Main Form ─── */}
      <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
        {mode === "signup" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1.5"
          >
            <Label className="text-xs font-semibold text-muted-foreground">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Alex Mercer"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="pl-10 h-11 rounded-full bg-white/70 dark:bg-zinc-800/70 border-white/80 dark:border-white/10 text-xs focus:ring-2 focus:ring-[#FF5E3A]/20 transition-all"
              />
            </div>
          </motion.div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className={`pl-10 h-11 rounded-full bg-white/70 dark:bg-zinc-800/70 border-white/80 dark:border-white/10 text-xs focus:ring-2 focus:ring-[#FF5E3A]/20 transition-all ${
                errors.email ? "border-destructive focus:ring-destructive/20" : ""
              }`}
              required
            />
          </div>
          {errors.email && <p className="text-[11px] text-destructive pl-3">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-muted-foreground">Password</Label>
            {mode === "signin" && (
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-[11px] text-[#FF5E3A] hover:underline font-medium"
              >
                Forgot?
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              className={`pl-10 h-11 rounded-full bg-white/70 dark:bg-zinc-800/70 border-white/80 dark:border-white/10 text-xs focus:ring-2 focus:ring-[#FF5E3A]/20 transition-all ${
                errors.password ? "border-destructive focus:ring-destructive/20" : ""
              }`}
              required
            />
          </div>
          {errors.password && <p className="text-[11px] text-destructive pl-3">{errors.password}</p>}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || isLocked}
          className="w-full h-11 rounded-full bg-gradient-to-r from-[#FF5E3A] to-[#FF8A65] hover:opacity-90 text-white font-bold text-xs shadow-md shadow-[#FF5E3A]/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>{mode === "signin" ? "Sign In to Lexa" : "Create Free Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      {/* ─── OAuth Divider & Buttons ─── */}
      <OAuthButtons loading={loading} setLoading={setLoading} />
    </div>
  );
}