import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FeatureGrid } from "@/components/auth/FeatureGrid";
import { AuthForm } from "@/components/auth/AuthForm";
import { MobileHeader } from "@/components/auth/MobileHeader";
export default function Auth() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/");
      }
    });
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session?.user) {
        navigate("/");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  return <AuthLayout leftPanel={<FeatureGrid />} rightPanel={<div className="w-full max-w-md animate-scale-in px-0 mx-[2px] border-0">
          <MobileHeader />
          <AuthForm loading={loading} setLoading={setLoading} />
          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to Lexa AI's Terms of Service and Privacy Policy
          </p>
        </div>} />;
}