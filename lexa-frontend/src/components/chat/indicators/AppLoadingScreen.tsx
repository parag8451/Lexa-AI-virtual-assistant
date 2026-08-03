import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function AppLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background overflow-hidden relative">
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[120px] animate-[breathe_4s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-violet-500/[0.02] blur-[100px] animate-[breathe_6s_ease-in-out_infinite_1s]" />
        <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] rounded-full bg-cyan-500/[0.02] blur-[80px] animate-[breathe_5s_ease-in-out_infinite_2s]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-8 relative z-10"
      >
        {/* Animated logo */}
        <div className="relative">
          {/* Multi-layer glow */}
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 blur-2xl"
          />
          <motion.div
            animate={{ 
              scale: [1.1, 1.4, 1.1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute inset-0 h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-500 blur-3xl"
          />
          
          {/* Logo container */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
            >
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-10 w-10 text-white drop-shadow-lg" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Orbiting particles */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/60"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.5,
              }}
              style={{
                top: "50%",
                left: "50%",
                transformOrigin: `${40 + i * 10}px 0px`,
              }}
            />
          ))}
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-extrabold gradient-text"
          >
            Lexa AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-muted-foreground text-sm font-medium"
          >
            Preparing your experience...
          </motion.p>
        </div>

        {/* Premium loading bar */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 200 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="h-1 bg-muted/30 rounded-full overflow-hidden"
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ 
              duration: 1.2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="h-full w-1/2 gradient-primary rounded-full shadow-lg shadow-primary/30"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
