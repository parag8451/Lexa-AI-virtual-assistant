import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, Zap, Shield, ArrowRight, AlertTriangle, Sparkles } from "lucide-react";
import { z } from "zod";
import { OAuthButtons } from "./OAuthButtons";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { useAuthRateLimit } from "@/hooks/useAuthRateLimit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
interface AuthFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}
export function AuthForm({
  loading,
  setLoading
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const {
    toast
  } = useToast();

  // Rate limiting for brute-force protection
  const {
    isLocked,
    attemptsRemaining,
    formatRemainingTime,
    recordAttempt,
    attempts,
    maxAttempts
  } = useAuthRateLimit({
    maxAttempts: 5,
    lockoutDuration: 300,
    // 5 minutes lockout
    windowDuration: 900 // 15 minute window
  });
  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
    } = {};
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

    // Check if rate limited
    if (isLocked) {
      toast({
        variant: "destructive",
        title: "Too many attempts",
        description: `Please wait ${formatRemainingTime()} before trying again.`
      });
      return;
    }
    if (!validateForm()) return;
    setLoading(true);
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);
    if (error) {
      // Record failed attempt
      recordAttempt(false);
      const remainingAfterThis = attemptsRemaining - 1;
      const warningMessage = remainingAfterThis <= 2 && remainingAfterThis > 0 ? ` (${remainingAfterThis} attempts remaining)` : remainingAfterThis === 0 ? " Account temporarily locked." : "";
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: (error.message === "Invalid login credentials" ? "Invalid email or password." : error.message) + warningMessage
      });
    } else {
      // Record successful attempt (resets counter)
      recordAttempt(true);
    }
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const {
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: displayName || email.split("@")[0]
        }
      }
    });
    setLoading(false);
    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          variant: "destructive",
          title: "Account exists",
          description: "This email is already registered. Try signing in instead."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: error.message
        });
      }
    } else {
      toast({
        title: "Welcome to Lexa AI! 🎉",
        description: "Your account has been created. Start chatting now!"
      });
    }
  };
  if (showForgotPassword) {
    return <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
      className="glass-strong rounded-3xl p-8 shadow-2xl border border-border/20"
    >
        <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
      </motion.div>;
  }
  return <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="glass-strong rounded-3xl p-8 shadow-2xl border border-border/20 relative overflow-hidden"
  >
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <div className="flex justify-center mb-3">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-xl gradient-aurora flex items-center justify-center shadow-lg"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
          </div>
          <h2 className="text-xl font-bold text-foreground">Welcome</h2>
          <p className="text-sm text-muted-foreground mt-1">Sign in to continue to Lexa AI</p>
        </motion.div>

      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/30 p-1 rounded-xl border border-border/20">
          <TabsTrigger value="signin" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border-border/30 transition-all font-medium">
            Sign In
          </TabsTrigger>
          <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border-border/30 transition-all font-medium">
            Sign Up
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="mt-0">
          {/* Rate limit warning */}
          {isLocked && <Alert variant="destructive" className="mb-4 border-destructive/30 bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Too many failed attempts. Please wait {formatRemainingTime()} before trying again.
              </AlertDescription>
            </Alert>}
          
          {/* Attempt warning (when close to lockout) */}
          {!isLocked && attempts > 0 && attemptsRemaining <= 2 && <Alert className="mb-4 border-amber-500/30 bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-600 dark:text-amber-400">
                {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining before temporary lockout.
              </AlertDescription>
            </Alert>}
          
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email" className="text-sm font-medium text-foreground">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input id="signin-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 h-12 bg-muted/30 border-border/30 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" required />
              </div>
              {errors.email && <p className="text-xs text-destructive font-medium">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="signin-password" className="text-sm font-medium text-foreground">Password</Label>
                <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs text-primary hover:underline font-medium hover:text-primary/80 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input id="signin-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 h-12 bg-muted/30 border-border/30 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" required />
              </div>
              {errors.password && <p className="text-xs text-destructive font-medium">{errors.password}</p>}
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" className="w-full h-12 gradient-primary rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all" disabled={loading || isLocked}>
                {loading ? <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div> : <div className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </div>}
              </Button>
            </motion.div>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="mt-0">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name" className="text-sm font-medium text-foreground">Display Name</Label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input id="signup-name" type="text" placeholder="Your name" value={displayName} onChange={e => setDisplayName(e.target.value)} className="pl-10 h-12 bg-muted/30 border-border/30 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input id="signup-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 h-12 bg-muted/30 border-border/30 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" required />
              </div>
              {errors.email && <p className="text-xs text-destructive font-medium">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input id="signup-password" type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 h-12 bg-muted/30 border-border/30 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" required />
              </div>
              {errors.password && <p className="text-xs text-destructive font-medium">{errors.password}</p>}
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" className="w-full h-12 gradient-primary rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all" disabled={loading}>
                {loading ? <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </div> : <div className="flex items-center gap-2">
                    Create Account
                    <Zap className="w-4 h-4" />
                  </div>}
              </Button>
            </motion.div>
          </form>
        </TabsContent>
      </Tabs>

      <OAuthButtons loading={loading} setLoading={setLoading} />

      {/* Security badge */}
      <div className="mt-6 pt-6 border-t border-border/20">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secured with end-to-end encryption</span>
        </motion.div>
      </div>
      </div>
    </motion.div>;
}