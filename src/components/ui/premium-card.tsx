
'use client';

import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GlowingEffect } from './glowing-effect';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function PremiumCard({ children, className, delay = 0 }: PremiumCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { damping: 20, stiffness: 300 });
  const mouseYSpring = useSpring(y, { damping: 20, stiffness: 300 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="perspective-[1500px]">
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={cn(
          "relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[40px] overflow-hidden shadow-3xl transition-all duration-500 hover:shadow-primary/40 group",
          className
        )}
      >
        <GlowingEffect spread={120} className="opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 p-8" style={{ transform: "translateZ(60px)" }}>
          {children}
        </div>
        
        {/* Animated Inner Shine */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/5 via-transparent to-primary/5 pointer-events-none" />
        
        {/* Holographic Border Effect */}
        <div className="absolute inset-0 border border-white/5 rounded-[40px] pointer-events-none" />
      </motion.div>
    </div>
  );
}
