
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BarData {
  name: string;
  value: number;
  color: string;
}

interface AnimatedBarChart3DProps {
  data: BarData[];
  hideValues?: boolean;
}

/**
 * Gráfico de Barras 3D nativo via CSS High-Performance.
 * Otimizado para telas pequenas com gaps e tamanhos reduzidos.
 */
export default function AnimatedBarChart3D({ data, hideValues = false }: AnimatedBarChart3DProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[250px] sm:h-[300px] w-full flex items-center justify-center text-slate-400 italic bg-black/20 rounded-[24px] sm:rounded-[32px] border border-white/5 px-4 text-center text-xs">
        Sem dados para exibir no momento.
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value)) || 1;

  return (
    <div className="w-full h-[300px] sm:h-[400px] flex items-end justify-center gap-3 sm:gap-8 px-4 sm:px-10 pb-16 perspective-[1000px] select-none overflow-visible">
      {data.map((item, i) => {
        const heightPercent = item.value === 0 ? 1 : (item.value / maxValue) * 100;
        const hasValue = item.value > 0;
        
        return (
          <div key={i} className="relative group flex-1 max-w-[28px] sm:max-w-[48px] flex flex-col items-center">
            {/* Tooltip Holográfico com Efeito Blur */}
            <div className="absolute -top-12 sm:-top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 bg-black/90 backdrop-blur-xl px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-white/20 whitespace-nowrap z-50 shadow-2xl pointer-events-none">
              <span className="text-[9px] sm:text-[11px] font-black text-white inline-flex items-center gap-1">
                <span>R$</span>
                <span className={cn(
                  "transition-all duration-300",
                  hideValues ? "blur-md opacity-40" : "blur-0"
                )}>
                  {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </span>
            </div>

            {/* O Cubo 3D */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: `${heightPercent}%`, opacity: 1 }}
              transition={{ 
                duration: 1.5, 
                delay: i * 0.05, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className="relative w-full preserve-3d transition-transform duration-500 group-hover:rotate-y-[20deg]"
            >
              {/* Face Frontal */}
              <div 
                className="absolute inset-0 z-20 border border-white/5 sm:border-white/10 shadow-2xl transition-opacity duration-300"
                style={{ 
                  backgroundColor: item.color, 
                  filter: 'brightness(1.1)',
                  opacity: hasValue ? 1 : 0.1 
                }}
              />
              
              {hasValue && (
                <>
                  {/* Face Superior */}
                  <div 
                    className="absolute top-0 left-0 w-full h-2 sm:h-8 -translate-y-1 sm:-translate-y-4 rotate-x-90 z-30"
                    style={{ backgroundColor: item.color, filter: 'brightness(1.4)' }}
                  />
                  
                  {/* Face Lateral Direita */}
                  <div 
                    className="absolute top-0 right-0 h-full w-2 sm:w-8 translate-x-1 sm:translate-x-4 rotate-y-90 z-10"
                    style={{ backgroundColor: item.color, filter: 'brightness(0.7)' }}
                  />
                </>
              )}
            </motion.div>

            {/* Legenda da Barra */}
            <div className="mt-4 sm:mt-6 text-center flex flex-col items-center gap-0.5 min-h-[24px] sm:min-h-[32px]">
              <p className="text-[7px] sm:text-[10px] font-black uppercase tracking-tighter whitespace-nowrap text-slate-300">
                {item.name}
              </p>
            </div>
          </div>
        );
      })}
      
      {/* Sombra de Base 3D */}
      <div className="absolute bottom-16 left-10 right-10 h-10 bg-black/40 blur-3xl rounded-full -z-10" />
    </div>
  );
}
