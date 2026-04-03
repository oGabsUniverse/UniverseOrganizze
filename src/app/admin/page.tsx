
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona para o dashboard pois as funções de admin foram removidas
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
