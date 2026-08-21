import * as React from "react";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  className?: string;
}

/**
 * Full-screen, forced-dark auth shell. The `dark` class guarantees a true black
 * UI regardless of the app theme, and a layered CSS background (gradient orbs +
 * masked grid + vignette) provides depth without any JS/canvas cost.
 */
export function AuthLayout({ leftPanel, rightPanel, className }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        "dark relative flex min-h-screen w-full overflow-hidden bg-[#050506] text-foreground antialiased",
        className,
      )}
    >
      <AuthBackground />
      <div className="relative z-10 grid min-h-screen w-full lg:grid-cols-2">
        <div className="relative hidden items-center justify-center border-r border-white/5 p-12 lg:flex">
          <div className="relative w-full max-w-lg">{leftPanel}</div>
        </div>
        <div className="flex items-center justify-center p-6 sm:p-10">{rightPanel}</div>
      </div>
    </div>
  );
}

function AuthBackground() {
  return (
    <div aria-hidden="true" className="lx-auth-bg">
      <div className="lx-auth-base" />
      <div className="lx-auth-orb o1" />
      <div className="lx-auth-orb o2" />
      <div className="lx-auth-orb o3" />
      <div className="lx-auth-grid" />
      <div className="lx-auth-vignette" />
      <style>{`
        .lx-auth-bg { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
        .lx-auth-base { position:absolute; inset:0; background:
          radial-gradient(1100px 600px at 50% -12%, rgba(124,92,255,0.22), transparent 60%),
          radial-gradient(900px 520px at 100% 108%, rgba(34,211,238,0.12), transparent 55%),
          radial-gradient(700px 500px at 0% 100%, rgba(217,70,239,0.10), transparent 55%),
          #050506; }
        .lx-auth-grid { position:absolute; inset:0; opacity:0.5;
          background-image:
            linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px);
          background-size:46px 46px;
          -webkit-mask-image: radial-gradient(ellipse at 50% 38%, #000 28%, transparent 72%);
          mask-image: radial-gradient(ellipse at 50% 38%, #000 28%, transparent 72%); }
        .lx-auth-orb { position:absolute; border-radius:9999px; filter:blur(72px); opacity:0.55; will-change:transform; }
        .lx-auth-orb.o1 { width:440px; height:440px; left:-70px; top:-90px;
          background:radial-gradient(circle, rgba(124,92,255,0.9), transparent 70%); animation:lxFloatA 20s ease-in-out infinite; }
        .lx-auth-orb.o2 { width:400px; height:400px; right:-60px; top:18%;
          background:radial-gradient(circle, rgba(34,211,238,0.75), transparent 70%); animation:lxFloatB 24s ease-in-out infinite; }
        .lx-auth-orb.o3 { width:380px; height:380px; left:26%; bottom:-140px;
          background:radial-gradient(circle, rgba(217,70,239,0.7), transparent 70%); animation:lxFloatC 28s ease-in-out infinite; }
        .lx-auth-vignette { position:absolute; inset:0;
          background:radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.82) 100%); }
        @keyframes lxFloatA { 0%,100%{transform:translate(0,0)} 50%{transform:translate(46px,34px)} }
        @keyframes lxFloatB { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-38px,44px)} }
        @keyframes lxFloatC { 0%,100%{transform:translate(0,0)} 50%{transform:translate(28px,-34px)} }
        @media (prefers-reduced-motion: reduce) { .lx-auth-orb { animation:none !important; } }
      `}</style>
    </div>
  );
}
