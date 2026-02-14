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
    const initDashboard = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Initial fetch of bookmarks
      const { data, error: fetchError } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!fetchError) {
        setBookmarks(data || []);
      }
      setLoading(false);
    };

    initDashboard();
  }, [router]);

  // Handle adding a bookmark locally (Optimistic Update)
  const handleBookmarkAdded = (newBookmark: any) => {
    setBookmarks((prev) => [newBookmark, ...prev]);
  };

  // Handle deleting a bookmark locally
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

  if (!user) return null;

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
          <BookmarkForm user={user} onBookmarkAdded={handleBookmarkAdded} />

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-8">Your Bookmarks</h2>
          <BookmarkList 
            user={user} 
            bookmarks={bookmarks} 
            onDelete={handleBookmarkDeleted} 
          />
        </div>
      </main>
    </div>
  );
}