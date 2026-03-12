import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface OAuthButtonsProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function OAuthButtons({ loading, setLoading }: OAuthButtonsProps) {
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const redirectTo = `${window.location.origin}/`;

    // NOTE: In the Lovable preview, the app runs inside an iframe.
    // Google blocks rendering its auth pages in iframes, which can show:
    // "www.google.com refused to connect".
    // We request the OAuth URL and open it in a new tab instead.
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Google sign in failed",
        description: error.message,
      });
      return;
    }

    const url = data?.url;
    if (!url) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Google sign in failed",
        description: "Unable to start Google sign-in. Please try again.",
      });
      return;
    }

    // Try to open in a new tab. If blocked, fall back to same-tab navigation.
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.assign(url);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/20" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-4 py-1 bg-background text-muted-foreground font-medium rounded-full border border-border/20">or continue with</span>
        </div>
      </div>

      {/* Google Sign In */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 rounded-xl font-medium border-border/30 bg-card/50 hover:bg-card hover:border-border/50 hover:shadow-lg transition-all group"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
        <span className="group-hover:translate-x-0.5 transition-transform">Continue with Google</span>
      </Button>
      </motion.div>
    </>
  );
}
