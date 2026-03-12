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
        title: "Reset email sent",
        description: "Check your inbox for a password reset link.",
      });
    } catch (err: any) {
      console.error("Error sending reset email:", err);
      toast({
        variant: "destructive",
        title: "Failed to send reset email",
        description: err.message || "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-4"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20"
        >
          <CheckCircle2 className="w-8 h-8 text-white" />
        </motion.div>
        <h3 className="text-xl font-bold text-foreground">Check your email</h3>
        <p className="text-sm text-muted-foreground">
          We've sent a password reset link to <strong className="text-foreground">{email}</strong>
        </p>
        <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl">
          Didn't receive the email? Check your spam folder or try again.
        </p>
        <div className="flex flex-col gap-2 pt-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              onClick={() => setSent(false)}
              className="w-full h-11 rounded-xl border-border/30 hover:border-border/50"
            >
              Try another email
            </Button>
          </motion.div>
          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full h-11 rounded-xl hover:bg-muted/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to sign in
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center border border-border/20"
        >
          <Mail className="w-7 h-7 text-primary" />
        </motion.div>
        <h3 className="text-xl font-bold text-foreground">Forgot password?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email" className="text-sm font-medium text-foreground">Email</Label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              id="reset-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 bg-muted/30 border-border/30 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              required
            />
          </div>
          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-destructive font-medium"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            className="w-full h-12 gradient-primary rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send Reset Link
              </div>
            )}
          </Button>
        </motion.div>
      </form>

      <Button
        variant="ghost"
        onClick={onBack}
        className="w-full h-11 rounded-xl hover:bg-muted/30"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to sign in
      </Button>
    </motion.div>
  );
}
