import { ReactNode, Suspense } from "react";
import { motion } from "framer-motion";
import { AuthScene3D } from "./AuthScene3D";

interface AuthLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export function AuthLayout({ leftPanel, rightPanel }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex overflow-hidden relative">
      {/* 3D Background Scene */}
      <Suspense fallback={null}>
        <AuthScene3D />
      </Suspense>
      
      {/* Multi-layer gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/90 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.02] via-transparent to-violet-500/[0.02] z-[1]" />
      
      {/* Premium grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern-subtle z-[2]" />

      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[150px] z-[1]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/[0.02] blur-[120px] z-[1]" />

      {/* Left side - Features */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-1 flex-col justify-center px-12 xl:px-20 relative z-10"
      >
        {leftPanel}
      </motion.div>

      {/* Divider line with gradient */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-border/40 to-transparent my-16 z-10" />

      {/* Right side - Auth form */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10"
      >
        {rightPanel}
      </motion.div>
    </div>
  );
}
