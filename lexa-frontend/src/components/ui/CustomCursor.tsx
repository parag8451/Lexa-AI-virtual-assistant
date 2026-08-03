import { useEffect, useRef } from "react";

export function CustomCursor({ enabled = false }: { enabled?: boolean }) {
  // Disabled by default to restore the native cursor. Enable only if explicitly requested.
  if (!enabled) return null;

  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let isVisible = false;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        cursor.style.opacity = "1";
      }
    };

    const handleMouseLeave = () => {
      isVisible = false;
      cursor.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      isVisible = true;
      cursor.style.opacity = "1";
    };

    const animate = () => {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;

      cursorX += dx * 0.18;
      cursorY += dy * 0.18;

      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-[99999] opacity-0 mix-blend-difference hidden md:block transition-opacity duration-300"
      style={{
        transform: "translate(-50%, -50%)",
        boxShadow: "0 0 12px rgba(255, 255, 255, 0.4)",
      }}
      aria-hidden="true"
    />
  );
}
