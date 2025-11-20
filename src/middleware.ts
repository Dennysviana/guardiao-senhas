import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Criar cliente Supabase para o middleware
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Obter token do cookie
  const token = request.cookies.get('sb-access-token')?.value;

  // Verificar se está autenticado
  const { data: { user } } = await supabase.auth.getUser(token);

  // Se não está autenticado e tenta acessar dashboard, redireciona para auth
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Se está autenticado e tenta acessar auth, redireciona para dashboard
  if (user && request.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Se está na raiz, redireciona para auth
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/auth'],
};
