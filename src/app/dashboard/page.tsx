
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useFinance } from "@/context/finance-context";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Target, Plus, Trash2, BrainCircuit, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const {
    filteredTransactions = [],
    accounts = [],
    budget = [],
    plannedMonthlyIncome = 0,
    updateBudget,
    isLoading,
  } = useFinance();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatValue = (val: number) => {
    const rounded = Math.round(val * 100) / 100;
    const absValue = Math.abs(rounded);
    const formatted = absValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    // Regra: Somente exibe "-" se for negativo. Nada de "+" para positivos ou zero.
    if (rounded < -0.009) {
      return `-R$ ${formatted}`;
    }
    return `R$ ${formatted}`;
  };

  const budgetStats = useMemo(() => {
    const txList = filteredTransactions || [];
    return (budget || []).map((b) => {
      const spent = txList
        .filter((t) => t && t.type === "DEBITO" && t.category === b.name)
        .reduce((sum, t) => sum + t.amount, 0);

      const planned = (b.percentage / 100) * plannedMonthlyIncome;

      return {
        ...b,
        spent,
        planned,
      };
    });
  }, [budget, filteredTransactions, plannedMonthlyIncome]);

  const totalSpent = useMemo(() => {
    return budgetStats.reduce((sum, b) => sum + b.spent, 0);
  }, [budgetStats]);

  const forecastBalance = useMemo(() => {
    const currentBalance = (accounts || []).reduce((sum, acc) => sum + acc.balance, 0);
    const txList = filteredTransactions || [];
    const receivedIncome = txList
      .filter(t => t && t.type === 'CREDITO')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const remainingIncome = Math.max(0, plannedMonthlyIncome - receivedIncome);
    const expectedFutureExpenses = Math.max(0, plannedMonthlyIncome - totalSpent);
    
    return currentBalance + remainingIncome - expectedFutureExpenses;
  }, [accounts, filteredTransactions, plannedMonthlyIncome, totalSpent]);

  const handleUpdatePercentage = (id: string, percent: number) => {
    const updated = (budget || []).map((b) =>
      b.id === id ? { ...b, percentage: Math.min(100, Math.max(0, percent)) } : b
    );
    updateBudget(updated, plannedMonthlyIncome);
  };

  const handleUpdateName = (id: string, name: string) => {
    const updated = (budget || []).map((b) =>
      b.id === id ? { ...b, name } : b
    );
    updateBudget(updated, plannedMonthlyIncome);
  };

  const handleAddCategory = () => {
    const newCategory = {
      id: `cat_${Math.random().toString(36).substr(2, 9)}`,
      name: 'Nova Meta',
      percentage: 0,
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    };
    updateBudget([...(budget || []), newCategory], plannedMonthlyIncome);
  };

  const handleDeleteCategory = (id: string) => {
    const updated = (budget || []).filter(b => b.id !== id);
    updateBudget(updated, plannedMonthlyIncome);
  };

  const chartConfig = useMemo(() => {
    const config: any = {};
    (budget || []).forEach(b => {
      config[b.name] = { label: b.name, color: b.color };
    });
    return config;
  }, [budget]);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-20 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2"><Skeleton className="h-10 w-64 bg-white/5" /><Skeleton className="h-4 w-48 bg-white/5" /></div>
          <div className="flex gap-4"><Skeleton className="h-24 w-64 rounded-3xl bg-white/5" /><Skeleton className="h-24 w-64 rounded-3xl bg-white/5" /></div>
        </div>
        <Skeleton className="h-[500px] rounded-[40px] bg-white/5" />
      </div>
    );
  }

  const somaMetas = (budget || []).reduce((acc, b) => acc + b.percentage, 0);
  const percentTotalGasto = plannedMonthlyIncome > 0 ? (totalSpent / plannedMonthlyIncome) * 100 : 0;

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto overflow-x-hidden">
      {/* Header & Top Stats */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 w-full">
          <h2 className="text-4xl font-black tracking-tighter text-primary">Dashboard Financeiro</h2>
          <p className="text-muted-foreground font-medium text-sm">Insights inteligentes e planejamento do mês.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Card className="bg-white/5 border-none p-6 rounded-[32px] flex-1 sm:w-64 relative overflow-hidden group">
            <GlowingEffect spread={60} />
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Saldo Previsto</Label>
              <BrainCircuit size={14} className="text-primary" />
            </div>
            <div className="relative z-10">
              <p className="text-2xl font-black text-white">{formatValue(forecastBalance)}</p>
              <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">Projeção IA para fim do mês</p>
            </div>
          </Card>

          <Card className="bg-white/5 border-none p-6 rounded-[32px] flex-1 sm:w-64 relative overflow-hidden group">
            <GlowingEffect spread={60} />
            <Label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">Renda Mensal Planejada</Label>
            <div className="flex items-center gap-3 relative z-10">
              <span className="text-slate-500 font-black text-xl">R$</span>
              <input 
                type="number" 
                value={plannedMonthlyIncome || ""} 
                onChange={(e) => updateBudget(budget || [], parseFloat(e.target.value) || 0)}
                className="bg-transparent border-none h-10 text-3xl font-black p-0 focus-visible:ring-0 text-white outline-none w-full placeholder:text-white/20"
                placeholder="0"
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Lado Esquerdo: Metas + Gráfico (em layout flex para o gráfico ficar ao centro) */}
        <div className="space-y-8">
          <Card className="border-none bg-black/40 rounded-[40px] p-6 sm:p-10 overflow-hidden relative">
            <GlowingEffect spread={100} />
            <div className="relative z-10">
              <CardHeader className="p-0 mb-10 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary"><Target size={24} /></div>
                    Metas
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-medium text-sm ml-12">Distribua sua renda.</CardDescription>
                </div>
                <Button onClick={handleAddCategory} variant="outline" size="sm" className="rounded-full bg-primary/10 border-primary/20 text-primary font-black uppercase text-[10px] h-9 px-4">
                  <Plus size={14} className="mr-1" /> Novo
                </Button>
              </CardHeader>

              <div className="flex flex-col xl:flex-row items-center gap-10">
                {/* Lista de Metas */}
                <div className="flex-1 w-full space-y-8">
                  {(budget || []).map((b) => (
                    <div key={b.id} className="space-y-3 group/item">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: b.color }} />
                          <input 
                            type="text" 
                            value={b.name} 
                            onChange={(e) => handleUpdateName(b.id, e.target.value)} 
                            className="bg-transparent border-none text-xs font-black uppercase text-white outline-none w-32 focus:text-primary transition-colors" 
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/5 px-3 py-1 rounded-xl border border-white/5 flex items-center gap-1">
                            <input 
                              type="number" 
                              value={b.percentage} 
                              onChange={(e) => handleUpdatePercentage(b.id, parseInt(e.target.value) || 0)} 
                              className="w-10 bg-transparent text-sm font-black text-primary border-none p-0 text-right outline-none" 
                            />
                            <span className="text-[10px] font-black text-primary opacity-60">%</span>
                          </div>
                          <button onClick={() => handleDeleteCategory(b.id)} className="opacity-0 group-hover/item:opacity-100 text-slate-600 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={b.percentage} 
                        onChange={(e) => handleUpdatePercentage(b.id, parseInt(e.target.value) || 0)} 
                        className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary" 
                      />
                    </div>
                  ))}
                </div>

                {/* Gráfico de Pizza (Centralizado no contexto geral) */}
                <div className="shrink-0 flex flex-col items-center justify-center">
                  <div className="h-[240px] w-[240px] relative">
                    {mounted && (
                      <ChartContainer config={chartConfig} className="w-full h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie 
                              data={budget || []} 
                              dataKey="percentage" 
                              nameKey="name" 
                              cx="50%" 
                              cy="50%" 
                              innerRadius={60} 
                              outerRadius={90} 
                              paddingAngle={8} 
                              stroke="none"
                            >
                              {(budget || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} className="outline-none hover:opacity-80 transition-opacity" />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className={cn("text-3xl font-black tracking-tighter", somaMetas <= 100 ? "text-white" : "text-red-500")}>{somaMetas}%</span>
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Planejado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Lado Direito: Visão Analítica */}
        <div className="space-y-8">
          <Card className="border-none bg-black/40 rounded-[40px] p-6 sm:p-10 overflow-hidden relative">
            <GlowingEffect spread={100} />
            <div className="relative z-10 space-y-10">
              <CardHeader className="p-0">
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary"><BarChart3 size={24} /></div>
                  Visão Analítica
                </CardTitle>
              </CardHeader>

              <div className="overflow-x-auto scrollbar-none">
                <table className="w-full text-left border-separate border-spacing-y-6">
                  <thead>
                    <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      <th className="px-4">Budget</th>
                      <th className="px-4 text-center">Limite</th>
                      <th className="px-4 text-right">Gasto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetStats.map((stat) => (
                      <tr key={stat.id} className="group">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-tight">{stat.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center text-xs font-black text-white">{formatValue(stat.planned)}</td>
                        <td className={cn(
                          "px-4 py-2 text-right text-xs font-black",
                          stat.spent > stat.planned ? "text-red-500" : "text-white"
                        )}>{formatValue(stat.spent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-10 border-t border-white/5 space-y-8">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total Gastos</p>
                    <p className="text-4xl font-black text-primary">{formatValue(totalSpent)}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Uso Total</p>
                    <p className={cn("text-2xl font-black", percentTotalGasto > 100 ? "text-red-500" : "text-emerald-500")}>
                      {percentTotalGasto.toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Progress value={percentTotalGasto} className="h-2.5 bg-white/5" />
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-600 tracking-widest">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
