'use client';

import { useState, useEffect } from 'react';
import { Memo, User } from '@/lib/types';
import { fetchPublicMemos } from '@/lib/memos-client'; // Adjust path as necessary
import { MemoCard } from './MemoCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Placeholder for i18n function
const i18n = (key: string) => key;

interface MemoListProps {
  initialMemos?: Memo[];
  // We need a source of users to fetch more memos.
  // This could come from a global state, context, or be fetched initially.
  // For now, let's assume we have a placeholder or a way to get this list.
  userSources: User[];
}

export function MemoList({ initialMemos = [], userSources }: MemoListProps) {
  const [memos, setMemos] = useState<Memo[]>(initialMemos);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Assume there's more initially if initialMemos isn't exhaustive
  const [error, setError] = useState<string | null>(null);

  // Placeholder: In a real app, you'd manage which users' memos have been fetched
  // or use a pagination mechanism if the API supports it.
  // For this example, fetchPublicMemos fetches from ALL users every time.
  // A more sophisticated approach would be needed for true "load more" from different pages/users.

  const handleLoadMore = async () => {
    if (!userSources || userSources.length === 0) {
      setError(i18n("No user sources configured to fetch more memos."));
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // This is a simplified "load more".
      // A real implementation would need pagination or tracking of fetched users/offsets.
      // Currently, it re-fetches all public memos from all users.
      // To simulate "more", we could filter out existing memo IDs, but that's not true pagination.
      const newMemos = await fetchPublicMemos(userSources);

      // Filter out duplicates if any (e.g., if re-fetching the same users)
      const currentMemoIds = new Set(memos.map(m => m.id));
      const uniqueNewMemos = newMemos.filter(nm => !currentMemoIds.has(nm.id));

      if (uniqueNewMemos.length > 0) {
        setMemos(prevMemos => [...prevMemos, ...uniqueNewMemos].sort((a, b) => b.createdTs - a.createdTs));
      } else {
        setHasMore(false); // No new unique memos found
      }
    } catch (err) {
      console.error("Failed to fetch more memos:", err);
      setError(i18n("Failed to load more memos. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to set initial memos if they arrive after component mount (e.g. from SSR props)
  useEffect(() => {
    setMemos(initialMemos);
  }, [initialMemos]);

  return (
    <div className="space-y-6">
      {memos.map((memo) => (
        <MemoCard key={memo.id} memo={memo} />
      ))}

      {error && <p className="text-red-500 text-center">{error}</p>}

      {hasMore && (
        <div className="text-center py-4">
          <Button onClick={handleLoadMore} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {i18n("Loading...")}
              </>
            ) : (
              i18n("Load More")
            )}
          </Button>
        </div>
      )}
      {!hasMore && memos.length > 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
          {i18n("No more memos to load.")}
        </p>
      )}
       {memos.length === 0 && !isLoading && !error && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
          {i18n("No memos to display yet.")}
        </p>
      )}
    </div>
  );
}
