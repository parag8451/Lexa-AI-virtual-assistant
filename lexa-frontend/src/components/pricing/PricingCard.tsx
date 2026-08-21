import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type PricingPlan } from "@/data/pricing";

interface PricingCardProps {
  plan: PricingPlan;
  isYearly: boolean;
}

export function PricingCard({ plan, isYearly }: PricingCardProps) {
  const price = isYearly ? plan.priceYearly : plan.priceMonthly;
  const isFree = price === 0;

  return (
    <div
      className={`relative flex flex-col h-full rounded-3xl border transition-all duration-300 bg-background/50 backdrop-blur-sm p-8 ${
        plan.highlighted
          ? "border-indigo-500/50 shadow-lg shadow-indigo-500/10 md:-translate-y-2 md:hover:-translate-y-3"
          : "border-border/50 hover:border-border hover:shadow-md md:hover:-translate-y-1"
      }`}
    >
      {/* Background subtle gradient for highlighted card */}
      {plan.highlighted && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
      )}

      {/* Badges */}
      <div className="absolute -top-4 left-0 right-0 flex justify-center">
        {plan.badge && (
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              plan.highlighted
                ? "bg-indigo-500 text-white border-indigo-400"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {plan.badge}
          </span>
        )}
      </div>

      {/* Header */}
      <div className="mb-6 z-10">
        <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
        <p className="text-sm text-muted-foreground min-h-[40px]">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="mb-8 z-10 flex items-baseline gap-2">
        <span className="text-4xl font-bold text-foreground tracking-tight">
          ₹{price.toLocaleString()}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {plan.billingForever ? "forever" : isYearly ? "/ year" : "/ month"}
        </span>
      </div>

      {/* CTA */}
      <div className="mb-8 z-10">
        <Button
          asChild
          variant={plan.highlighted ? "default" : "outline"}
          className={`w-full rounded-xl h-11 ${
            plan.highlighted ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""
          }`}
        >
          <a href="/chat">{plan.ctaText}</a>
        </Button>
      </div>

      {/* Features */}
      <div className="flex-1 z-10">
        <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          What's included
        </p>
        <ul className="space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-muted-foreground leading-snug">
                {feature.startsWith("Everything in") ? (
                  <span className="font-semibold text-foreground">{feature} +</span>
                ) : (
                  feature
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
