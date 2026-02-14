'use client';

import { createClient } from '@/lib/supabaseClient';
import { useState } from 'react';
import type { User } from '@supabase/supabase-js';

interface BookmarkFormProps {
  user: User;
  onBookmarkAdded: (newBookmark: any) => void;
}

export default function BookmarkForm({ user, onBookmarkAdded }: BookmarkFormProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const canSubmit = title.trim().length > 0 && isValidUrl(url) && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setLoading(true);

    const supabase = createClient();

    // insert and return the new data
    const { data, error: insertError } = await supabase
      .from('bookmarks')
      .insert([{
        user_id: user.id,
        title: title.trim(),
        url: url.trim(),
      }])
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Success
    setTitle('');
    setUrl('');
    setLoading(false);
    
    // Pass the actual database record back to the dashboard state
    onBookmarkAdded(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="React Docs"
          className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://react.dev"
          className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={!canSubmit}
        className={`w-full px-4 py-2 text-white rounded-md transition-colors ${
          canSubmit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {loading ? 'Adding...' : 'Add Bookmark'}
      </button>
    </form>
  );
}