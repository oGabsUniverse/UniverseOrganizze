
"use client";

import React, { useState } from 'react';
import { useFinance } from "@/context/finance-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, Trash2, Landmark, Edit2, CreditCard, Banknote, Coins, ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from '../dashboard/layout';
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { BankAccount, AccountType } from '@/lib/types';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

function AccountsContent() {
  const { accounts, addAccount, updateAccount, deleteAccount, transferBetweenAccounts, isLoading } = useFinance();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  
  const [newAccount, setNewAccount] = useState({
    name: '',
    owner: 'Eu',
    balance: 0,
    color: '#3b82f6',
    type: 'CHECKING' as AccountType,
    limit: 0
  });

  const [transferForm, setTransferForm] = useState({
    fromId: '',
    toId: '',
    amount: 0
  });

  const [editForm, setEditForm] = useState({
    name: '',
    owner: 'Eu',
    balance: 0,
    color: '#3b82f6',
    type: 'CHECKING' as AccountType,
    limit: 0
  });

  const formatValue = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleAddAccount = () => {
    if (!newAccount.name) return;
    addAccount({
      ...newAccount,
      currency: 'BRL'
    });
    setNewAccount({ name: '', owner: 'Eu', balance: 0, color: '#3b82f6', type: 'CHECKING', limit: 0 });
    setIsAddDialogOpen(false);
  };

  const handleOpenEdit = (acc: BankAccount) => {
    setEditingAccount(acc);
    setEditForm({
      name: acc.name,
      owner: acc.owner,
      balance: acc.balance,
      color: acc.color,
      type: acc.type || 'CHECKING',
      limit: acc.limit || 0
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateAccount = () => {
    if (editingAccount && editForm.name) {
      updateAccount(editingAccount.id, editForm);
      setIsEditDialogOpen(false);
      setEditingAccount(null);
    }
  };

  const handleTransfer = () => {
    if (!transferForm.fromId || !transferForm.toId || transferForm.amount <= 0) return;
    if (transferForm.fromId === transferForm.toId) return;
    
    transferBetweenAccounts(transferForm.fromId, transferForm.toId, transferForm.amount);
    setIsTransferDialogOpen(false);
    setTransferForm({ fromId: '', toId: '', amount: 0 });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'CREDIT_CARD': return <CreditCard size={20} />;
      case 'CHECKING': return <Landmark size={20} />;
      case 'SAVINGS': return <Coins size={20} />;
      case 'CASH': return <Banknote size={20} />;
      default: return <Wallet size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Minhas Contas</h2>
          <p className="text-muted-foreground font-medium">Gerencie seus bancos e cartões.</p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none h-12 rounded-xl border-white/10" onClick={() => setIsTransferDialogOpen(true)}>
            <ArrowRightLeft size={18} className="mr-2" /> Transferir
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 sm:flex-none shadow-md rounded-xl h-12 px-6">
                <Plus size={18} />
                <span className="ml-2">Nova Conta</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border-white/10 rounded-[32px]">
              <DialogHeader><DialogTitle>Adicionar Nova Conta</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Nome do Banco / Cartão</Label>
                  <Input value={newAccount.name} onChange={(e) => setNewAccount({...newAccount, name: e.target.value})} className="bg-white/5 border-none h-12 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Tipo</Label>
                    <Select value={newAccount.type} onValueChange={(v: any) => setNewAccount({...newAccount, type: v})}>
                      <SelectTrigger className="bg-white/5 border-none h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CHECKING">Corrente</SelectItem>
                        <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                        <SelectItem value="SAVINGS">Poupança</SelectItem>
                        <SelectItem value="CASH">Dinheiro Vivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500">
                      {newAccount.type === 'CREDIT_CARD' ? 'Fatura Atual' : 'Saldo Inicial'}
                    </Label>
                    <Input type="number" value={newAccount.balance || ""} onChange={(e) => setNewAccount({...newAccount, balance: parseFloat(e.target.value) || 0})} className="bg-white/5 border-none h-12 rounded-xl" />
                    <p className="text-[10px] font-bold text-primary px-1">Visualização: {formatValue(newAccount.balance)}</p>
                  </div>
                </div>
                {newAccount.type === 'CREDIT_CARD' && (
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Limite do Cartão</Label>
                    <Input type="number" value={newAccount.limit || ""} onChange={(e) => setNewAccount({...newAccount, limit: parseFloat(e.target.value) || 0})} className="bg-white/5 border-none h-12 rounded-xl" />
                    <p className="text-[10px] font-bold text-primary px-1">Visualização: {formatValue(newAccount.limit || 0)}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-full">Cancelar</Button>
                <Button onClick={handleAddAccount} className="rounded-full px-8">Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((acc) => (
          <Card key={acc.id} className="relative overflow-hidden group border-t-4 bg-black/40 border-none rounded-2xl" style={{ borderTop: `4px solid ${acc.color}` }}>
            <GlowingEffect spread={40} />
            <CardHeader className="relative z-20 pb-2">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-white/5 text-primary">
                  {getAccountIcon(acc.type)}
                </div>
                <Badge variant="outline" className="text-[10px] font-black uppercase">{acc.owner}</Badge>
              </div>
              <CardTitle className="text-xl mt-4">{acc.name}</CardTitle>
              <CardDescription className="text-slate-500">
                {acc.type === 'CREDIT_CARD' ? 'Fatura Atual' : 'Saldo Disponível'}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-20 space-y-4">
              <div className={cn(
                "text-3xl font-black",
                acc.type === 'CREDIT_CARD' ? "text-red-400" : "text-white"
              )}>
                R$ {acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              
              {acc.type === 'CREDIT_CARD' && acc.limit && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-slate-500">Uso do Limite</span>
                    <span className="text-white">R$ {acc.limit.toLocaleString('pt-BR')}</span>
                  </div>
                  <Progress value={(acc.balance / acc.limit) * 100} className="h-1.5 bg-white/5" />
                </div>
              )}
            </CardContent>
            <CardFooter className="relative z-20 border-t border-white/5 gap-2 pt-4">
              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase" onClick={() => handleOpenEdit(acc)}><Edit2 size={14} className="mr-2" /> Editar</Button>
              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-red-500" onClick={() => deleteAccount(acc.id)}><Trash2 size={14} className="mr-2" /> Remover</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Modal Transferência */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="bg-black border-white/10 rounded-[32px]">
          <DialogHeader><DialogTitle>Transferência entre Contas</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">De (Origem)</Label>
                <Select value={transferForm.fromId} onValueChange={(v) => setTransferForm({...transferForm, fromId: v})}>
                  <SelectTrigger className="bg-white/5 border-none h-12 rounded-xl">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Para (Destino)</Label>
                <Select value={transferForm.toId} onValueChange={(v) => setTransferForm({...transferForm, toId: v})}>
                  <SelectTrigger className="bg-white/5 border-none h-12 rounded-xl">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">Valor (R$)</Label>
              <Input type="number" value={transferForm.amount || ""} onChange={(e) => setTransferForm({...transferForm, amount: parseFloat(e.target.value) || 0})} className="bg-white/5 border-none h-14 rounded-xl text-xl font-black text-primary" />
              <p className="text-[10px] font-bold text-primary px-1">Visualização: {formatValue(transferForm.amount)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)} className="rounded-full">Cancelar</Button>
            <Button onClick={handleTransfer} className="rounded-full px-8">Confirmar Transferência</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-black border-white/10 rounded-[32px]">
          <DialogHeader><DialogTitle>Editar Conta</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">Nome</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="bg-white/5 border-none h-12 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Saldo/Fatura</Label>
                <Input type="number" value={editForm.balance || ""} onChange={(e) => setEditForm({...editForm, balance: parseFloat(e.target.value) || 0})} className="bg-white/5 border-none h-12 rounded-xl" />
                <p className="text-[10px] font-bold text-primary px-1">Visualização: {formatValue(editForm.balance)}</p>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Limite (Opcional)</Label>
                <Input type="number" value={editForm.limit || ""} onChange={(e) => setEditForm({...editForm, limit: parseFloat(e.target.value) || 0})} className="bg-white/5 border-none h-12 rounded-xl" />
                <p className="text-[10px] font-bold text-primary px-1">Visualização: {formatValue(editForm.limit || 0)}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-full">Cancelar</Button>
            <Button onClick={handleUpdateAccount} className="rounded-full px-8">Atualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AccountsPage() {
  return (
    <DashboardLayout>
      <AccountsContent />
    </DashboardLayout>
  );
}
