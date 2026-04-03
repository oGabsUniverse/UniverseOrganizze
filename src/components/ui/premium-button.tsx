
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

export function PremiumButton({ children, className, variant = 'primary', ...props }: PremiumButtonProps) {
  const gradientMap = {
    primary: "from-primary via-accent to-primary",
    secondary: "from-secondary via-primary to-secondary",
    accent: "from-accent via-white to-accent"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.08, y: -4, rotateX: 5 }}
      whileTap={{ scale: 0.94 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative group p-[2px] rounded-2xl overflow-hidden transition-all duration-300 shadow-2xl hover:shadow-primary/50 perspective-[500px]",
        className
      )}
      {...props}
    >
      {/* 360 Degree Rotating Aura */}
      <motion.div 
        className={cn("absolute inset-[-150%] bg-gradient-to-r", gradientMap[variant])}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Glass Content Layer */}
      <div className="relative bg-black/90 rounded-[14px] px-10 py-4 backdrop-blur-xl flex items-center justify-center gap-3 group-hover:bg-black/70 transition-colors">
        <span className="text-white font-black uppercase tracking-widest text-[12px] drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          {children}
        </span>
      </div>
      
      {/* High-speed Shine Sweep */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
      />
    </motion.button>
  );
}
