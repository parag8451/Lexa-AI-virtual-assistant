import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FeatureGrid } from "@/components/auth/FeatureGrid";
import { AuthForm } from "@/components/auth/AuthForm";
import { MobileHeader } from "@/components/auth/MobileHeader";
import { useSEO } from "@/hooks/useSEO";

export default function Auth() {
  useSEO({
    title: "Sign In",
    description: "Sign in or create an account to start chatting with Lexa AI.",
    canonicalUrl: "/auth",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/chat");
      }
    });
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session?.user) {
        navigate("/chat");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  return <AuthLayout leftPanel={<FeatureGrid />} rightPanel={<div className="w-full max-w-md animate-scale-in px-0 mx-[2px] border-0">
          <MobileHeader />
          <AuthForm loading={loading} setLoading={setLoading} />
          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to Lexa AI's{" "}
            <Link to="/terms" className="underline hover:text-foreground transition-colors">Terms of Service</Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</Link>
          </p>
        </div>} />;
}