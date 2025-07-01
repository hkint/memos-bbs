'use client';

import { Memo, User } from '@/lib/types';
import { MemoList } from './MemoList'; // Assuming MemoList is in the same directory or adjust path

// Placeholder for i18n function
const i18n = (key: string) => key;

interface MemoListContainerProps {
  initialMemos: Memo[];
  userSources: User[]; // Pass the user sources for "load more" functionality
}

export function MemoListContainer({ initialMemos, userSources }: MemoListContainerProps) {
  // Here you could add more client-side logic if needed,
  // for example, fetching userSources from a global state or context if not passed directly.

  if (!userSources || userSources.length === 0) {
    // This check could also be in MemoList, but good to have it early.
    return <p className="text-center text-red-500 py-4">{i18n("User sources not available for fetching memos.")}</p>;
  }

  return <MemoList initialMemos={initialMemos} userSources={userSources} />;
}
