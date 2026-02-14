import { createClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Get the 'code' from the URL
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  
  // 'next' is used to remember where the user was going
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    
    // EXCHANGE the code for a real session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Redirect to the final destination (usually dashboard)
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If something goes wrong, send them back to login
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}