'use client';

import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-black px-4">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Smart Bookmarks
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Save, organize, and access your favorite websites instantly
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Get started with Google OAuth authentication
          </p>
        </div>

        {user ? (
          <Link
            href="/dashboard"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
