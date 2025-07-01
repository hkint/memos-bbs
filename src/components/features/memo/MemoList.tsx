'use client';

import { useState, useEffect, useCallback } from 'react';
import { Memo, User } from '@/lib/types';
import { fetchPublicMemos } from '@/lib/memos-client';
import { MemoCard } from './MemoCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const i18n = (key: string) => key;

interface MemoListProps {
  initialMemos?: Memo[];
  userSources: User[]; // All available user sources
}

export function MemoList({ initialMemos = [], userSources: allUserSources }: MemoListProps) {
  const [memos, setMemos] = useState<Memo[]>(initialMemos);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Simplified for now
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const [currentUserSources, setCurrentUserSources] = useState<User[]>(allUserSources);

  // Current view parameters from URL
  const view = searchParams?.get('view') || 'home'; // home, bbs, random-user, user (for specific user)
  const userId = searchParams?.get('userId'); // For specific user view
  const searchQuery = searchParams?.get('q') || '';
  const viewModeLayout = searchParams?.get('viewMode') || 'list'; // 'list' or 'grid' for layout

  const loadMemos = useCallback(async (sourcesToFetch: User[]) => {
    if (!sourcesToFetch || sourcesToFetch.length === 0) {
      setError(i18n("No user sources to fetch memos from."));
      setHasMore(false);
      setMemos([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let fetchedMemos = await fetchPublicMemos(sourcesToFetch);

      if (searchQuery) {
        fetchedMemos = fetchedMemos.filter(memo =>
          memo.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          memo.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Sort by displayTs as per memos-client.ts
      // fetchedMemos is already sorted by displayTs by fetchPublicMemos
      setMemos(fetchedMemos);
      setHasMore(fetchedMemos.length > 0); // This is a simplification, assumes all are loaded at once

    } catch (err) {
      console.error("Failed to fetch memos:", err);
      setError(i18n("Failed to load memos. Please try again."));
      setMemos([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]); // Removed memos from dependencies as we are not doing loadMore pagination yet

  useEffect(() => {
    let sourcesToUse = allUserSources;

    if (view === 'home') {
      // For 'home', typically show the first user, or a default/logged-in user.
      // For this public BBS, 'home' can mean the first user in the list or all users (like BBS).
      // Let's make 'home' show the first user if available, otherwise all.
      sourcesToUse = allUserSources.length > 0 ? [allUserSources[0]] : [];
       if (allUserSources.length === 0) {
         console.warn("Home view: No user sources available.");
       }
    } else if (view === 'bbs') {
      sourcesToUse = allUserSources; // Use all users for BBS/Square view
    } else if (view === 'random-user' && allUserSources.length > 0) {
      const randomIndex = Math.floor(Math.random() * allUserSources.length);
      sourcesToUse = [allUserSources[randomIndex]];
    } else if (view === 'user' && userId) {
      const targetUser = allUserSources.find(u => u.creatorId === userId || u.creatorName === userId); // Allow matching by ID or name
      sourcesToUse = targetUser ? [targetUser] : [];
      if (!targetUser) console.warn(`User with ID/Name "${userId}" not found.`);
    } else if (userId) { // If userId is present without a specific view, assume it's for a single user
      const targetUser = allUserSources.find(u => u.creatorId === userId || u.creatorName === userId);
      sourcesToUse = targetUser ? [targetUser] : [];
       if (!targetUser) console.warn(`User with ID/Name "${userId}" not found.`);
    }
    // If sourcesToUse remains unchanged (e.g. allUserSources) and it's the initial load with initialMemos,
    // and no specific view query params are set that would change the source, we can use initialMemos.
    const isDefaultView = !searchParams?.has('view') && !searchParams?.has('userId');

    if (initialMemos.length > 0 && !searchQuery && isDefaultView && sourcesToUse.length > 0 && sourcesToUse[0] === allUserSources[0]) {
        setMemos(initialMemos.sort((a,b) => b.displayTs - a.displayTs));
        setHasMore(initialMemos.length > 0);
        setIsLoading(false);
    } else {
        loadMemos(sourcesToUse);
    }
    setCurrentUserSources(sourcesToUse); // Update current sources for context/debugging

  }, [view, userId, searchQuery, allUserSources, loadMemos, initialMemos, searchParams]);

  // Note: True "Load More" pagination is not implemented here.
  // fetchPublicMemos currently fetches all memos from the sources.
  // For pagination, the API and fetchPublicMemos would need to support limits/offsets.
  const handleLoadMore = () => {
    // Placeholder or implement actual pagination if API supports it
    console.log("Load More clicked - full pagination not implemented yet.");
    // loadMemos(currentUserSources); // This would just refetch everything
    setHasMore(false); // Simulate no more if this button is shown
  };

  const listContainerClasses = viewModeLayout === 'grid'
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    : "space-y-6";

  return (
    <div className="w-full">
      <div className={listContainerClasses}>
        {memos.map((memo) => (
          <MemoCard key={`${memo.id}-${memo.creatorName}`} memo={memo} /> // Ensure key is unique if IDs can overlap across users
        ))}
      </div>

      {isLoading && memos.length === 0 && (
         <div className="text-center py-10">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500" />
            <p className="text-gray-500 mt-2">{i18n("Loading memos...")}</p>
        </div>
      )}

      {error && <p className="text-red-500 text-center py-4">{error}</p>}

      {hasMore && !isLoading && memos.length > 0 && allUserSources.length > 0 && (
        <div className="text-center py-6 mt-6">
          <Button onClick={handleLoadMore} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{i18n("Loading...")}</>
            ) : (
              i18n("Load More (Placeholder)")
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
            ? `${i18n("No memos found matching your search:")} "${searchQuery}"`
            : currentUserSources.length === 0 && allUserSources.length > 0 ? i18n("Selected user not found or has no memos.") : i18n("No memos to display yet.")
          }
        </p>
      )}
       {allUserSources.length === 0 && !isLoading && !error && (
         <p className="text-center text-red-400 py-10">
           {i18n("No user sources are configured. Please check your memos.json.")}
         </p>
       )}
    </div>
  );
}
