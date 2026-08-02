import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
  userName?: string;
}

export function WelcomeScreen({
  onSuggestionClick,
  userName,
}: WelcomeScreenProps) {
  const displayName = userName ? userName : "";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 relative overflow-hidden w-full h-full">
      {/* Subtle Moving Gradient Background without blurry blue lights */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-[#07090f]">
        {/* The moving gradient */}
        <div 
          className="absolute inset-0 opacity-40 mix-blend-screen"
          style={{
            background: 'linear-gradient(120deg, #07090f 0%, #1e1b4b 25%, #07090f 50%, #0f172a 75%, #07090f 100%)',
            backgroundSize: '300% 300%',
            animation: 'gradient-shift 20s ease infinite',
          }}
        />
        
        {/* Very subtle mesh/noise texture for high detail */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

        {/* Subtle vignette to focus center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#07090f_85%)]" />
      </div>

      <div className="w-full max-w-3xl mx-auto relative z-10 flex flex-col items-center justify-center -mt-16">
        {/* Main Text - concise prompt */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-5xl lg:text-6xl font-medium text-foreground/90 tracking-tight"
        >
          How can I help?
        </motion.h1>

        {displayName && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-3 text-sm text-muted-foreground"
          >
            {displayName}
          </motion.p>
        )}
      </div>
    </div>
  );
}