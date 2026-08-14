import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface MagneticButtonProps {
  children: React.ReactElement;
  strength?: number;
  className?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({ 
  children, 
  strength = 30,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    const element = containerRef.current;
    if (!element) return;
    
    // We only want the first child element if children is a single element
    const target = element.firstElementChild as HTMLElement;
    if (!target) return;
    
    const xTo = gsap.quickTo(target, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(target, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });
    
    const mouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = element.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      xTo((x / width) * strength);
      yTo((y / height) * strength);
    };
    
    const mouseLeave = () => {
      gsap.to(target, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
      xTo(0);
      yTo(0);
    };
    
    element.addEventListener("mousemove", mouseMove);
    element.addEventListener("mouseleave", mouseLeave);
    
    return () => {
      element.removeEventListener("mousemove", mouseMove);
      element.removeEventListener("mouseleave", mouseLeave);
    };
  }, { scope: containerRef });
  
  return (
    <div ref={containerRef} className={`inline-block ${className}`}>
      {children}
    </div>
  );
};
