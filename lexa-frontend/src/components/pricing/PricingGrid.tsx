import { motion } from "framer-motion";
import { PRICING_PLANS } from "@/data/pricing";
import { PricingCard } from "./PricingCard";

interface PricingGridProps {
  isYearly: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function PricingGrid({ isYearly }: PricingGridProps) {
  return (
    <div className="container mx-auto px-4 max-w-7xl mb-32 relative z-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8"
      >
        {PRICING_PLANS.map((plan) => (
          <motion.div key={plan.id} variants={itemVariants}>
            <PricingCard plan={plan} isYearly={isYearly} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
