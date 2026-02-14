import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware' // Import your own helper!

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const pathname = request.nextUrl.pathname

  // Redirect unauthenticated users to login
  if (!user && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return Response.redirect(url)
  }

  // Redirect authenticated users away from login
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return Response.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}