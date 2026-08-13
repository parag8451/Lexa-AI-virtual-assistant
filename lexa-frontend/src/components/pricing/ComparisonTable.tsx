import { COMPARISON_CATEGORIES, PRICING_PLANS } from "@/data/pricing";
import { Check, Minus } from "lucide-react";

export function ComparisonTable() {
  return (
    <section className="py-24 bg-background border-t border-border/20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">Compare plans</h2>
          <p className="text-lg text-muted-foreground">Find the perfect blend of features and power for your workflow.</p>
        </div>

        {/* Desktop Table (hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b border-border/50">
              <tr>
                <th className="py-6 px-6 font-semibold text-foreground w-1/4">Features</th>
                {PRICING_PLANS.map((plan) => (
                  <th key={plan.id} className="py-6 px-6 font-semibold text-foreground w-[18.75%] text-center">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_CATEGORIES.map((category, catIdx) => (
                <React.Fragment key={category.name}>
                  <tr className="bg-muted/20">
                    <td colSpan={5} className="py-4 px-6 font-semibold text-foreground text-base border-y border-border/30">
                      {category.name}
                    </td>
                  </tr>
                  {category.features.map((feature, idx) => {
                    const isLast = catIdx === COMPARISON_CATEGORIES.length - 1 && idx === category.features.length - 1;
                    return (
                      <tr key={feature.name} className={isLast ? "" : "border-b border-border/20"}>
                        <td className="py-4 px-6 text-muted-foreground font-medium">{feature.name}</td>
                        <td className="py-4 px-6 text-center">
                          <FeatureValue value={feature.free} />
                        </td>
                        <td className="py-4 px-6 text-center">
                          <FeatureValue value={feature.plus} />
                        </td>
                        <td className="py-4 px-6 text-center">
                          <FeatureValue value={feature.pro} />
                        </td>
                        <td className="py-4 px-6 text-center">
                          <FeatureValue value={feature.ultra} />
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards per plan */}
        <div className="md:hidden space-y-12">
          {PRICING_PLANS.map((plan) => (
            <div key={plan.id} className="border border-border/50 rounded-2xl overflow-hidden bg-card/30 backdrop-blur-sm">
              <div className="bg-muted/50 py-4 px-4 border-b border-border/50 font-bold text-lg text-center text-foreground">
                {plan.name}
              </div>
              <div className="p-4 space-y-6">
                {COMPARISON_CATEGORIES.map((category) => (
                  <div key={category.name}>
                    <h4 className="font-semibold text-foreground mb-3 border-b border-border/30 pb-2">{category.name}</h4>
                    <ul className="space-y-3 text-sm">
                      {category.features.map((feature) => {
                        const value = feature[plan.id as keyof typeof feature] as string;
                        if (value === "-") return null;
                        return (
                          <li key={feature.name} className="flex justify-between items-center">
                            <span className="text-muted-foreground">{feature.name}</span>
                            <span className="font-medium text-foreground"><FeatureValue value={value} textOnly /></span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React from "react";

function FeatureValue({ value, textOnly = false }: { value: string; textOnly?: boolean }) {
  if (value === "Yes") {
    if (textOnly) return "Yes";
    return <Check className="h-5 w-5 text-indigo-500 mx-auto" />;
  }
  if (value === "-") {
    if (textOnly) return "-";
    return <Minus className="h-5 w-5 text-muted-foreground/30 mx-auto" />;
  }
  return <span className="text-foreground font-medium">{value}</span>;
}
