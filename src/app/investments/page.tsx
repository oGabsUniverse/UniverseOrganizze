
"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useFinance } from "@/context/finance-context";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  PiggyBank, 
  Calculator,
  Trash2,
  Edit2,
  TrendingUp,
  Sparkles,
  X
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from '../dashboard/layout';
import { YieldType, Investment } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";

const CompoundInterestCalculator = dynamic(() => import('@/components/investments/compound-interest-calculator').then(mod => mod.CompoundInterestCalculator), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-black/40 animate-pulse rounded-[40px]" />
});

type InvestmentModalType = 'aporte' | 'resgate' | 'extrato' | 'edit' | 'yield' | null;

export default function InvestmentsPage() {
  const { 
    investments = [], 
    accounts = [], 
    budget = [],
    addInvestment, 
    updateInvestment, 
    deleteInvestment, 
    addTransaction,
    isLoading 
  } = useFinance();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<Investment | null>(null);
  const [activeModal, setActiveModal] = useState<InvestmentModalType>(null);
  const [modalValue, setModalValue] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  const [editForm, setEditForm] = useState({ name: '', goalValue: "" as string | number });

  const [newInv, setNewInv] = useState({
    name: '',
    type: 'savings' as const,
    appliedValue: "" as string,
    goalValue: "" as string,
    yieldType: 'CDI' as YieldType,
    yieldRate: 100,
  });

  const formatValue = (val: number) => {
    const rounded = Math.round(val * 100) / 100;
    const absValue = Math.abs(rounded);
    const formatted = absValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return rounded < -0.009 ? `-R$ ${formatted}` : `R$ ${formatted}`;
  };

  const handleAdd = () => {
    if (!newInv.name) return;
    const now = new Date().toISOString();
    const applied = parseFloat(newInv.appliedValue) || 0;
    addInvestment({
      ...newInv,
      appliedValue: applied,
      currentValue: applied,
      goalValue: parseFloat(newInv.goalValue) || 0,
      lastYieldDate: now,
      history: [{ id: Math.random().toString(36).substr(2, 9), date: now, type: 'aporte', value: applied, description: 'Aporte Inicial' }],
    });
    setIsDialogOpen(false);
    setNewInv({ name: '', type: 'savings', appliedValue: "", goalValue: "", yieldType: 'CDI', yieldRate: 100 });
  };

  const handleOpenEdit = (inv: Investment) => {
    setSelectedInv(inv);
    setEditForm({ name: inv.name, goalValue: inv.goalValue || "" });
    setActiveModal('edit');
  };

  const handleDeleteHistoryItem = (invId: string, itemId: string) => {
    const inv = investments.find(i => i.id === invId);
    if (!inv || !inv.history) return;
    
    const itemToRemove = inv.history.find((h: any) => h.id === itemId);
    if (!itemToRemove) return;

    const newHistory = inv.history.filter((h: any) => h.id !== itemId);
    
    let updates: any = { 
      history: newHistory,
      updatedAt: new Date().toISOString()
    };
    
    if (itemToRemove.type === 'rendimento') {
      updates.currentValue = Math.max(0, inv.currentValue - itemToRemove.value);
    } else if (itemToRemove.type === 'aporte') {
      updates.currentValue = Math.max(0, inv.currentValue - itemToRemove.value);
      updates.appliedValue = Math.max(0, inv.appliedValue - itemToRemove.value);
    } else if (itemToRemove.type === 'resgate') {
      updates.currentValue = inv.currentValue + itemToRemove.value;
      updates.appliedValue = inv.appliedValue + itemToRemove.value;
    }

    updateInvestment(invId, updates);
    toast({ title: "Registro removido com sucesso!" });
  };

  const handleInteraction = () => {
    if (!selectedInv) return;

    if (activeModal === 'edit') {
      updateInvestment(selectedInv.id, {
        name: editForm.name,
        goalValue: Number(editForm.goalValue) || 0,
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Caixinha atualizada!" });
      setActiveModal(null);
      return;
    }

    const val = parseFloat(modalValue);
    if (!val && activeModal !== 'extrato') return;

    const now = new Date().toISOString();

    if (activeModal === 'yield') {
      updateInvestment(selectedInv.id, {
        currentValue: selectedInv.currentValue + val,
        lastYieldDate: now,
        history: [{ 
          id: Math.random().toString(36).substr(2, 9), 
          date: now, 
          type: 'rendimento', 
          value: val, 
          description: `Rendimento Manual Adicionado` 
        }, ...(selectedInv.history || [])]
      });
      toast({ title: "Rendimento adicionado!", description: `Sua caixinha cresceu ${formatValue(val)}.` });
      setActiveModal(null);
      setModalValue("");
      return;
    }

    if (!selectedAccountId) {
      toast({ variant: "destructive", title: "Selecione uma conta", description: "É necessário vincular uma conta bancária." });
      return;
    }

    const account = (accounts || []).find(a => a.id === selectedAccountId);
    
    if (activeModal === 'aporte') {
      if (account && account.balance < val) {
        toast({ 
          variant: "destructive", 
          title: "Saldo Insuficiente", 
          description: `Você possui R$ ${account.balance.toLocaleString('pt-BR')} nesta conta.` 
        });
        return;
      }

      if (!selectedCategory) {
        toast({ variant: "destructive", title: "Selecione uma categoria", description: "Vincule esse aporte a uma meta." });
        return;
      }

      addTransaction({
        description: `Aporte: ${selectedInv.name}`,
        amount: val,
        date: now.split('T')[0],
        type: 'DEBITO',
        category: selectedCategory,
        accountId: selectedAccountId,
        investmentId: selectedInv.id,
        status: 'confirmed',
        frequency: 'VARIAVEL'
      });

      updateInvestment(selectedInv.id, {
        currentValue: selectedInv.currentValue + val,
        appliedValue: selectedInv.appliedValue + val,
        lastYieldDate: now,
        history: [{ 
          id: Math.random().toString(36).substr(2, 9), 
          date: now, 
          type: 'aporte', 
          value: val, 
          description: `Guardado via ${account?.name || 'conta'}` 
        }, ...(selectedInv.history || [])]
      });
    } else if (activeModal === 'resgate') {
      addTransaction({
        description: `Resgate: ${selectedInv.name}`,
        amount: val,
        date: now.split('T')[0],
        type: 'CREDITO',
        category: 'Investimentos',
        accountId: selectedAccountId,
        investmentId: selectedInv.id,
        status: 'confirmed',
        frequency: 'VARIAVEL'
      });

      updateInvestment(selectedInv.id, {
        currentValue: Math.max(0, selectedInv.currentValue - val),
        appliedValue: Math.max(0, selectedInv.appliedValue - val),
        lastYieldDate: now,
        history: [{ 
          id: Math.random().toString(36).substr(2, 9), 
          date: now, 
          type: 'resgate', 
          value: val, 
          description: `Resgatado para ${account?.name || 'conta'}` 
        }, ...(selectedInv.history || [])]
      });
    }

    setActiveModal(null); 
    setModalValue("");
    setSelectedCategory("");
    toast({ title: "Operação realizada!" });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10 pb-32 pt-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter text-white">Minhas Caixinhas</h1>
            <p className="text-slate-500 font-medium text-sm">Gerencie seus objetivos e acompanhe sua evolução.</p>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <Button variant="outline" onClick={() => setIsCalcOpen(true)} className="flex-1 sm:flex-none h-12 rounded-xl border-white/10">
              <Calculator size={18} className="mr-2" /> Simulador
            </Button>
            <Button onClick={() => setIsDialogOpen(true)} className="flex-1 sm:flex-none h-12 rounded-xl px-8 bg-primary">
              <Plus size={18} className="mr-2" /> Criar Caixinha
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(investments || []).map((inv) => (
            <Card key={inv.id} className="bg-black/40 border-none rounded-[32px] relative overflow-hidden group">
              <GlowingEffect spread={60} />
              <CardHeader className="p-8 pb-4 relative z-20">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary"><PiggyBank size={24} /></div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => handleOpenEdit(inv)} className="p-2 text-slate-500 hover:text-primary transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => deleteInvestment(inv.id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                <CardTitle className="text-xl font-bold mt-4">{inv.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6 relative z-20">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Saldo Guardado</p>
                  <div className="text-3xl font-black text-white">{formatValue(inv.currentValue)}</div>
                </div>
                
                {inv.goalValue ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                      <span className="text-slate-500">Meta: {formatValue(inv.goalValue)}</span>
                      <span className="text-primary">{Math.min(100, Math.round((inv.currentValue / inv.goalValue) * 100))}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (inv.currentValue / inv.goalValue) * 100)}%` }}
                        className="h-full bg-universe-gradient" 
                      />
                    </div>
                  </div>
                ) : null}
              </CardContent>
              <CardFooter className="p-2 bg-white/5 grid grid-cols-4 gap-1 relative z-20">
                <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase px-1" onClick={() => { setSelectedInv(inv); setActiveModal('aporte'); }}>Aportar</Button>
                <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase px-1" onClick={() => { setSelectedInv(inv); setActiveModal('resgate'); }}>Resgatar</Button>
                <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase px-1" onClick={() => { setSelectedInv(inv); setActiveModal('yield'); }}>Rendimento</Button>
                <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase px-1" onClick={() => { setSelectedInv(inv); setActiveModal('extrato'); }}>Extrato</Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-background border-white/10 rounded-[32px] p-8 max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Caixinha</DialogTitle>
              <DialogDescription className="sr-only">Crie um novo objetivo de investimento.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Nome do Objetivo</Label>
                <Input value={newInv.name} onChange={(e) => setNewInv({...newInv, name: e.target.value})} className="h-12 bg-muted/50 border-none rounded-xl" placeholder="Ex: Reserva de Emergência" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Valor Inicial</Label>
                  <Input type="number" value={newInv.appliedValue} onChange={(e) => setNewInv({...newInv, appliedValue: e.target.value})} className="h-12 bg-muted/50 border-none rounded-xl" placeholder="0,00" />
                  <p className="text-[10px] font-bold text-primary px-1">Visualização: {formatValue(parseFloat(newInv.appliedValue) || 0)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Meta Final</Label>
                  <Input type="number" value={newInv.goalValue} onChange={(e) => setNewInv({...newInv, goalValue: e.target.value})} className="h-12 bg-muted/50 border-none rounded-xl" placeholder="0,00" />
                  <p className="text-[10px] font-bold text-primary px-1">Visualização: {formatValue(parseFloat(newInv.goalValue) || 0)}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-full">Cancelar</Button>
              <Button onClick={handleAdd} className="rounded-full px-8 bg-primary">Criar Caixinha</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCalcOpen} onOpenChange={setIsCalcOpen}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none rounded-[40px]">
            <DialogHeader className="sr-only">
              <DialogTitle>Simulador de Juros Compostos</DialogTitle>
            </DialogHeader>
            <CompoundInterestCalculator onClose={() => setIsCalcOpen(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={!!activeModal} onOpenChange={() => { setActiveModal(null); setSelectedCategory(""); setModalValue(""); }}>
          <DialogContent className="bg-black border-white/10 rounded-[32px] p-8">
            <DialogHeader>
              <DialogTitle className="capitalize">
                {activeModal === 'aporte' && 'Guardar Dinheiro'}
                {activeModal === 'resgate' && 'Resgatar para Conta'}
                {activeModal === 'yield' && 'Lançar Rendimento'}
                {activeModal === 'edit' && 'Editar Caixinha'}
                {activeModal === 'extrato' && 'Histórico da Caixinha'}
              </DialogTitle>
              <DialogDescription>Caixinha: {selectedInv?.name}</DialogDescription>
            </DialogHeader>
            
            {activeModal === 'edit' && (
              <div className="py-4 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Novo Nome</Label>
                  <Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="h-12 bg-white/5 border-none rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Valor da Meta (R$)</Label>
                  <Input type="number" value={editForm.goalValue} onChange={(e) => setEditForm({...editForm, goalValue: e.target.value})} className="h-12 bg-white/5 border-none rounded-xl" />
                  <p className="text-[10px] font-bold text-primary px-1">Visualização: {formatValue(parseFloat(editForm.goalValue.toString()) || 0)}</p>
                </div>
                <Button onClick={handleInteraction} className="w-full h-12 rounded-xl bg-primary font-black uppercase text-xs">Salvar Alterações</Button>
              </div>
            )}

            {activeModal === 'yield' && (
              <div className="py-4 space-y-6">
                <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-2xl border border-primary/10 gap-3 text-center">
                  <div className="p-3 bg-primary/20 rounded-full text-primary"><Sparkles size={24} /></div>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">Adicione o valor que sua caixinha rendeu.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Quanto rendeu? (R$)</Label>
                  <Input type="number" value={modalValue} onChange={(e) => setModalValue(e.target.value)} className="h-14 bg-white/5 border-none rounded-xl text-xl font-black text-emerald-500" placeholder="0,00" autoFocus />
                  <p className="text-[10px] font-bold text-emerald-500 px-1">Visualização: {formatValue(parseFloat(modalValue) || 0)}</p>
                </div>
                <Button onClick={handleInteraction} className="w-full h-12 rounded-xl bg-primary font-black uppercase text-xs">Confirmar Rendimento</Button>
              </div>
            )}

            {(activeModal === 'aporte' || activeModal === 'resgate') && (
              <div className="py-4 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Conta Bancária</Label>
                  <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                    <SelectTrigger className="h-12 bg-white/5 border-none rounded-xl">
                      <SelectValue placeholder="Origem/Destino do dinheiro" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {(accounts || []).map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} (Saldo: {formatValue(acc.balance)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {activeModal === 'aporte' && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Categoria do Orçamento</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-12 bg-white/5 border-none rounded-xl">
                        <SelectValue placeholder="Vincule a uma meta" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="Nenhuma">Nenhuma</SelectItem>
                        {(budget || []).map(b => (
                          <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Valor (R$)</Label>
                  <Input type="number" value={modalValue} onChange={(e) => setModalValue(e.target.value)} className="h-14 bg-white/5 border-none rounded-xl text-xl font-black text-primary" placeholder="0,00" />
                  <p className="text-[10px] font-bold text-primary px-1">Visualização: {formatValue(parseFloat(modalValue) || 0)}</p>
                </div>
                <Button onClick={handleInteraction} className="w-full h-12 rounded-xl bg-primary font-black uppercase text-xs">Confirmar Operação</Button>
              </div>
            )}

            {activeModal === 'extrato' && (
              <ScrollArea className="h-[300px] mt-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 bg-white/5">
                      <TableHead className="text-[10px] font-black uppercase">Data</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Tipo</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase">Valor</TableHead>
                      <TableHead className="w-[40px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInv?.history?.length ? selectedInv.history.map((log: any) => (
                      <TableRow key={log.id} className="border-white/5 group">
                        <TableCell className="text-xs">{new Date(log.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="capitalize text-xs font-bold">
                          {log.type === 'rendimento' ? (
                            <span className="flex items-center gap-1 text-emerald-400"><TrendingUp size={10} /> Rendimento</span>
                          ) : (
                            <span className="text-slate-300">{log.type}</span>
                          )}
                        </TableCell>
                        <TableCell className={cn("text-right font-black text-xs", log.type === 'resgate' ? 'text-red-400' : 'text-emerald-400')}>
                          {log.type === 'resgate' ? '-' : ''}R$ {log.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <button 
                            onClick={() => selectedInv && handleDeleteHistoryItem(selectedInv.id, log.id)}
                            className="p-1 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-500 text-xs">Nenhum registro encontrado.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
