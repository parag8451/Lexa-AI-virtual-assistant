import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, Send, Loader2, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

const emailSchema = z.string().email("Please enter a valid email address");

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSent(true);
      toast({
        title: "Reset link sent",
        description: "Check your inbox for password reset instructions.",
      });
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Failed to send reset email",
        description: err instanceof Error ? err.message : "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Check your inbox</h3>
        <p className="text-xs text-muted-foreground">
          We sent a reset link to <strong className="text-foreground">{email}</strong>.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-full h-11 rounded-full text-xs font-semibold mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-lg font-extrabold text-foreground tracking-tight">Reset password</h3>
        <p className="text-xs text-muted-foreground">
          Enter your email to receive recovery instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11 rounded-full bg-white/70 dark:bg-zinc-800/70 border-white/80 dark:border-white/10 text-xs focus:ring-2 focus:ring-[#FF5E3A]/20 transition-all"
              required
            />
          </div>
          {error && <p className="text-[11px] text-destructive pl-3">{error}</p>}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-full bg-gradient-to-r from-[#FF5E3A] to-[#FF8A65] text-white font-bold text-xs shadow-md shadow-[#FF5E3A]/20 active:scale-95 transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
        </Button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center justify-center gap-1.5 pt-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to sign in
      </button>
    </div>
  );
}
