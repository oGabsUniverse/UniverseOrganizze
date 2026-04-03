"use client";

import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  FileUp, 
  Settings,
  Users,
  LogOut,
  PiggyBank,
  CreditCard,
  Home
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { cn } from "@/lib/utils";
import { StarsBackground } from "@/components/ui/stars";

const mainItems = [
  { title: "Início", icon: Home, url: "/initial" },
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Transações", icon: ArrowLeftRight, url: "/transactions" },
  { title: "Minhas Contas", icon: Wallet, url: "/accounts" },
  { title: "Investimentos", icon: PiggyBank, url: "/investments" },
  { title: "Importar Extrato", icon: FileUp, url: "/import" },
];

const preferenceItems = [
  { title: "Compartilhar", icon: Users, url: "/sharing" },
  { title: "Ajustes", icon: Settings, url: "/settings" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const auth = useAuth();

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-transparent overflow-hidden">
      <StarsBackground className="h-full w-full">
        <div className="flex flex-col h-full relative z-10">
          <SidebarHeader className={cn(
            "flex items-center py-8",
            isCollapsed ? "justify-center" : "px-6"
          )}>
            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-start")}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg shrink-0">
                <CreditCard className="size-6" />
              </div>
              {!isCollapsed && (
                <div className="flex items-center gap-1.5 overflow-hidden ml-3">
                  <span className="text-lg font-black tracking-tighter text-primary">Universe</span>
                  <span className="text-lg font-light tracking-tighter text-white">Organizze</span>
                </div>
              )}
            </div>
          </SidebarHeader>
          
          <SidebarContent className={cn("space-y-6", isCollapsed ? "px-0" : "px-0")}>
            <SidebarGroup>
              {!isCollapsed && (
                <SidebarGroupLabel className="text-slate-500 font-bold uppercase text-[10px] tracking-widest px-4 mb-2">Menu</SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {mainItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={pathname === item.url}
                        className="h-12 rounded-xl transition-all data-[active=true]:bg-primary data-[active=true]:text-white text-slate-300 hover:text-white hover:bg-white/5"
                      >
                        <Link href={item.url} className="flex items-center">
                          <item.icon className="size-6 shrink-0" />
                          {!isCollapsed && <span className="ml-3 font-bold">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              {!isCollapsed && (
                <SidebarGroupLabel className="text-slate-500 font-bold uppercase text-[10px] tracking-widest px-4 mb-2">Preferências</SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {preferenceItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={pathname === item.url}
                        className="h-12 rounded-xl transition-all data-[active=true]:bg-primary data-[active=true]:text-white text-slate-300 hover:text-white hover:bg-white/5"
                      >
                        <Link href={item.url} className="flex items-center">
                          <item.icon className="size-6 shrink-0" />
                          {!isCollapsed && <span className="ml-3 font-bold">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-2 mt-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn(
                    "h-12 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-400 flex items-center",
                    isCollapsed ? "justify-center !p-0" : "px-4"
                  )}
                  onClick={() => signOut(auth)}
                >
                  <LogOut className="size-6 shrink-0" />
                  {!isCollapsed && <span className="ml-3 font-bold">Sair do App</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </div>
      </StarsBackground>
    </Sidebar>
  );
}
