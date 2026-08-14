import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "./button";

gsap.registerPlugin(useGSAP);

export const InteractiveHoverButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const circleRef = useRef<HTMLDivElement>(null);
    
    // Use an internal ref to access the DOM node for GSAP, but also forward the external ref
    const setRefs = React.useCallback(
      (node: HTMLButtonElement) => {
        buttonRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }
      },
      [ref]
    );

    useGSAP(() => {
      const button = buttonRef.current;
      const circle = circleRef.current;
      
      if (!button || !circle) return;

      const enterAnimation = (e: MouseEvent) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        gsap.set(circle, { x, y, scale: 0, opacity: 1 });
        gsap.to(circle, {
          scale: 3,
          duration: 0.5,
          ease: "power2.out",
        });
        
        // Optional text bump
        const text = button.querySelector('.button-text');
        if (text) {
           gsap.to(text, { scale: 1.05, duration: 0.3, ease: "back.out(1.7)" });
        }
      };

      const leaveAnimation = () => {
        gsap.to(circle, {
          scale: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power2.inOut",
        });
        
        const text = button.querySelector('.button-text');
        if (text) {
           gsap.to(text, { scale: 1, duration: 0.3, ease: "back.out(1.7)" });
        }
      };

      button.addEventListener("mouseenter", enterAnimation);
      button.addEventListener("mouseleave", leaveAnimation);

      return () => {
        button.removeEventListener("mouseenter", enterAnimation);
        button.removeEventListener("mouseleave", leaveAnimation);
      };
    }, { scope: buttonRef });

    return (
      <button
        ref={setRefs}
        className={cn(
          buttonVariants({ variant, size }), 
          "relative overflow-hidden group",
          className
        )}
        {...props}
      >
        <span 
          className="button-text relative z-10 flex items-center justify-center gap-2"
        >
          {children}
        </span>
        <div
          ref={circleRef}
          className="pointer-events-none absolute left-0 top-0 h-[100px] w-[100px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 opacity-0 mix-blend-overlay z-0"
        />
      </button>
    );
  }
);
InteractiveHoverButton.displayName = "InteractiveHoverButton";
