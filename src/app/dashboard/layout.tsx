
"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useFinance } from "@/context/finance-context";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  LogOut, 
  Moon, 
  Sun,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

function DashboardHeader() {
  const { userProfile } = useFinance();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const auth = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentName = userProfile?.name || 'Explorador';
  const displayInitial = currentName[0]?.toUpperCase() || 'U';

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('universe_auth_token');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 sm:h-20 shrink-0 items-center gap-2 bg-background/40 backdrop-blur-md px-3 sm:px-6 border-b border-white/5">
      <SidebarTrigger className="-ml-1 text-muted-foreground" />
      <Separator orientation="vertical" className="mx-4 h-4 opacity-10" />
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tighter text-primary">Universe</span>
          <span className="text-xl font-light tracking-tighter text-white hidden xs:inline">Organizze</span>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-black overflow-hidden border border-white/10">
                {userProfile?.photoURL ? <Avatar className="h-full w-full"><AvatarImage src={userProfile.photoURL} /><AvatarFallback>{displayInitial}</AvatarFallback></Avatar> : displayInitial}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background/90 backdrop-blur-xl rounded-2xl p-2">
              <DropdownMenuLabel className="font-black text-[10px] uppercase text-muted-foreground px-3 py-2">Menu</DropdownMenuLabel>
              <DropdownMenuItem className="cursor-pointer rounded-xl py-2.5" onClick={() => router.push('/settings')}>
                <UserIcon className="mr-2 h-4 w-4" /> Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive cursor-pointer rounded-xl py-2.5" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isEssentialLoading } = useFinance();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  if (isEssentialLoading || isUserLoading) return <div className="h-screen w-full flex items-center justify-center bg-black"><div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" /></div>;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent border-none">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 sm:p-8 bg-transparent">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
