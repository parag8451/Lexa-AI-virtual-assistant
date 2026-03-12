import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gradient-to-r from-primary to-violet-600 text-primary-foreground shadow-sm shadow-primary/25 hover:shadow-md hover:shadow-primary/30",
        secondary: "border-transparent bg-secondary/80 text-secondary-foreground hover:bg-secondary",
        destructive: "border-transparent bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground shadow-sm shadow-destructive/25",
        outline: "text-foreground border-border/50 hover:border-primary/50 hover:bg-primary/5",
        success: "border-transparent bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm shadow-green-500/25",
        warning: "border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/25",
        info: "border-transparent bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm shadow-blue-500/25",
        glass: "border-white/20 bg-white/10 backdrop-blur-md text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
