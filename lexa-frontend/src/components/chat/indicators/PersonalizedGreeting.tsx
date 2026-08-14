import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PersonalizedGreetingProps {
  userName?: string;
  className?: string;
}

export function PersonalizedGreeting({ userName, className }: PersonalizedGreetingProps) {
  const [greeting, setGreeting] = useState("Good Morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good Afternoon");
    } else if (hour >= 17 && hour < 21) {
      setGreeting("Good Evening");
    } else {
      setGreeting("Good Night");
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className={cn("flex flex-col items-center justify-center text-center", className)}
    >
      <h1 className="text-3xl md:text-5xl lg:text-[64px] font-medium tracking-tight text-white mb-4">
        {greeting}{userName ? `, ${userName}` : ""}!
      </h1>
    </motion.div>
  );
}

