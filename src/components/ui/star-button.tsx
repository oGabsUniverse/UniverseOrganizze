
"use client";

import React, { useRef, useEffect, ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface StarBackgroundProps {
  color?: string;
}

function StarBackground({ color }: StarBackgroundProps) {
  return (
    <svg
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 100 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-40"
    >
      <g clipPath="url(#clip0_star_btn)">
        <circle cx="15" cy="15" r="0.5" fill={color || "white"} fillOpacity="0.8" />
        <circle cx="45" cy="8" r="0.8" fill={color || "white"} fillOpacity="0.6" />
        <circle cx="75" cy="25" r="0.4" fill={color || "white"} fillOpacity="0.9" />
        <circle cx="90" cy="10" r="0.6" fill={color || "white"} fillOpacity="0.7" />
        <circle cx="10" cy="30" r="0.3" fill={color || "white"} fillOpacity="0.5" />
        <circle cx="60" cy="35" r="0.7" fill={color || "white"} fillOpacity="0.8" />
        <path d="M30 5L31 8H34L31.5 10L32.5 13L30 11L27.5 13L28.5 10L26 8H29L30 5Z" fill={color || "white"} fillOpacity="0.2" />
        <path d="M80 30L81 32H83L81.5 33.5L82 35.5L80 34L78 35.5L78.5 33.5L77 32H79L80 30Z" fill={color || "white"} fillOpacity="0.15" />
      </g>
      <defs>
        <clipPath id="clip0_star_btn">
          <rect width="100" height="40" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

interface StarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  lightWidth?: number;
  duration?: number;
  lightColor?: string;
  backgroundColor?: string;
  borderWidth?: number;
  className?: string;
}

export function StarButton({
  children,
  lightWidth = 120,
  duration = 4,
  lightColor = "#C084FC",
  backgroundColor = "#1E3A8A",
  borderWidth = 1.5,
  className,
  ...props
}: StarButtonProps) {
  const pathRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (pathRef.current) {
      const div = pathRef.current;
      div.style.setProperty(
        "--path",
        `path('M 0 0 H ${div.offsetWidth} V ${div.offsetHeight} H 0 V 0')`,
      );
    }
  }, []);

  return (
    <button
      style={
        {
          "--duration": duration,
          "--light-width": `${lightWidth}px`,
          "--light-color": lightColor,
          "--border-width": `${borderWidth}px`,
          isolation: "isolate",
        } as CSSProperties
      }
      ref={pathRef}
      className={cn(
        "relative z-[3] overflow-hidden h-12 px-8 inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-[20px] text-sm font-black transition-all disabled:pointer-events-none disabled:opacity-50 group/star-button hover:scale-[1.03] active:scale-[0.97] shadow-2xl hover:shadow-primary/20",
        className,
      )}
      {...props}
    >
      {/* Luz animada de borda */}
      <div
        className="absolute aspect-square inset-0 animate-star-btn bg-[radial-gradient(ellipse_at_center,var(--light-color),transparent,transparent)] opacity-70"
        style={
          {
            offsetPath: "var(--path)",
            offsetDistance: "0%",
            width: "var(--light-width)",
          } as CSSProperties
        }
      />
      
      {/* Camada de Fundo */}
      <div
        className="absolute inset-0 z-[1] bg-black/90 group-hover:bg-black transition-colors"
        style={{ borderRadius: "inherit" }}
      />

      {/* Estrelas */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <StarBackground color={lightColor} />
      </div>

      {/* Borda Fina */}
      <div
        className="absolute inset-0 border-white/10 z-[4] overflow-hidden rounded-[inherit] pointer-events-none"
        style={{ borderWidth: "var(--border-width)" }}
      />

      {/* Conteúdo Centralizado */}
      <span className="z-10 relative flex items-center justify-center gap-3 text-white font-bold tracking-tight drop-shadow-sm">
        {children}
      </span>
    </button>
  );
}
