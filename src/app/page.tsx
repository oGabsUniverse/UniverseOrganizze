
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Rocket } from "lucide-react";
import { useUser } from "@/firebase";

/**
 * Landing page with an optimized launch sequence.
 * Redirects immediately once auth state is known.
 */
export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // Redirect as soon as auth loading is finished
    if (!isUserLoading) {
      router.push(user ? "/initial" : "/login");
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-universe-gradient text-white">
      <div className="flex flex-col items-center gap-8 animate-in fade-in duration-500">
        <div className="p-8 rounded-[40px] bg-white/10 backdrop-blur-xl shadow-2xl border border-white/20 animate-pulse">
          <Rocket className="h-20 w-20 text-white animate-bounce" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black tracking-tighter">
            <span className="text-primary">Universe</span>
            <span className="text-white font-light">Organizze</span>
          </h1>
          <p className="text-white/60 font-bold uppercase tracking-[0.4em] text-xs">Sincronizando com a base...</p>
        </div>
      </div>
    </div>
  );
}
