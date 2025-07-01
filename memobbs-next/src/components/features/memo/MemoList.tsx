'use client';

import { useState, useEffect, useCallback } from 'react';
import { Memo, User } from '@/lib/types';
import { fetchPublicMemos } from '@/lib/memos-client';
import { MemoCard } from './MemoCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation'; // Added useRouter for potential future use

// Placeholder for i18n function
const i18n = (key: string) => key;

interface MemoListProps {
  initialMemos?: Memo[];
  userSources: User[];
}

export function MemoList({ initialMemos = [], userSources }: MemoListProps) {
  const [memos, setMemos] = useState<Memo[]>(initialMemos);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  // const router = useRouter(); // For potential future use like setting page numbers

  const searchQuery = searchParams?.get('q') || '';
  const viewMode = searchParams?.get('view') || 'list'; // 'list' or 'grid'

  const loadMemos = useCallback(async (isLoadMore = false) => {
    if (!userSources || userSources.length === 0) {
      setError(i18n("No user sources configured to fetch memos."));
      setHasMore(false);
      if (!isLoadMore) setMemos([]); // Clear memos if no users and not loading more
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let fetchedMemos = await fetchPublicMemos(userSources);

      // Apply search query filtering (client-side for this example)
      if (searchQuery) {
        fetchedMemos = fetchedMemos.filter(memo =>
          memo.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          memo.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
          // Add more fields to search if needed
        );
      }

      // Sort all memos (initial + new, or just new if not loadMore)
      const combinedMemos = isLoadMore ? [...memos, ...fetchedMemos] : fetchedMemos;

      // Remove duplicates based on ID and sort
      const uniqueMemoIds = new Set<number>();
      const uniqueMemos = combinedMemos.filter(memo => {
        if (uniqueMemoIds.has(memo.id)) {
          return false;
        }
        uniqueMemoIds.add(memo.id);
        return true;
      }).sort((a, b) => b.createdTs - a.createdTs);


      setMemos(uniqueMemos);

      // Simplified "hasMore" logic: if the latest fetch brought fewer memos than a page size, assume no more.
      // This is not perfect as fetchPublicMemos fetches all.
      // A proper API would return pagination info.
      if (isLoadMore) {
          const currentMemoCount = memos.length;
          if(uniqueMemos.length === currentMemoCount && fetchedMemos.length > 0) { // No new unique memos added from this fetch
            setHasMore(false);
          } else if (fetchedMemos.length === 0 && searchQuery) { // No memos matched search
            setHasMore(false);
          } else if (fetchedMemos.length < 10 && !searchQuery) { // Arbitrary small number to guess end
            setHasMore(false);
          } else {
            setHasMore(true);
          }
      } else {
         setHasMore(fetchedMemos.length > 0); // If initial load has items, assume more might exist
      }


    } catch (err) {
      console.error("Failed to fetch memos:", err);
      setError(i18n("Failed to load memos. Please try again."));
      if (!isLoadMore) setMemos([]);
    } finally {
      setIsLoading(false);
    }
  }, [userSources, searchQuery, memos]); // Include memos in dependency for loadMore's duplicate check logic

  // Effect to load/filter memos when search query changes or on initial mount
  useEffect(() => {
    // If initialMemos are provided and there's no search query, use them directly.
    // Otherwise, load fresh.
    if (initialMemos.length > 0 && !searchQuery && !searchParams?.has('q')) { // check searchParams to ensure it's not an empty q
        let filteredInitialMemos = initialMemos;
        if (searchQuery) {
            filteredInitialMemos = initialMemos.filter(memo =>
                memo.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                memo.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        setMemos(filteredInitialMemos.sort((a,b) => b.createdTs - a.createdTs));
        setHasMore(filteredInitialMemos.length > 0); // Basic hasMore logic for initial
    } else {
        loadMemos(false); // false indicates this is not a "load more" action
    }
  }, [searchQuery, userSources, initialMemos, loadMemos, searchParams]); // searchQuery will trigger re-fetch/filter

  const handleLoadMore = () => {
    loadMemos(true); // true indicates this is a "load more" action
  };

  // Determine grid classes based on viewMode
  const listContainerClasses = viewMode === 'grid'
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    : "space-y-6";

  return (
    <div className="w-full">
      <div className={listContainerClasses}>
        {memos.map((memo) => (
          <MemoCard key={memo.id} memo={memo} />
        ))}
      </div>

      {isLoading && memos.length === 0 && (
         <div className="text-center py-10">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500" />
            <p className="text-gray-500 mt-2">{i18n("Loading memos...")}</p>
        </div>
      )}

      {error && <p className="text-red-500 text-center py-4">{error}</p>}

      {hasMore && !isLoading && memos.length > 0 && ( // Only show load more if there are existing memos and not currently loading
        <div className="text-center py-6 mt-6">
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
      {!hasMore && memos.length > 0 && !isLoading && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-6 mt-6">
          {i18n("No more memos to load.")}
        </p>
      )}
       {memos.length === 0 && !isLoading && !error && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-10">
          {searchQuery
            ? i18n("No memos found matching your search.") + ` "${searchQuery}"`
            : i18n("No memos to display yet.")
          }
        </p>
      )}
    </div>
  );
}
