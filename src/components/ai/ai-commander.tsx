
'use client';

import React, { useState } from 'react';
import { useFinance } from "@/context/finance-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrainCircuit, Send, X, Info, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { processNaturalTransaction } from '@/ai/flows/natural-language-transaction';

export function AICommander() {
  const { addTransaction, accounts, budget } = useFinance();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInterpret = async () => {
    if (!text.trim() || accounts.length === 0) return;
    
    setLoading(true);
    try {
      const result = await processNaturalTransaction({
        text,
        availableCategories: budget.map(b => b.name)
      });

      if (result.success) {
        addTransaction({
          description: result.description,
          amount: result.amount,
          date: new Date().toISOString().split('T')[0],
          type: result.type,
          category: result.category,
          accountId: accounts[0].id,
          status: 'confirmed',
          frequency: 'VARIAVEL',
          isAIProcessed: true,
          explanation: result.explanation
        });
        toast({ title: "Lançamento Confirmado! 🚀", description: result.explanation });
        setText("");
        setIsOpen(false);
      } else {
        toast({ variant: "destructive", title: "IA confusa", description: result.explanation });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro na IA", description: "Tente novamente em instantes." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-24 right-0 w-[320px] bg-black border border-white/10 rounded-[32px] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="font-black text-xs uppercase text-primary">Comando Rápido</span>
              <button onClick={() => setIsOpen(false)}><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <Input 
                  value={text} 
                  onChange={(e) => setText(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleInterpret()} 
                  className="h-12 bg-white/5 border-none rounded-xl pr-12" 
                  placeholder="Marmita 25..." 
                  disabled={loading}
                />
                <button 
                  onClick={handleInterpret} 
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary p-1.5 rounded-lg disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
              <p className="text-[9px] text-slate-500 font-bold px-1 flex items-center gap-1"><Info size={10} /> Diga algo como: "Gastei 30 de Uber"</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="h-16 w-16 bg-primary rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
      >
        <BrainCircuit className="text-white" />
      </button>
    </div>
  );
}
