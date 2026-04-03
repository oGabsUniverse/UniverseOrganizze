
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Ghost } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Starfield } from "@/components/ui/starfield-1";
import { StarButton } from "@/components/ui/star-button";
import { useAuth, useUser, initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn } from '@/firebase';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Redireciona se o usuário já estiver logado ou acabar de logar
  useEffect(() => {
    if (user && !isUserLoading) {
      localStorage.setItem('universe_auth_token', 'true');
      router.push("/initial");
    }
  }, [user, isUserLoading, router]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setLoading(true);
      if (isRegistering) {
        initiateEmailSignUp(auth, email, password, (err) => {
          console.error('Sign up error:', err);
          setLoading(false);
          toast({ variant: "destructive", title: "Erro ao criar conta", description: err.message });
        });
      } else {
        initiateEmailSignIn(auth, email, password, (err) => {
          console.error('Sign in error:', err);
          setLoading(false);
          toast({ 
            variant: "destructive", 
            title: "Erro ao entrar", 
            description: "Verifique seu e-mail e senha. Note que a senha diferencia maiúsculas de minúsculas ou que a conta pode precisar ser criada novamente neste ambiente." 
          });
        });
      }
    } else {
      toast({ variant: "destructive", title: "Preencha os campos" });
    }
  };

  const handleQuickAccess = () => {
    setLoading(true);
    initiateAnonymousSignIn(auth, (err) => {
      console.error('Anonymous sign in error:', err);
      setLoading(false);
      toast({ variant: "destructive", title: "Erro no acesso rápido", description: err.message });
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black p-4 overflow-hidden">
      <Starfield quantity={300} speed={0.5} starColor="#3B82F6" opacity={0.2} />
      <Card className="relative z-10 w-full max-w-md bg-black/80 backdrop-blur-xl rounded-[40px] border-none shadow-2xl overflow-hidden">
        <div className="h-2 w-full bg-primary" />
        <CardHeader className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-primary text-white shadow-2xl mb-4">
            <Rocket className="h-10 w-10" />
          </div>
          <CardTitle className="text-4xl font-black">Universe <span className="font-light">Organizze</span></CardTitle>
          <CardDescription>Seu universo financeiro local e seguro.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 px-1">E-mail</Label>
              <Input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="h-14 bg-white/5 border-none rounded-2xl" 
                placeholder="astronauta@universo.com" 
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 px-1">Senha</Label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="h-14 bg-white/5 border-none rounded-2xl" 
                placeholder="••••••••" 
                disabled={loading}
              />
            </div>
            <StarButton type="submit" className="w-full h-14" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Processando...</span>
                </div>
              ) : isRegistering ? "Criar Minha Conta" : "Iniciar Missão"}
            </StarButton>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setLoading(false);
              }}
              className="text-xs font-bold text-primary hover:underline uppercase tracking-widest"
              disabled={loading}
            >
              {isRegistering ? "Já tenho uma conta? Entrar" : "Não tem conta? Criar Agora"}
            </button>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black">
              <span className="bg-black px-4 text-slate-500">ou</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-full bg-white/5 border-none" 
            onClick={handleQuickAccess} 
            disabled={loading}
          >
            <Ghost className="mr-2" /> Acesso Rápido Local
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
