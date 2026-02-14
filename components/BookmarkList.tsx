'use client';

import { createClient } from '@/lib/supabaseClient';
import { useState } from 'react';
import type { User } from '@supabase/supabase-js';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  created_at: string;
}

interface BookmarkListProps {
  user: User;
  bookmarks: Bookmark[];
  onDelete: (id: string) => void;
}

export default function BookmarkList({ bookmarks, onDelete, user }: BookmarkListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      onDelete(id);
    }
    setDeletingId(null);
  };

  if (bookmarks.length === 0) {
    return <p className="text-center py-8 text-gray-500">No bookmarks yet.</p>;
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id} className="p-4 border rounded-md dark:border-gray-700 flex justify-between items-center">
          <div className="min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">{bookmark.title}</h3>
            <a href={bookmark.url} target="_blank" className="text-blue-600 text-sm truncate block">{bookmark.url}</a>
          </div>
          <button
            onClick={() => handleDelete(bookmark.id)}
            disabled={deletingId === bookmark.id}
            className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm disabled:bg-gray-400"
          >
            {deletingId === bookmark.id ? '...' : 'Delete'}
          </button>
        </div>
      ))}
    </div>
  );
}