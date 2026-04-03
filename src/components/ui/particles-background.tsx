'use client';

import { useCallback, useState, useEffect } from "react";
import type { Engine } from "tsparticles-engine";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export function ParticlesBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  if (!mounted) return null;

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: { color: { value: "transparent" } },
        fpsLimit: 60,
        particles: {
          color: { value: ["#FFFFFF", "#C084FC", "#3B82F6", "#8A2BE2"] },
          links: {
            enable: false,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: { default: "out" },
            random: true,
            speed: 0.6,
            straight: false,
          },
          number: { 
            density: { enable: true, area: 800 }, 
            value: 60 
          },
          opacity: { 
            value: { min: 0.3, max: 0.8 },
            animation: {
              enable: true,
              speed: 1,
              sync: false
            }
          },
          shape: { type: "circle" },
          size: { 
            value: { min: 1, max: 3 } 
          },
        },
        detectRetina: true,
      }}
      className="absolute inset-0 -z-10 pointer-events-none"
    />
  );
}
