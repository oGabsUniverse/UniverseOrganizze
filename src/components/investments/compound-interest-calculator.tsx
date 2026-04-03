
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, X, Sparkles, Coins, ArrowRight, Plus } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface CalculatorProps {
  onClose?: () => void;
  onCreateCaixinha?: (data: any) => void;
}

export function CompoundInterestCalculator({ onClose, onCreateCaixinha }: CalculatorProps) {
  const [initialValue, setInitialValue] = useState<number | "">(1000);
  const [monthlyValue, setMonthlyValue] = useState<number | "">(200);
  const [rate, setRate] = useState<number | "">(1);
  const [rateType, setRateType] = useState<'monthly' | 'annual'>('monthly');
  const [period, setPeriod] = useState<number | "">(12);
  const [periodType, setPeriodType] = useState<'months' | 'years'>('months');

  const [result, setResult] = useState({
    total: 0,
    totalInvested: 0,
    totalInterest: 0
  });

  useEffect(() => {
    const calculate = () => {
      const p = Number(initialValue) || 0;
      const pmt = Number(monthlyValue) || 0;
      const rVal = Number(rate) || 0;
      const r = rateType === 'annual' 
        ? Math.pow(1 + (rVal / 100), 1/12) - 1 
        : (rVal / 100);
      const n = (Number(period) || 0) * (periodType === 'years' ? 12 : 1);

      const fvPrincipal = p * Math.pow(1 + r, n);
      const fvSeries = r === 0 ? pmt * n : pmt * (Math.pow(1 + r, n) - 1) / r;
      
      const total = fvPrincipal + fvSeries;
      const totalInvested = p + (pmt * n);
      const totalInterest = total - totalInvested;
      
      setResult({ total, totalInvested, totalInterest });
    };

    calculate();
  }, [initialValue, monthlyValue, rate, rateType, period, periodType]);

  const handleNumberChange = (setter: (val: number | "") => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setter("");
    } else {
      setter(parseFloat(val));
    }
  };

  return (
    <div className="relative w-full h-full min-h-[600px] flex flex-col md:flex-row bg-white dark:bg-black overflow-hidden">
      <GlowingEffect spread={100} />
      
      {/* Form Section */}
      <div className="flex-1 p-10 md:p-12 space-y-10 relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-3xl font-black tracking-tighter text-primary flex items-center gap-3">
              <Calculator className="h-8 w-8" /> Simulador
            </h3>
            <p className="text-sm text-muted-foreground font-medium">Projete o futuro das suas caixinhas.</p>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-primary/5">
              <X className="h-6 w-6" />
            </Button>
          )}
        </div>

        <div className="grid gap-8">
          <div className="grid gap-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Valor Inicial (R$)</Label>
            <Input 
              type="number" 
              value={initialValue} 
              onChange={handleNumberChange(setInitialValue)}
              className="h-14 rounded-2xl bg-muted/30 border-none font-extrabold text-xl px-6"
              placeholder="0,00"
            />
            <p className="text-[10px] font-bold text-primary mt-1 px-1">
              Visualização: {(Number(initialValue) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          <div className="grid gap-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Aportes Mensais (R$)</Label>
            <Input 
              type="number" 
              value={monthlyValue} 
              onChange={handleNumberChange(setMonthlyValue)}
              className="h-14 rounded-2xl bg-muted/30 border-none font-extrabold text-xl px-6"
              placeholder="0,00"
            />
            <p className="text-[10px] font-bold text-primary mt-1 px-1">
              Visualização: {(Number(monthlyValue) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Rendimento (%)</Label>
              <Input type="number" step="0.01" value={rate} onChange={handleNumberChange(setRate)} className="h-14 rounded-2xl bg-muted/30 border-none font-extrabold text-xl px-6" />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Base</Label>
              <Select value={rateType} onValueChange={(v: any) => setRateType(v)}>
                <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-2xl"><SelectItem value="monthly">ao Mês</SelectItem><SelectItem value="annual">ao Ano</SelectItem></SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Período</Label>
              <Input type="number" value={period} onChange={handleNumberChange(setPeriod)} className="h-14 rounded-2xl bg-muted/30 border-none font-extrabold text-xl px-6" />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Unidade</Label>
              <Select value={periodType} onValueChange={(v: any) => setPeriodType(v)}>
                <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-2xl"><SelectItem value="months">Meses</SelectItem><SelectItem value="years">Anos</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 bg-universe-gradient p-10 md:p-12 text-white flex flex-col justify-center space-y-12 relative">
        <div className="absolute top-0 right-0 p-12 opacity-10"><TrendingUp size={250} /></div>

        <div className="space-y-2 relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60">Saldo Final Estimado</p>
          <h2 className="text-5xl font-black tracking-tighter">
            R$ {result.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </div>

        <div className="grid gap-6 relative z-10">
          <div className="flex items-center gap-5 bg-white/10 p-8 rounded-[32px] backdrop-blur-md border border-white/10">
            <div className="p-4 rounded-2xl bg-white/10 text-emerald-400"><Sparkles className="h-8 w-8" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total em Rendimentos</p>
              <p className="text-2xl font-bold text-emerald-400">+ R$ {result.totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        <div className="pt-6 relative z-10 space-y-6">
          <p className="text-xs font-medium text-white/40 italic leading-relaxed">* Simulação baseada em juros compostos constantes.</p>
          {onCreateCaixinha && (
            <Button onClick={() => onCreateCaixinha({ ...result, initialValue: Number(initialValue) || 0, rate: Number(rate) || 0, rateType })} className="w-full h-16 rounded-2xl bg-white text-primary font-black text-lg hover:bg-white/90 shadow-2xl">
              <Plus className="mr-2 h-6 w-6" /> Criar Caixinha com estes dados
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
