'use client';

import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const handleSignIn = async () => {
    setSigningIn(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Sign in error:', error);
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Smart Bookmarks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Save and organize your favorite websites
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-8">
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {signingIn ? 'Signing in...' : 'Sign In with Google'}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Sign in with your Google account to get started
          </p>
        </div>
      </div>
    </div>
  );
}
