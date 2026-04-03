
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface TabItem {
  title: string;
  icon: LucideIcon;
}

interface ExpandableTabsProps {
  tabs: TabItem[];
  activeColor?: string;
  className?: string;
  activeTab?: number | null;
  onChange?: (index: number | null) => void;
}

export function ExpandableTabs({
  tabs,
  activeColor = 'text-primary',
  className,
  activeTab,
  onChange,
}: ExpandableTabsProps) {
  const [selected, setSelected] = React.useState<number | null>(activeTab ?? 0);

  React.useEffect(() => {
    if (activeTab !== undefined) {
      setSelected(activeTab);
    }
  }, [activeTab]);

  const handleSelect = (index: number) => {
    setSelected(index);
    onChange?.(index);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-1.5 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl shadow-primary/5',
        className
      )}
    >
      {tabs.map((tab, index) => {
        const isSelected = selected === index;
        const Icon = tab.icon;

        return (
          <button
            key={tab.title}
            onClick={() => handleSelect(index)}
            className={cn(
              'relative flex items-center justify-center rounded-xl transition-all duration-300 h-10 px-3 overflow-hidden',
              isSelected ? cn('bg-primary/10', activeColor) : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <div className="flex items-center gap-2 relative z-10">
              <Icon className="w-5 h-5 shrink-0" />
              <AnimatePresence initial={false} mode="wait">
                {isSelected && (
                  <motion.span
                    initial={{ width: 0, opacity: 0, x: -5 }}
                    animate={{ width: 'auto', opacity: 1, x: 0 }}
                    exit={{ width: 0, opacity: 0, x: -5 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="text-[10px] font-black uppercase tracking-[0.2em] overflow-hidden whitespace-nowrap"
                  >
                    {tab.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            {isSelected && (
              <motion.div
                layoutId="active-pill-glow"
                className="absolute inset-0 bg-primary/5 blur-md"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
