
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowingEffectProps {
  spread?: number;
  glow?: boolean;
  disabled?: boolean;
  borderWidth?: number;
  className?: string;
}

/**
 * A glowing effect component that follows the mouse cursor.
 * Ideal for premium card borders. Improved for visibility and non-blocking interaction.
 */
export function GlowingEffect({
  spread = 80,
  glow = true,
  disabled = false,
  borderWidth = 2,
  className,
}: GlowingEffectProps) {
  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);
  const containerRef = useRef<HTMLDivElement>(null);

  const springConfig = { damping: 25, stiffness: 400 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container || disabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
      setIsHovered(false);
      mouseX.set(-500);
      mouseY.set(-500);
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [disabled, mouseX, mouseY]);

  // Vibrant gradient for the glow
  const background = useMotionTemplate`
    radial-gradient(
      ${spread}px circle at ${mouseXSpring}px ${mouseYSpring}px,
      rgba(138, 43, 226, 0.8),
      rgba(59, 130, 246, 0.6) 40%,
      transparent 80%
    )
  `;

  if (disabled) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 z-0 rounded-[inherit] pointer-events-none overflow-hidden",
        className
      )}
    >
      <motion.div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300",
          isHovered && "opacity-100"
        )}
        style={{
          padding: borderWidth,
          background: background,
          maskImage: `linear-gradient(black, black), linear-gradient(black, black)`,
          maskClip: "content-box, border-box",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
        }}
      />
    </div>
  );
}
