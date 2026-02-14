'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import BookmarkForm from '@/components/BookmarkForm';
import BookmarkList from '@/components/BookmarkList';
import AuthButton from '@/components/AuthButton';
import type { User } from '@supabase/supabase-js';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    let channel: any;

    const initDashboard = async () => {
      // 1. Get User
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      
      if (error || !authUser) {
        router.push('/login');
        return;
      }
      setUser(authUser);

      // 2. Initial Data Fetch
      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      setBookmarks(data || []);
      setLoading(false);

      // 3. Real-time Subscription
      channel = supabase
        .channel(`bookmarks-realtime`)
        .on(
          'postgres_changes',
          {
            event: '*', 
            schema: 'public',
            table: 'bookmarks',
            filter: `user_id=eq.${authUser.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setBookmarks((prev) => {
                // Prevent duplicate if this tab was the one that added it
                if (prev.find((b) => b.id === payload.new.id)) return prev;
                return [payload.new, ...prev];
              });
            } else if (payload.eventType === 'DELETE') {
              setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id));
            }
          }
        )
        .subscribe();
    };

    initDashboard();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [router, supabase]);

  // Logic: Add to local state immediately (Optimistic)
  const handleBookmarkAdded = (newBookmark: any) => {
    setBookmarks((prev) => {
      if (prev.find((b) => b.id === newBookmark.id)) return prev;
      return [newBookmark, ...prev];
    });
  };

  // Logic: Remove from local state immediately
  const handleBookmarkDeleted = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <p className="text-gray-500">Loading your bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Bookmarks</h1>
          <AuthButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Add a New Bookmark</h2>
          {/* We use user! because loading check above ensures user exists */}
          <BookmarkForm user={user!} onBookmarkAdded={handleBookmarkAdded} />

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-8">Your Bookmarks</h2>
          <BookmarkList 
            user={user!} 
            bookmarks={bookmarks} 
            onDelete={handleBookmarkDeleted} 
          />
        </div>
      </main>
    </div>
  );
}