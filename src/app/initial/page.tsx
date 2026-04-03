
"use client";

import React, { useMemo, useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { useFinance } from "@/context/finance-context";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Rocket,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  PiggyBank
} from "lucide-react";
import DashboardLayout from '../dashboard/layout';
import Link from "next/link";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths, addMonths, startOfWeek, endOfWeek, addWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ShaderAnimation = dynamic(() => import("@/components/ui/shader-animation").then(mod => mod.ShaderAnimation), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black/20 animate-pulse" />
});

const ParticlesBackground = dynamic(() => import("@/components/ui/particles-background").then(mod => mod.ParticlesBackground), { 
  ssr: false 
});

const AnimatedBarChart3D = dynamic(() => import("@/components/ui/animated-bar-chart-3d").then(mod => mod.AnimatedBarChart3D), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-white/5 rounded-[40px] animate-pulse" />
});

export default function InitialPage() {
  const { 
    transactions = [],
    accounts = [], 
    isEssentialLoading,
    viewDate,
    setViewDate,
    userProfile
  } = useFinance();

  const { user } = useUser();
  const [chartPeriod, setChartPeriod] = useState<'1m' | '3m' | '6m' | '1y'>('1m');
  const [hideValues, setHideValues] = useState(false);

  const stats = useMemo(() => {
    const txList = transactions || [];
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    
    const monthTxs = txList.filter(t => {
      if (!t || !t.date) return false;
      try {
        const tDate = parseISO(t.date);
        return isWithinInterval(tDate, { start: monthStart, end: monthEnd });
      } catch (e) {
        return false;
      }
    });

    // Filtramos para que investimentos não poluam o resumo de "Entradas" e "Saídas" do mês
    // Assim, ao investir (Aporte), o valor não conta como um gasto comum (saída).
    const income = monthTxs
      .filter(t => t.type === 'CREDITO' && !t.description?.startsWith('Resgate: '))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTxs
      .filter(t => t.type === 'DEBITO' && !t.description?.startsWith('Aporte: '))
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = (accounts || []).reduce((sum, acc) => sum + acc.balance, 0);
    
    return { income, expenses, currentBalance };
  }, [transactions, viewDate, accounts]);

  const chartData = useMemo(() => {
    const txList = transactions || [];
    if (chartPeriod === '1m') {
      const monthStart = startOfMonth(viewDate);
      return Array.from({ length: 4 }, (_, i) => {
        const start = addWeeks(monthStart, i);
        const end = i === 3 ? endOfMonth(viewDate) : endOfWeek(start, { locale: ptBR });
        const val = txList
          .filter(t => {
            if (!t || !t.date || t.type !== 'DEBITO') return false;
            // No gráfico de fluxo de gastos, mostramos apenas despesas reais, removendo aportes
            if (t.description?.startsWith('Aporte: ')) return false;
            try {
              return isWithinInterval(parseISO(t.date), { start, end });
            } catch (e) {
              return false;
            }
          })
          .reduce((sum, t) => sum + t.amount, 0);
        
        return { 
          name: `S${i + 1}`, 
          value: val, 
          color: '#8B5CF6' 
        };
      });
    }

    const monthsCount = chartPeriod === '3m' ? 3 : chartPeriod === '6m' ? 6 : 12;
    return Array.from({ length: monthsCount }, (_, i) => {
      const targetDate = subMonths(viewDate, (monthsCount - 1) - i);
      const start = startOfMonth(targetDate);
      const end = endOfMonth(targetDate);
      const val = txList
        .filter(t => {
          if (!t || !t.date || t.type !== 'DEBITO') return false;
          if (t.description?.startsWith('Aporte: ')) return false;
          try {
            return isWithinInterval(parseISO(t.date), { start, end });
          } catch (e) {
            return false;
          }
        })
        .reduce((sum, t) => sum + t.amount, 0);
      const monthName = format(targetDate, 'MMM', { locale: ptBR });
      
      return { 
        name: monthName.toUpperCase(), 
        value: val, 
        color: i === monthsCount - 1 ? '#C084FC' : '#8B5CF6' 
      };
    });
  }, [transactions, chartPeriod, viewDate]);

  const renderPrivateValue = (value: number) => {
    const isNegative = value < -0.009;
    const displayValue = Math.abs(value);
    const formattedValue = displayValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    return (
      <span className="inline-flex items-center gap-1">
        <span>R$</span>
        <span className={cn(
          "transition-all duration-300 inline-block",
          hideValues ? "blur-lg select-none opacity-40 scale-95" : "blur-0 opacity-100"
        )}>
          {isNegative ? `-${formattedValue}` : formattedValue}
        </span>
      </span>
    );
  };

  if (isEssentialLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-4 w-48" />
        </div>
      </DashboardLayout>
    );
  }

  const currentName = userProfile?.name || (user?.email ? user.email.split('@')[0] : 'Explorador');

  return (
    <DashboardLayout>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
        <ShaderAnimation className="absolute inset-0 w-full h-full opacity-60" />
        <div className="absolute inset-0 opacity-100">
          <ParticlesBackground />
        </div>
      </div>

      <div className="max-w-full mx-auto space-y-6 sm:space-y-10 pb-24 relative z-10 overflow-x-hidden">
        
        <div className="flex items-center justify-between px-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
            <h1 className="text-2xl sm:text-5xl font-black tracking-tighter text-white">
              Olá, <span className="text-primary">{currentName}</span>!
            </h1>
            <p className="text-slate-400 text-xs sm:text-lg font-medium">Sua jornada financeira sob controle.</p>
          </motion.div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setHideValues(!hideValues)}
              className="p-2.5 sm:p-4 bg-white/5 hover:bg-white/10 rounded-xl sm:rounded-2xl border border-white/10 transition-all active:scale-95"
            >
              {hideValues ? <EyeOff className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400" /> : <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
            </button>
            <div className="p-2.5 sm:p-4 bg-primary/10 rounded-xl sm:rounded-2xl border border-primary/20 hidden xs:block">
              <Rocket className="text-primary h-5 w-5 sm:h-8 sm:w-8" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-6 sm:p-10 bg-white/5 backdrop-blur-xl rounded-[24px] sm:rounded-[32px] border border-white/10 flex flex-col justify-center">
            <p className="text-[10px] sm:text-[12px] font-black uppercase tracking-widest text-primary mb-2">Saldo Total</p>
            <div className="text-2xl sm:text-5xl font-black text-white tracking-tighter">
              {renderPrivateValue(stats.currentBalance)}
            </div>
          </div>

          <div className="p-6 sm:p-10 bg-white/5 backdrop-blur-xl rounded-[24px] sm:rounded-[32px] border border-white/10 flex flex-col justify-center">
            <p className="text-[10px] sm:text-[12px] font-black uppercase tracking-widest text-emerald-500 mb-2">Entradas</p>
            <div className="text-2xl sm:text-5xl font-black text-emerald-500 tracking-tighter">
              {renderPrivateValue(stats.income)}
            </div>
          </div>

          <div className="p-6 sm:p-10 bg-white/5 backdrop-blur-xl rounded-[24px] sm:rounded-[32px] border border-white/10 flex flex-col justify-center">
            <p className="text-[10px] sm:text-[12px] font-black uppercase tracking-widest text-red-500 mb-2">Saídas</p>
            <div className="text-2xl sm:text-5xl font-black text-white tracking-tighter">
              {renderPrivateValue(-stats.expenses)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="p-6 sm:p-10 bg-white/5 backdrop-blur-xl rounded-[24px] sm:rounded-[40px] border border-white/10 space-y-6 sm:space-y-8 overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm sm:text-xl uppercase tracking-widest text-white">Últimas Transações</h3>
              <Link href="/transactions"><Button variant="ghost" size="sm" className="text-primary font-bold text-[10px] sm:text-sm">Ver Tudo</Button></Link>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {(transactions || []).length > 0 ? (transactions || []).slice(0, 5).map((t) => {
                const isInvestment = t.description?.startsWith('Aporte: ');
                const isResgate = t.description?.startsWith('Resgate: ');
                
                return (
                  <div key={t.id} className="flex items-center justify-between p-4 sm:p-6 bg-white/5 rounded-[16px] sm:rounded-[24px] border border-white/5">
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                      <div className={cn(
                        "w-10 h-10 flex items-center justify-center rounded-xl shrink-0", 
                        isInvestment ? "bg-primary/10 text-primary" : 
                        (t.type === 'CREDITO' || isResgate) ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {isInvestment || isResgate ? <PiggyBank size={16} /> : 
                         t.type === 'CREDITO' ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-xs sm:text-base text-white truncate">{t.description}</p>
                        <p className="text-[8px] sm:text-[10px] text-slate-500 uppercase font-black">{t.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-black text-xs sm:text-lg",
                        isInvestment ? "text-primary" : (t.type === 'CREDITO' || isResgate) ? "text-emerald-500" : "text-white"
                      )}>
                        {renderPrivateValue(isInvestment ? t.amount : (t.type === 'DEBITO' ? -t.amount : t.amount))}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-10 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest opacity-30">Sem movimentações</div>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-10 bg-white/5 backdrop-blur-xl rounded-[24px] sm:rounded-[48px] border border-white/10 min-h-[450px] flex flex-col gap-6 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 z-20">
              <h3 className="font-black text-sm sm:text-2xl uppercase tracking-widest text-white">Fluxo de Gastos</h3>
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setViewDate(subMonths(viewDate, 1))}>
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-[9px] font-black uppercase text-white min-w-[80px] text-center">
                  {format(viewDate, "MMM yyyy", { locale: ptBR })}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setViewDate(addMonths(viewDate, 1))}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center relative z-10 w-full">
              <div className="w-full h-full">
                <AnimatedBarChart3D data={chartData} hideValues={hideValues} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
