'use client';

import React, { Component, ReactNode, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Fallback UI quando o motor 3D falha ou o buffer é corrompido.
 */
const ErrorFallback = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-muted/10 rounded-xl">
    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">3D Off</span>
  </div>
);

/**
 * Error Boundary estrito para isolar erros binários do motor Spline.
 * Necessário por ser um runtime externo que lida com WebWorkers e buffers.
 */
class SplineErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    // Logamos o erro de buffer apenas para depuração silenciosa
    if (error?.message?.includes('buffer')) {
      console.debug("Spline: Erro de buffer detectado e isolado.");
    }
  }

  render() {
    if (this.state.hasError) return <ErrorFallback />;
    return this.props.children;
  }
}

/**
 * Carregamento dinâmico do componente Spline para evitar execução no lado do servidor.
 */
const SplineRuntime = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-transparent">
      <Loader2 className="w-4 h-4 animate-spin text-primary opacity-20" />
    </div>
  ),
});

interface SplineSceneProps {
  scene: string;
  className?: string;
}

/**
 * Componente de Cena Spline ultra-resiliente.
 * Previne o crash "Data read, but end of buffer not reached" isolando o runtime.
 */
export function SplineScene({ scene, className }: SplineSceneProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className={cn("relative overflow-hidden select-none", className)}>
      <SplineErrorBoundary>
        <SplineRuntime 
          scene={scene} 
          onError={() => {
            // Este callback às vezes não é disparado por erros de buffer profundos,
            // por isso o ErrorBoundary acima é nossa rede de segurança principal.
          }}
        />
      </SplineErrorBoundary>
    </div>
  );
}
