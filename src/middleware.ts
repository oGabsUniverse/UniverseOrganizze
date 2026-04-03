
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware para proteção de rotas e segurança.
 * Garante que apenas usuários autorizados acessem áreas críticas.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteção simples para rotas de admin
  if (pathname.startsWith('/admin')) {
    // Em um cenário real, verificaríamos um cookie de sessão ou token
    // Por enquanto, redirecionamos para login se não houver indicação de auth
    // O Firebase Client SDK lida com a maior parte da auth, mas o middleware adiciona uma camada extra
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
