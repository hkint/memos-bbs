import { fetchPublicMemos } from '@/lib/memos-client';
import { MemoListContainer } from '@/components/features/memo/MemoListContainer';
import { User, UserList, Memo } from '@/lib/types'; // Added Memo here
import fs from 'fs/promises';
import path from 'path';

// Placeholder for i18n function (not typically used directly in Server Components for static text like this)
const i18n = (key: string) => key;

async function getInitialMemosAndUsers(): Promise<{ initialMemos: Memo[]; users: User[] }> {
  let users: User[] = [];
  try {
    // Construct the path to memos.json relative to the project root
    // In Next.js, process.cwd() usually points to the project root
    const filePath = path.join(process.cwd(), 'memos.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const userListData: UserList = JSON.parse(fileContent);
    users = userListData.myMemoList || [];
  } catch (error) {
    console.error("Failed to read or parse memos.json:", error);
    // Return empty users array or handle error as appropriate
    // For now, if memos.json fails, we can't fetch any memos.
    return { initialMemos: [], users: [] };
  }

  if (users.length === 0) {
    console.warn("No users found in memos.json. No initial memos will be fetched.");
    return { initialMemos: [], users: [] };
  }

  try {
    const initialMemos = await fetchPublicMemos(users);
    return { initialMemos, users };
  } catch (error) {
    console.error("Failed to fetch initial public memos:", error);
    return { initialMemos: [], users }; // Fallback to empty memos on error
  }
}

export default async function HomePage() {
  // Set a default for revalidation, e.g. every hour.
  // This can be fine-tuned or moved to page config.
  // Not using `export const revalidate = 3600;` directly in this function body.
  // It should be a top-level export if used. For now, fetching on each request or default caching.

  const { initialMemos, users } = await getInitialMemosAndUsers();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 sr-only">{i18n("Public Memos")}</h1>
      {users.length > 0 ? (
        <MemoListContainer initialMemos={initialMemos} userSources={users} />
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600 dark:text-gray-400">{i18n("Could not load user sources.")}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">{i18n("Please check the server logs and ensure memos.json is correctly configured at the project root.")}</p>
        </div>
      )}
    </main>
  );
}
