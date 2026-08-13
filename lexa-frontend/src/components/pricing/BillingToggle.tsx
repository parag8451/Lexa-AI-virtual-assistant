import { motion } from "framer-motion";

interface BillingToggleProps {
  isYearly: boolean;
  onToggle: (isYearly: boolean) => void;
}

export function BillingToggle({ isYearly, onToggle }: BillingToggleProps) {
  return (
    <div className="flex flex-col items-center justify-center mb-16 relative z-10">
      <div className="relative flex items-center p-1 bg-muted/50 backdrop-blur-sm border border-border/50 rounded-full">
        <button
          onClick={() => onToggle(false)}
          className={`relative z-10 px-6 py-2.5 text-sm font-medium rounded-full transition-colors ${
            !isYearly ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => onToggle(true)}
          className={`relative z-10 px-6 py-2.5 text-sm font-medium rounded-full transition-colors flex items-center gap-2 ${
            isYearly ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Yearly
        </button>

        {/* Animated Pill */}
        <motion.div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-full shadow-sm border border-border/50"
          initial={false}
          animate={{
            left: isYearly ? "calc(50% + 2px)" : "4px",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      </div>
      
      {/* Save Badge */}
      <div className="absolute -right-8 -top-3 md:-right-24 md:top-1 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, rotate: -10, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 12, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold px-2 py-1 rounded-md shadow-sm whitespace-nowrap"
        >
          Save 20%
        </motion.div>
        {/* Subtle arrow pointing to yearly */}
        <svg className="absolute -left-6 top-3 text-emerald-500/50 hidden md:block w-5 h-5 -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </div>
    </div>
  );
}
