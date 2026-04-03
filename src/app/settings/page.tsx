
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from "@/context/finance-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Globe,
  Upload,
  Trash2,
  Lock,
  Database,
  Download,
  History,
  AlertTriangle,
  CheckCircle2,
  RefreshCcw,
  Wifi,
  WifiOff
} from "lucide-react";
import DashboardLayout from '../dashboard/layout';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const COSMOS_AVATARS = [
  { id: 'earth', icon: '🌍', name: 'Terra' },
  { id: 'saturn', icon: '🪐', name: 'Saturno' },
  { id: 'moon', icon: '🌕', name: 'Lua' },
  { id: 'sun', icon: '☀️', name: 'Sol' },
  { id: 'star', icon: '⭐', name: 'Estrela' },
  { id: 'galaxy', icon: '🌌', name: 'Galáxia' },
  { id: 'comet', icon: '☄️', name: 'Cometa' },
  { id: 'astronaut', icon: '👨‍🚀', name: 'Astronauta' },
];

function SettingsContent() {
  const { 
    userProfile, 
    updateProfile, 
    isLoading, 
    exportData, 
    importData, 
    undoLastAction, 
    actionLogs,
    isOnline,
    verifyIntegrity,
    repairData
  } = useFinance();
  const { toast } = useToast();
  const [name, setName] = useState(userProfile?.name || "");
  const [integrityStatus, setIntegrityStatus] = useState<{ok: boolean, issues: string[]} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile?.name) setName(userProfile.name);
  }, [userProfile?.name]);

  const handleUpdateName = async () => {
    if (!name.trim()) return;
    await updateProfile({ name: name.trim() });
    toast({ title: "Nome atualizado!" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      await updateProfile({ photoURL: reader.result as string, photoType: 'upload', avatarId: null });
      toast({ title: "Foto atualizada!" });
    };
    reader.readAsDataURL(file);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      await importData(content);
    };
    reader.readAsText(file);
  };

  const runIntegrityCheck = () => {
    const result = verifyIntegrity();
    setIntegrityStatus(result);
    if (result.ok) {
      toast({ title: "Integridade OK", description: "Todos os dados estão sincronizados." });
    } else {
      toast({ variant: "destructive", title: "Inconsistências encontradas", description: "Clique em Reparar para corrigir." });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-[50vh]"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black tracking-tighter text-primary">Ajustes</h2>
          <p className="text-muted-foreground font-medium">Gerenciamento e segurança do seu Universo.</p>
        </div>
        <Badge variant={isOnline ? "secondary" : "destructive"} className="h-10 px-4 rounded-xl gap-2 font-black uppercase tracking-widest">
          {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isOnline ? "Conectado" : "Offline (Sincronização Pendente)"}
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto max-w-full justify-start">
          <TabsTrigger value="profile" className="rounded-xl px-8 font-bold">Perfil</TabsTrigger>
          <TabsTrigger value="data" className="rounded-xl px-8 font-bold">Dados & Backup</TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl px-8 font-bold">Protocolos</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-8 animate-in fade-in duration-500">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="md:col-span-1 border-none bg-black/40 rounded-[32px] overflow-hidden p-6 relative">
              <div className="flex flex-col items-center gap-6 relative z-10">
                <div className="h-32 w-32 rounded-full bg-universe-gradient shadow-2xl flex items-center justify-center text-5xl border-4 border-white/10 overflow-hidden">
                  {userProfile?.photoURL ? <img src={userProfile.photoURL} alt="Perfil" className="h-full w-full object-cover" /> : (userProfile?.name || "U")[0].toUpperCase()}
                </div>
                <div className="text-center">
                  <p className="font-black text-lg">{userProfile?.name || 'Explorador'}</p>
                  <p className="text-xs text-slate-500">{userProfile?.email}</p>
                </div>
                <div className="grid gap-2 w-full">
                  <Button variant="outline" className="w-full rounded-xl border-white/10" onClick={() => fileInputRef.current?.click()}><Upload size={16} className="mr-2" /> Upload</Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                  <Button variant="ghost" className="w-full rounded-xl text-red-500 hover:bg-red-500/10" onClick={() => updateProfile({ photoType: 'initial', photoURL: null, avatarId: null })}><Trash2 size={16} className="mr-2" /> Remover</Button>
                </div>
              </div>
            </Card>

            <Card className="md:col-span-2 border-none bg-black/40 rounded-[32px] p-8">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center gap-2"><Globe size={20} className="text-primary" /> Identidade Visual</CardTitle>
              </CardHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 px-1">Seu Apelido</Label>
                  <div className="flex gap-3">
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl bg-white/5 border-none font-bold focus:ring-1 focus:ring-primary" />
                    <Button onClick={handleUpdateName} className="rounded-xl px-8 font-black">Salvar</Button>
                  </div>
                </div>
                <div className="pt-6 border-t border-white/5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 px-1 block mb-4">Avatares do Cosmos</Label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                    {COSMOS_AVATARS.map((avatar) => (
                      <button 
                        key={avatar.id} 
                        onClick={() => updateProfile({ photoType: 'avatar', avatarId: avatar.id, photoURL: null })} 
                        className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-2xl transition-all", userProfile?.avatarId === avatar.id ? 'bg-primary scale-110 shadow-xl' : 'bg-white/5 hover:bg-white/10')}
                        title={avatar.name}
                      >
                        {avatar.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-none bg-black/40 rounded-[32px] p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-primary/20 text-primary"><Database size={24} /></div>
                <div>
                  <CardTitle className="text-xl font-black">Backup de Segurança</CardTitle>
                  <p className="text-xs text-slate-500 font-medium">Exporte ou importe seus dados.</p>
                </div>
              </div>
              <div className="grid gap-4">
                <Button onClick={exportData} className="h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest">
                  <Download size={18} className="mr-2" /> Exportar Dados (JSON)
                </Button>
                <div className="relative">
                  <Button onClick={() => importInputRef.current?.click()} variant="outline" className="w-full h-14 rounded-2xl border-dashed border-white/20 hover:border-primary/50 text-slate-400 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest">
                    <RefreshCcw size={18} className="mr-2" /> Restaurar de um Arquivo
                  </Button>
                  <input type="file" ref={importInputRef} onChange={handleImport} className="hidden" accept=".json" />
                </div>
              </div>
            </Card>

            <Card className="border-none bg-black/40 rounded-[32px] p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-500"><History size={24} /></div>
                <div>
                  <CardTitle className="text-xl font-black">Log de Ações</CardTitle>
                  <p className="text-xs text-slate-500 font-medium">Recupere-se de erros recentes.</p>
                </div>
              </div>
              <div className="space-y-4">
                {actionLogs.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                    {actionLogs.slice(0, 3).map(log => (
                      <div key={log.id} className="flex items-center justify-between text-[10px] text-slate-400 bg-white/5 p-2 rounded-lg">
                        <span className="truncate max-w-[150px]">{log.description}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-600 italic">Nenhuma ação recente registrada.</p>
                )}
                <Button 
                  onClick={undoLastAction} 
                  disabled={actionLogs.length === 0}
                  className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase text-[10px] tracking-widest"
                >
                  <RefreshCcw size={16} className="mr-2" /> Desfazer Última Ação
                </Button>
              </div>
            </Card>
          </div>

          <Card className="border-none bg-black/40 rounded-[32px] p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={cn("p-4 rounded-2xl", integrityStatus?.ok === false ? "bg-amber-500/20 text-amber-500" : "bg-emerald-500/20 text-emerald-500")}>
                  {integrityStatus?.ok === false ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black">Integridade de Dados</h3>
                  <p className="text-slate-500 text-sm font-medium">Verifique se todos os saldos e cálculos estão consistentes.</p>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <Button variant="outline" onClick={runIntegrityCheck} className="flex-1 md:flex-none h-12 rounded-xl px-8 border-white/10 font-bold">Verificar</Button>
                {integrityStatus?.ok === false && (
                  <Button onClick={repairData} className="flex-1 md:flex-none h-12 rounded-xl px-8 bg-amber-600 hover:bg-amber-700 font-bold">Reparar Agora</Button>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 animate-in fade-in duration-500">
          <Card className="border-none bg-black/40 rounded-[32px] p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-accent/20 text-accent"><Shield size={24} /></div>
              <CardTitle>Nível de Acesso & Privacidade</CardTitle>
            </div>
            
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
              <div className="p-8 bg-white/5 rounded-full border border-white/5 shadow-2xl relative">
                <Lock className="h-16 w-16 text-slate-500" />
                <div className="absolute -top-2 -right-2 h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center text-white border-4 border-black">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="max-w-md space-y-2">
                <p className="font-black text-2xl uppercase tracking-tighter">Criptografia Ativa</p>
                <p className="text-muted-foreground text-sm leading-relaxed">Suas permissões são gerenciadas por tokens de sessão dinâmicos e autenticação biométrica/senha via Firebase Auth. Nenhum dado é acessível sem o seu segredo.</p>
              </div>
              <Button variant="outline" disabled className="rounded-full border-white/10 opacity-50 font-bold">Redefinir Token de Segurança</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() { return <DashboardLayout><SettingsContent /></DashboardLayout>; }
