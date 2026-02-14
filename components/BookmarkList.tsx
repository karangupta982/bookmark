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
    
    // Ensure we only delete if the user owns the record
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      onDelete(id);
    } else {
      console.error("Delete error:", error.message);
    }
    
    setDeletingId(null);
  };

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No bookmarks yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((bookmark) => (
        <div 
          key={bookmark.id} 
          className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors flex justify-between items-center"
        >
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {bookmark.title}
            </h3>
            <a 
              href={bookmark.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 dark:text-blue-400 text-sm truncate block hover:underline"
            >
              {bookmark.url}
            </a>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(bookmark.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => handleDelete(bookmark.id)}
            disabled={deletingId === bookmark.id}
            className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {deletingId === bookmark.id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      ))}
    </div>
  );
}