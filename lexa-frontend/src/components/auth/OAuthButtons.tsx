import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface OAuthButtonsProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function OAuthButtons({ loading, setLoading }: OAuthButtonsProps) {
  const { toast } = useToast();
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("your-project") || supabaseKey.includes("your-anon")) {
      setIsConfigured(false);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    if (!isConfigured) {
      toast({
        variant: "destructive",
        title: "Configuration Notice",
        description: "Please configure your Supabase credentials in lexa-frontend/.env",
      });
      return;
    }

    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/chat`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Google sign in failed",
          description: error.message || "Ensure Google OAuth is enabled in Supabase Dashboard.",
        });
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred during Google sign in.",
      });
    }
  };

  return (
    <div className="space-y-4 pt-2">
      {/* ─── Divider ─── */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-black/5 dark:border-white/10" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
          <span className="px-3 bg-white/70 dark:bg-zinc-900/70 text-muted-foreground rounded-full border border-white/80 dark:border-white/10">
            or continue with
          </span>
        </div>
      </div>

      {/* ─── Google Sign In Pill Button ─── */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full h-11 rounded-full bg-white/60 dark:bg-zinc-800/60 hover:bg-white/90 dark:hover:bg-zinc-800 border-white/80 dark:border-white/10 text-foreground font-semibold text-xs shadow-sm hover:shadow active:scale-95 transition-all flex items-center justify-center gap-2 group"
      >
        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>Google Account</span>
      </Button>
    </div>
  );
}
