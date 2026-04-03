
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from "@/context/finance-context";
import { 
  Card, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle,
  BrainCircuit,
  Trash2,
  Repeat,
  Edit2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileDown,
  Search,
  SearchX,
  Check,
  X,
  PiggyBank
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { Transaction, TransactionType, TransactionFrequency } from '@/lib/types';
import DashboardLayout from '../dashboard/layout';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format, subMonths, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { StarButton } from "@/components/ui/star-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function TransactionsPage() {
  const { 
    filteredTransactions = [], 
    deleteTransaction, 
    addTransaction, 
    updateTransaction, 
    budget = [],
    accounts = [], 
    isLoading,
    viewDate,
    setViewDate,
    fixedExpenses = [],
    plannedMonthlyIncome,
    payday,
    deleteFixedExpense,
    addFixedExpense,
    updateBudget
  } = useFinance();

  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("history");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);
  const [isFixedDialogOpen, setIsFixedDialogOpen] = useState(false);
  
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  
  const [txForm, setTxForm] = useState({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'DEBITO' as TransactionType,
    frequency: 'VARIAVEL' as TransactionFrequency,
    category: '',
    accountId: '',
    status: 'confirmed' as const
  });

  const [salaryForm, setSalaryForm] = useState({
    income: plannedMonthlyIncome,
    payday: payday
  });

  const [fixedForm, setFixedForm] = useState({
    name: '',
    amount: 0,
    dayDue: 5,
    category: ''
  });

  useEffect(() => {
    setSalaryForm({ income: plannedMonthlyIncome, payday: payday });
  }, [plannedMonthlyIncome, payday]);

  const formatValue = (val: number) => {
    const rounded = Math.round(val * 100) / 100;
    const absValue = Math.abs(rounded);
    const formatted = absValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    if (rounded < -0.009) {
      return `-R$ ${formatted}`;
    }
    return `R$ ${formatted}`;
  };

  const searchedTransactions = useMemo(() => {
    const list = filteredTransactions || [];
    if (!searchTerm.trim()) return list;
    
    const term = searchTerm.toLowerCase();
    
    return list.filter(t => {
      const matchText = (t.description || '').toLowerCase().includes(term) || (t.category || '').toLowerCase().includes(term);
      const matchType = (term === 'entrada' || term === 'receita') ? t.type === 'CREDITO' : (term === 'saída' || term === 'gasto') ? t.type === 'DEBITO' : false;
      return matchText || matchType;
    });
  }, [filteredTransactions, searchTerm]);

  const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

  const handleOpenAdd = () => {
    setTxForm({
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      type: 'DEBITO',
      frequency: 'VARIAVEL',
      category: (budget || [])[0]?.name || 'Outros',
      accountId: (accounts || [])[0]?.id || '',
      status: 'confirmed'
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setTxForm({
      description: tx.description,
      amount: tx.amount,
      date: tx.date,
      type: tx.type,
      frequency: tx.frequency,
      category: tx.category,
      accountId: tx.accountId,
      status: tx.status
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveTransaction = () => {
    if (!txForm.description || !txForm.amount || !txForm.accountId || !txForm.category) {
      toast({ variant: "destructive", title: "Ops!", description: "Preencha todos os campos." });
      return;
    }

    if (editingTx) {
      updateTransaction(editingTx.id, txForm);
      setIsEditDialogOpen(false);
    } else {
      addTransaction(txForm);
      setIsAddDialogOpen(false);
    }
  };

  const handleSaveSalary = () => {
    updateBudget(budget, salaryForm.income, salaryForm.payday);
    setIsSalaryDialogOpen(false);
    toast({ title: "Salário atualizado!" });
  };

  const handleRemoveSalary = () => {
    updateBudget(budget, 0, 5);
    toast({ title: "Planejamento removido." });
  };

  const handleSaveFixed = () => {
    if (!fixedForm.name || !fixedForm.amount || !fixedForm.category) {
      toast({ variant: "destructive", title: "Ops!", description: "Preencha os dados do gasto fixo." });
      return;
    }
    addFixedExpense({
      ...fixedForm,
      active: true
    });
    setFixedForm({ name: '', amount: 0, dayDue: 5, category: (budget || [])[0]?.name || '' });
    setIsFixedDialogOpen(false);
    toast({ title: "Gasto fixo adicionado!" });
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteTransaction(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const monthYear = format(viewDate, "MMMM yyyy", { locale: ptBR });
    doc.setFontSize(20);
    doc.setTextColor(91, 14, 140);
    doc.text("Universe Organizze - Relatório", 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Período: ${monthYear}`, 14, 30);
    
    const tableData = searchedTransactions.map(t => [
      format(new Date(t.date + 'T12:00:00'), 'dd/MM/yyyy'),
      t.description,
      t.category,
      t.type === 'CREDITO' ? 'Entrada' : 'Saída',
      formatValue(t.type === 'DEBITO' ? -t.amount : t.amount)
    ]);
    
    (doc as any).autoTable({
      startY: 40,
      head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
      body: tableData,
      headStyles: { fillColor: [91, 14, 140] }
    });
    
    doc.save(`relatorio-universe-${format(viewDate, 'yyyy-MM')}.pdf`);
    toast({ title: "Relatório Gerado!" });
  };

  const handleCreateNewCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newId = `cat_${Math.random().toString(36).substr(2, 9)}`;
    const newCat = {
      id: newId,
      name: newCategoryName.trim(),
      percentage: 0,
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    };
    
    updateBudget([...budget, newCat], plannedMonthlyIncome);
    
    if (isAddDialogOpen || isEditDialogOpen) {
      setTxForm({...txForm, category: newCategoryName.trim()});
    } else if (isFixedDialogOpen) {
      setFixedForm({...fixedForm, category: newCategoryName.trim()});
    }
    
    setShowNewCategoryInput(false);
    setNewCategoryName("");
    toast({ title: "Categoria criada!" });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-7xl mx-auto">
          <div className="flex justify-between"><Skeleton className="h-12 w-48 bg-white/5" /><Skeleton className="h-12 w-64 bg-white/5" /></div>
          <Skeleton className="h-12 w-full rounded-2xl bg-white/5" />
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-20 w-full rounded-3xl bg-white/5" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10 pb-20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-primary">Transações</h2>
            <p className="text-slate-500 font-medium text-sm">Controle sua jornada financeira.</p>
          </div>
          {activeTab === "history" && (
            <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="outline" onClick={handleExportPDF} className="h-12 rounded-xl border-white/10">
                <FileDown className="size-5 mr-2" /> Exportar
              </Button>
              <StarButton onClick={handleOpenAdd} className="h-12 sm:h-14 px-6 sm:px-10">
                <Plus className="size-5" />
                <span>Novo Lançamento</span>
              </StarButton>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/5 w-full sm:w-auto">
            <TabsTrigger value="history" className="flex-1 rounded-xl px-8 font-bold">Movimentações</TabsTrigger>
            <TabsTrigger value="automation" className="flex-1 rounded-xl px-8 font-bold">Automações</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Busca rápida..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 pl-12 bg-black/40 border-white/5 rounded-2xl focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-10 w-10"><ChevronLeft size={18} /></Button>
                <span className="text-[10px] font-black uppercase text-primary px-4">{format(viewDate, "MMMM yyyy", { locale: ptBR })}</span>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-10 w-10"><ChevronRight size={18} /></Button>
              </div>
            </div>

            <Card className="border-none bg-black/40 rounded-[32px] overflow-hidden">
              <div className="p-4 sm:p-8 space-y-4">
                {searchedTransactions.length > 0 ? (
                  searchedTransactions.map((t) => {
                    const isInvestment = t.description?.startsWith('Aporte: ');
                    const isResgate = t.description?.startsWith('Resgate: ');
                    
                    return (
                      <div key={t.id} className="group flex items-center justify-between p-4 sm:p-6 bg-white/[0.03] border border-white/5 rounded-[24px] hover:border-primary/20 transition-all gap-3">
                        <div className="flex items-center gap-3 sm:gap-6 overflow-hidden flex-1">
                          <div className={cn(
                            "p-2.5 rounded-xl shrink-0", 
                            isInvestment ? "bg-primary/20 text-primary" : 
                            (t.type === 'CREDITO' || isResgate) ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {isInvestment || isResgate ? <PiggyBank className="size-6" /> : 
                             t.type === 'CREDITO' ? <ArrowUpCircle className="size-6" /> : <ArrowDownCircle className="size-6" />}
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-black text-sm sm:text-base text-white truncate">{t.description}</span>
                              {t.isAIProcessed && <BrainCircuit size={12} className="text-accent shrink-0" />}
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-500">
                              <span>{t.category}</span>
                              <div className="size-1 rounded-full bg-white/10" />
                              <span>{new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 ml-auto">
                          <p className={cn(
                            "font-black text-sm sm:text-xl", 
                            isInvestment ? "text-primary" : (t.type === 'CREDITO' || isResgate) ? "text-emerald-500" : "text-white"
                          )}>
                            {formatValue(isInvestment ? t.amount : (t.type === 'DEBITO' ? -t.amount : t.amount))}
                          </p>
                          <div className="flex gap-2 sm:opacity-0 group-hover:opacity-100 transition-all mt-2">
                            <button onClick={() => handleOpenEdit(t)} className="p-1.5 hover:bg-white/5 rounded-lg"><Edit2 size={14} className="text-slate-500 hover:text-primary" /></button>
                            <button onClick={() => setDeleteConfirmId(t.id)} className="p-1.5 hover:bg-white/5 rounded-lg"><Trash2 size={14} className="text-slate-500 hover:text-red-500" /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-16 text-center opacity-30 flex flex-col items-center gap-4">
                    <SearchX className="size-16" />
                    <p className="font-black uppercase text-xs tracking-widest">Nenhum lançamento encontrado</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none bg-black/40 rounded-[32px] overflow-hidden relative">
                <GlowingEffect spread={80} />
                <CardHeader className="p-8 relative z-20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><DollarSign className="size-6" /></div>
                      <div><CardTitle className="text-2xl font-black">Salário</CardTitle><CardDescription className="text-sm">Configuração de ganhos.</CardDescription></div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setIsSalaryDialogOpen(true)} className="h-8 w-8 p-0 rounded-full hover:bg-white/5">
                      <Plus size={18} className="text-emerald-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0 relative z-20">
                  {plannedMonthlyIncome > 0 ? (
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group transition-all hover:border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center font-black text-emerald-500">{payday}</div>
                        <p className="font-bold text-sm text-white">Salário Planejado</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-black text-emerald-500">{formatValue(plannedMonthlyIncome)}</p>
                        <button onClick={handleRemoveSalary} className="text-slate-500 hover:text-red-500 sm:opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center py-10 text-slate-600 text-xs font-bold uppercase tracking-widest">Nenhum salário planejado</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none bg-black/40 rounded-[32px] overflow-hidden relative">
                <GlowingEffect spread={80} />
                <CardHeader className="p-8 relative z-20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary"><Repeat className="size-6" /></div>
                      <div><CardTitle className="text-2xl font-black">Fixos</CardTitle><CardDescription className="text-sm">Contas recorrentes cadastradas.</CardDescription></div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setFixedForm({ name: '', amount: 0, dayDue: 5, category: (budget || [])[0]?.name || 'Outros' });
                      setIsFixedDialogOpen(true);
                    }} className="h-8 w-8 p-0 rounded-full hover:bg-white/5">
                      <Plus size={18} className="text-primary" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-3 relative z-20">
                  {(fixedExpenses || []).length > 0 ? (fixedExpenses || []).map(expense => (
                    <div key={expense.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl group transition-all hover:border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-primary">{expense.dayDue}</div>
                        <p className="font-bold text-xs text-white">{expense.name}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className="font-black text-xs text-white">{formatValue(-expense.amount)}</p>
                        <button onClick={() => deleteFixedExpense(expense.id)} className="text-slate-500 hover:text-red-500 sm:opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center py-10 text-slate-600 text-xs font-bold uppercase tracking-widest">Nenhum gasto fixo</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isSalaryDialogOpen} onOpenChange={setIsSalaryDialogOpen}>
        <DialogContent className="max-w-md rounded-[32px] p-8 bg-background border-white/10">
          <DialogHeader>
            <DialogTitle>Configurar Salário</DialogTitle>
            <DialogDescription>Ajuste sua renda mensal planejada.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">Valor da Renda (R$)</Label>
              <Input type="number" value={salaryForm.income || ""} onChange={(e) => setSalaryForm({...salaryForm, income: parseFloat(e.target.value) || 0})} className="h-12 bg-muted/50 border-none rounded-xl text-emerald-500 font-black" />
              <p className="text-[10px] font-bold text-emerald-500 px-1">Visualização: {formatValue(salaryForm.income)}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">Dia do Pagamento</Label>
              <Input type="number" min="1" max="31" value={salaryForm.payday || ""} onChange={(e) => setSalaryForm({...salaryForm, payday: parseInt(e.target.value) || 1})} className="h-12 bg-muted/50 border-none rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSalaryDialogOpen(false)} className="rounded-full">Cancelar</Button>
            <Button onClick={handleSaveSalary} className="rounded-full bg-primary font-black uppercase text-xs px-8">Salvar Configurações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFixedDialogOpen} onOpenChange={(open) => { if (!open) { setIsFixedDialogOpen(false); setShowNewCategoryInput(false); } }}>
        <DialogContent className="max-w-md rounded-[32px] p-8 bg-background border-white/10">
          <DialogHeader>
            <DialogTitle>Novo Gasto Fixo</DialogTitle>
            <DialogDescription>Cadastre uma conta que se repete todo mês.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">Nome do Gasto</Label>
              <Input value={fixedForm.name} onChange={(e) => setFixedForm({...fixedForm, name: e.target.value})} className="h-12 bg-muted/50 border-none rounded-xl" placeholder="Ex: Aluguel, Internet" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Valor (R$)</Label>
                <Input type="number" value={fixedForm.amount || ""} onChange={(e) => setFixedForm({...fixedForm, amount: parseFloat(e.target.value) || 0})} className="h-12 bg-muted/50 border-none rounded-xl text-primary font-black" />
                <p className="text-[10px] font-bold text-primary px-1">Visualização: {formatValue(fixedForm.amount)}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Dia do Vencimento</Label>
                <Input type="number" min="1" max="31" value={fixedForm.dayDue || ""} onChange={(e) => setFixedForm({...fixedForm, dayDue: parseInt(e.target.value) || 1})} className="h-12 bg-muted/50 border-none rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">Categoria do Orçamento</Label>
              {showNewCategoryInput ? (
                <div className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                  <Input 
                    value={newCategoryName} 
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nome da categoria"
                    className="h-12 bg-muted/50 border-none rounded-xl"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500" onClick={handleCreateNewCategory}><Check className="size-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl bg-red-500/10 text-red-500" onClick={() => setShowNewCategoryInput(false)}><X className="size-4" /></Button>
                </div>
              ) : (
                <Select value={fixedForm.category} onValueChange={(v) => v === "_NEW_" ? setShowNewCategoryInput(true) : setFixedForm({...fixedForm, category: v})}>
                  <SelectTrigger className="h-12 bg-muted/50 border-none rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="Nenhuma">Nenhuma</SelectItem>
                    <SelectSeparator />
                    {(budget || []).map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
                    <SelectSeparator />
                    <SelectItem value="_NEW_" className="text-primary font-bold">➕ Criar Nova...</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFixedDialogOpen(false)} className="rounded-full">Cancelar</Button>
            <Button onClick={handleSaveFixed} className="rounded-full bg-primary font-black uppercase text-xs px-8">Confirmar Automação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => { if (!open) { setIsAddDialogOpen(false); setIsEditDialogOpen(false); setShowNewCategoryInput(false); } }}>
        <DialogContent className="max-w-md rounded-[32px] p-8 bg-background border-white/10">
          <DialogHeader>
            <DialogTitle>{editingTx ? 'Editar' : 'Novo Lançamento'}</DialogTitle>
            <DialogDescription className="sr-only">Formulário para transações.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <Button variant={txForm.type === 'DEBITO' ? 'default' : 'outline'} onClick={() => setTxForm({...txForm, type: 'DEBITO'})} className="rounded-xl font-bold">Despesa</Button>
              <Button variant={txForm.type === 'CREDITO' ? 'default' : 'outline'} onClick={() => setTxForm({...txForm, type: 'CREDITO'})} className="rounded-xl font-bold">Receita</Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Descrição</Label>
                <Input value={txForm.description} onChange={(e) => setTxForm({...txForm, description: e.target.value})} className="h-12 bg-muted/50 border-none rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Valor</Label>
                  <Input type="number" value={txForm.amount || ""} onChange={(e) => setTxForm({...txForm, amount: parseFloat(e.target.value) || 0})} className="h-12 bg-muted/50 border-none rounded-xl text-primary font-black" />
                  <p className="text-[10px] font-bold text-primary px-1">Visualização: {formatValue(txForm.amount)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Data</Label>
                  <Input type="date" value={txForm.date} onChange={(e) => setTxForm({...txForm, date: e.target.value})} className="h-12 bg-muted/50 border-none rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Conta</Label>
                <Select value={txForm.accountId} onValueChange={(v) => setTxForm({...txForm, accountId: v})}>
                  <SelectTrigger className="h-12 bg-muted/50 border-none rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="rounded-2xl">{(accounts || []).map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Categoria</Label>
                {showNewCategoryInput ? (
                  <div className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                    <Input 
                      value={newCategoryName} 
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nome da categoria"
                      className="h-12 bg-muted/50 border-none rounded-xl"
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500" onClick={handleCreateNewCategory}><Check className="size-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl bg-red-500/10 text-red-500" onClick={() => setShowNewCategoryInput(false)}><X className="size-4" /></Button>
                  </div>
                ) : (
                  <Select value={txForm.category} onValueChange={(v) => v === "_NEW_" ? setShowNewCategoryInput(true) : setTxForm({...txForm, category: v})}>
                    <SelectTrigger className="h-12 bg-muted/50 border-none rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="Nenhuma">Nenhuma</SelectItem>
                      <SelectSeparator />
                      {(budget || []).map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
                      <SelectSeparator />
                      <SelectItem value="_NEW_" className="text-primary font-bold">➕ Criar Nova...</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }} className="rounded-full flex-1">Cancelar</Button>
            <StarButton onClick={handleSaveTransaction} className="rounded-full flex-1">Confirmar</StarButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="bg-background border-white/10 rounded-[32px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-red-600 rounded-full">Confirmar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
