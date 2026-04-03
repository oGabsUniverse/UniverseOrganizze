
"use client";

import React, { useState, useRef } from 'react';
import { useFinance } from "@/context/finance-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, X, Trash2, TrendingUp, TrendingDown, FileSearch, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from '../dashboard/layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { parseBankStatement } from '@/ai/flows/parse-bank-statement';
import { cn } from '@/lib/utils';

function ImportContent() {
  const { addTransaction, accounts, budget } = useFinance();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewTransactions, setPreviewTransactions] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const processWithAI = async () => {
    if (!file || (accounts || []).length === 0) {
      toast({ variant: "destructive", title: "Erro", description: "Selecione um arquivo e tenha ao menos uma conta cadastrada." });
      return;
    }
    
    setIsProcessing(true);
    try {
      const dataUri = await fileToBase64(file);
      const result = await parseBankStatement({
        fileDataUri: dataUri,
        mimeType: file.type,
        availableCategories: (budget || []).map(b => b.name)
      });

      if (result.transactions && result.transactions.length > 0) {
        setPreviewTransactions(result.transactions.map(t => ({
          ...t,
          id: Math.random().toString(36).substr(2, 9),
          accountId: accounts[0].id,
          status: 'confirmed',
          frequency: 'VARIAVEL'
        })));
        toast({ title: "Extrato analisado!", description: `${result.transactions.length} transações encontradas.` });
      } else {
        toast({ variant: "destructive", title: "Nenhuma transação", description: "Não conseguimos identificar transações válidas." });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro na IA", description: "Falha ao processar o arquivo bancário." });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmImport = () => {
    previewTransactions.forEach(t => addTransaction(t));
    setPreviewTransactions([]);
    setFile(null);
    toast({ title: "Importação concluída!", description: "As transações foram sincronizadas com suas contas." });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-primary">Scanner de Extratos</h2>
        <p className="text-slate-500 text-sm font-medium">Use IA para ler seus PDFs e imagens bancárias automaticamente.</p>
      </div>

      {!previewTransactions.length ? (
        <Card className="bg-black/40 border-dashed border-white/10 p-8 sm:p-20 flex flex-col items-center gap-6 text-center">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <UploadCloud size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Arraste seu extrato aqui</h3>
            <p className="text-sm text-slate-500 max-w-xs">Suporta PDF e Imagens. A IA cuidará de extrair datas, valores e categorias.</p>
          </div>
          
          <input 
            type="file" 
            accept=".pdf,image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button variant="outline" className="h-12 rounded-xl px-8 border-white/10" onClick={() => fileInputRef.current?.click()}>
              {file ? 'Trocar Arquivo' : 'Selecionar Arquivo'}
            </Button>
            {file && (
              <Button onClick={processWithAI} disabled={isProcessing} className="h-12 rounded-xl px-8 bg-primary">
                {isProcessing ? <><Loader2 className="mr-2 animate-spin" /> Lendo Extrato...</> : 'Analisar com IA'}
              </Button>
            )}
          </div>

          {file && (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary animate-pulse">
              <FileText size={14} /> {file.name}
            </div>
          )}
        </Card>
      ) : (
        <Card className="bg-black/40 border-none overflow-hidden rounded-[32px]">
          <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500" />
              <h3 className="font-bold">Prévia da Importação</h3>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" onClick={() => setPreviewTransactions([])} className="text-slate-500">Cancelar</Button>
              <Button size="sm" onClick={confirmImport} className="bg-primary rounded-xl px-6">Importar Tudo</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5">
                  <TableHead className="text-[10px] font-black uppercase">Data</TableHead>
                  <TableHead className="text-[10px] font-black uppercase">Descrição</TableHead>
                  <TableHead className="text-[10px] font-black uppercase">Categoria</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewTransactions.map(t => (
                  <TableRow key={t.id} className="border-white/5">
                    <TableCell className="text-xs font-medium">{new Date(t.date + 'T12:00:00').toLocaleDateString()}</TableCell>
                    <TableCell className="text-xs font-bold text-white">{t.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[8px] uppercase">{t.category}</Badge>
                    </TableCell>
                    <TableCell className={cn("text-right font-black", t.type === 'CREDITO' ? 'text-emerald-500' : 'text-white')}>
                      {t.type === 'DEBITO' && t.amount > 0.009 ? '-' : ''} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function ImportPage() { return <DashboardLayout><ImportContent /></DashboardLayout>; }
