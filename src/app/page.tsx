import { fetchPublicMemos } from '@/lib/memos-client';
import { MemoListContainer } from '@/components/features/memo/MemoListContainer';
import { FeedContainer } from '@/components/features/feeds/FeedContainer'; // Added
import { User, UserList, Memo } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

const i18n = (key: string) => key;

interface HomePageProps {
  searchParams?: {
    section?: string;
    // other params like 'view', 'userId', 'q', 'layoutMode' are handled client-side by MemoList or Header
  };
}

async function getInitialMemosAndUsers(): Promise<{ initialMemos: Memo[]; users: User[] }> {
  let users: User[] = [];
  const defaultUsers: User[] = [
    { creatorName: "林木木", website: "https://immmmm.com", link: "https://m.immmmm.com/", creatorId: "101", avatar: "https://immmmm.com/avatar.png", apiType: "v1" },
    { creatorName: "koobai", website: "https://koobai.com", link: "https://memos.koobai.com/", creatorId: "1", avatar: "https://koobai.com/media/avatar.png", apiType: "v1" },
    { creatorName: "DIYgod", website: "https://diygod.me", link: "https://status.diygod.me/", creatorId: "1", avatar: "https://diygod.me/images/avatar.jpg", apiType: "v1" }
  ];

  try {
    const filePath = path.join(process.cwd(), 'memos.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const userListData: UserList = JSON.parse(fileContent);
    users = userListData.myMemoList && userListData.myMemoList.length > 0 ? userListData.myMemoList : defaultUsers;
  } catch (error) {
    console.warn("Failed to read or parse memos.json, using default users.", error instanceof Error ? error.message : String(error));
    users = defaultUsers;
  }

  if (users.length === 0) {
    console.warn("No users configured. No initial memos will be fetched.");
    return { initialMemos: [], users: [] };
  }

  try {
    const initialUserSource = users.length > 0 ? [users[0]] : [];
    const initialMemos = await fetchPublicMemos(initialUserSource);
    return { initialMemos, users };
  } catch (error) {
    console.error("Failed to fetch initial public memos:", error instanceof Error ? error.message : String(error));
    return { initialMemos: [], users };
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // export const revalidate = 3600;

  const section = searchParams?.section;

  if (section === 'feeds') {
    return (
      <>
        <h1 className="text-3xl font-bold text-center mb-8 sr-only">{i18n("Blog Feeds")}</h1>
        <FeedContainer />
      </>
    );
  }

  // Default to Memos view
  const { initialMemos, users } = await getInitialMemosAndUsers();

  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-8 sr-only">{i18n("Public Memos")}</h1>
      {users.length > 0 ? (
        <MemoListContainer initialMemos={initialMemos} userSources={users} />
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600 dark:text-gray-400">{i18n("Could not load user sources.")}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">{i18n("Please check server logs and ensure memos.json is correctly configured or defaults are available.")}</p>
        </div>
      )}
    </>
  );
}
