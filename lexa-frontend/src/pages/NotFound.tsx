import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Glitch Text Effect ─── */
function GlitchText({ text }: { text: string }) {
  return (
    <div className="glitch-wrapper">
      <h1 className="glitch-text" data-text={text}>
        {text}
      </h1>
    </div>
  );
}

/* ─── Floating Particle ─── */
function FloatingParticle({ delay, size, x, duration }: { delay: number; size: number; x: number; duration: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        bottom: -20,
        background: `radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, transparent 70%)`,
      }}
      animate={{
        y: [0, -800],
        opacity: [0, 0.8, 0.6, 0],
        x: [0, Math.random() * 100 - 50],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: Math.random() * 5,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    duration: Math.random() * 6 + 4,
  }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/[0.06] blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/[0.04] blur-[100px]" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-cyan-500/[0.03] blur-[80px]" />

      {/* Floating particles */}
      {particles.map(p => (
        <FloatingParticle key={p.id} {...p} />
      ))}

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center relative z-10 px-6"
      >
        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
            >
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 blur-2xl"
            />
          </div>
        </motion.div>

        {/* Glitch 404 */}
        <style>{`
          .glitch-wrapper {
            position: relative;
            display: inline-block;
          }
          .glitch-text {
            font-size: clamp(80px, 15vw, 160px);
            font-weight: 900;
            letter-spacing: -0.04em;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            position: relative;
            animation: glitch-skew 4s infinite linear alternate-reverse;
          }
          .glitch-text::before,
          .glitch-text::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .glitch-text::before {
            animation: glitch-1 2s infinite linear alternate-reverse;
            clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
          }
          .glitch-text::after {
            animation: glitch-2 2s infinite linear alternate-reverse;
            clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
          }
          @keyframes glitch-1 {
            0% { transform: translate(0); }
            20% { transform: translate(-3px, 3px); }
            40% { transform: translate(-3px, -3px); }
            60% { transform: translate(3px, 3px); }
            80% { transform: translate(3px, -3px); }
            100% { transform: translate(0); }
          }
          @keyframes glitch-2 {
            0% { transform: translate(0); }
            20% { transform: translate(3px, -3px); }
            40% { transform: translate(3px, 3px); }
            60% { transform: translate(-3px, -3px); }
            80% { transform: translate(-3px, 3px); }
            100% { transform: translate(0); }
          }
          @keyframes glitch-skew {
            0% { transform: skew(0deg); }
            2% { transform: skew(0.5deg); }
            4% { transform: skew(0deg); }
            98% { transform: skew(0deg); }
            100% { transform: skew(-0.5deg); }
          }
        `}</style>

        <GlitchText text="404" />

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-xl md:text-2xl font-semibold text-white/90 mb-3 tracking-tight"
        >
          Page not found
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-sm md:text-base text-white/40 max-w-md mx-auto mb-8 leading-relaxed"
        >
          The page at <code className="text-indigo-400/70 bg-white/5 px-1.5 py-0.5 rounded text-xs">{location.pathname}</code> doesn't exist.
          It might have been moved or deleted.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex items-center justify-center gap-3"
        >
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="h-11 px-6 rounded-xl border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="h-11 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
