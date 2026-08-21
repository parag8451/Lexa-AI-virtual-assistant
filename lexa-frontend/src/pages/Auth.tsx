import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) navigate("/chat");
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate("/chat");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <AuthLayout
      leftPanel={<FeatureGrid />}
      rightPanel={
        <div className="w-full max-w-md animate-scale-in">
          <MobileHeader />
          <AuthForm loading={loading} setLoading={setLoading} />
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to Lexa AI&apos;s{" "}
            <Link to="/terms" className="underline underline-offset-4 transition-colors hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline underline-offset-4 transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </div>
      }
    />
  );
}
