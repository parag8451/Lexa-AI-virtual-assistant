import { useState, useEffect } from "react";
import { PricingHeader } from "@/components/pricing/PricingHeader";
import { PricingFooter } from "@/components/pricing/PricingFooter";
import { PricingHero } from "@/components/pricing/PricingHero";
import { BillingToggle } from "@/components/pricing/BillingToggle";
import { PricingGrid } from "@/components/pricing/PricingGrid";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { FeatureHighlights } from "@/components/pricing/FeatureHighlights";
import { FAQSection } from "@/components/pricing/FAQSection";
import { FinalCTA } from "@/components/pricing/FinalCTA";
import { useSEO } from "@/hooks/useSEO";

export default function Pricing() {
  useSEO({
    title: "Pricing | Lexa AI",
    description: "Choose the AI plan that fits how you work. Unlock more powerful models, higher limits, and advanced tools.",
  });

  const [isYearly, setIsYearly] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <PricingHeader />

      <main className="flex-1">
        {/* Top Section with Background */}
        <div className="relative">
          {/* Subtle noise/texture background for the hero area */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-background to-background" />
          
          <PricingHero />
          <BillingToggle isYearly={isYearly} onToggle={setIsYearly} />
          <PricingGrid isYearly={isYearly} />
        </div>

        <ComparisonTable />
        <FeatureHighlights />
        <FAQSection />
        <FinalCTA />
      </main>

      <PricingFooter />
    </div>
  );
}
