
"use client";

import React, { useState, useEffect } from 'react';
import { useFinance } from "@/context/finance-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Link as LinkIcon, Heart, UserPlus, ShieldCheck, Mail } from "lucide-react";
import DashboardLayout from '../dashboard/layout';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

function SharingContent() {
  const { userProfile } = useFinance();
  const { toast } = useToast();
  const [partnerEmail, setPartnerEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  // Gera o link de convite baseado na URL atual e no ID do usuário
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      setInviteLink(`${baseUrl}/login?invite=${userProfile?.id || 'new'}`);
    }
  }, [userProfile?.id]);

  const handleCopyLink = async () => {
    if (!inviteLink) return;

    try {
      // Tenta usar a API moderna primeiro
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(inviteLink);
      } else {
        // Fallback para navegadores mais antigos ou restrições de segurança
        const textArea = document.createElement("textarea");
        textArea.value = inviteLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      toast({ 
        title: "Link Copiado! 🔗", 
        description: "O link de convite está na sua área de transferência. Você pode colar no WhatsApp ou E-mail." 
      });
    } catch (err) {
      toast({ 
        variant: "destructive",
        title: "Erro ao copiar", 
        description: "Não conseguimos copiar automaticamente. Por favor, copie o link exibido abaixo." 
      });
    }
  };

  const handleInvite = () => {
    if (!partnerEmail) {
      toast({
        variant: "destructive",
        title: "E-mail necessário",
        description: "Por favor, digite o e-mail do seu parceiro(a) para enviar o convite."
      });
      return;
    }

    const subject = encodeURIComponent("Convite para o Universe Organizze 🌌");
    const body = encodeURIComponent(`Olá! Quero gerenciar nossas finanças juntos no Universe Organizze.\n\nClique no link abaixo para se conectar à minha conta e começarmos a poupar juntos:\n\n${inviteLink}`);
    
    // Abre o cliente de e-mail padrão (Gmail, Outlook, Mail, etc.)
    window.location.href = `mailto:${partnerEmail}?subject=${subject}&body=${body}`;
    
    toast({ 
      title: "Abrindo E-mail...", 
      description: `Estamos preparando o convite para ${partnerEmail}. Finalize o envio no seu aplicativo.` 
    });
    setPartnerEmail("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-32 pt-8">
      <div className="space-y-2">
        <h2 className="text-5xl font-black tracking-tighter text-primary">Conectar Família</h2>
        <p className="text-slate-500 text-lg font-medium">Gerencie seu orçamento em conjunto com sua parceira.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-none bg-black/40 rounded-[32px] p-8 relative overflow-hidden">
          <CardHeader className="p-0 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20"><Heart size={24} /></div>
              <CardTitle className="text-2xl font-black">Convidar Parceiro(a)</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 px-1">E-mail da sua esposa / parceiro</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input 
                  placeholder="exemplo@gmail.com" 
                  type="email" 
                  value={partnerEmail} 
                  onChange={(e) => setPartnerEmail(e.target.value)} 
                  className="h-12 bg-white/5 border-none rounded-xl flex-1" 
                />
                <Button onClick={handleInvite} className="h-12 px-8 rounded-xl font-black shadow-xl shadow-primary/10">
                  <Mail size={18} className="mr-2" /> Enviar Convite
                </Button>
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/5 space-y-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase text-center">Ou compartilhe o link manualmente</p>
              <Button variant="outline" className="w-full h-14 rounded-xl font-black border-white/10 hover:bg-white/5 group" onClick={handleCopyLink}>
                <LinkIcon size={18} className="mr-2 text-primary group-hover:scale-110 transition-transform" /> 
                Copiar Link de Convite
              </Button>
              <div className="p-3 bg-white/5 rounded-xl border border-dashed border-white/10 overflow-hidden">
                <p className="text-[9px] font-mono text-slate-500 truncate select-all">{inviteLink}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-none bg-black/40 rounded-[32px] p-8">
          <CardHeader className="p-0 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-accent/20 text-accent rounded-2xl"><ShieldCheck size={24} /></div>
              <CardTitle className="text-2xl font-black">Status da Conexão</CardTitle>
            </div>
          </CardHeader>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02] text-center gap-4 min-h-[250px]">
            <div className="p-6 rounded-full bg-white/5">
              <Users size={48} className="text-slate-700 animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-400 italic">Aguardando sua parceira...</p>
              <p className="text-[10px] text-slate-600 font-medium max-w-[200px] mx-auto">
                Assim que ela acessar o link e fizer login, vocês passarão a gerenciar o mesmo saldo e transações.
              </p>
            </div>
            <Badge variant="outline" className="text-[9px] font-black uppercase px-4 py-1">Pendente</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function SharingPage() { return <DashboardLayout><SharingContent /></DashboardLayout>; }
