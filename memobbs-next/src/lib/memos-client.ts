import { User, Memo } from './types';

export async function fetchPublicMemos(users: User[]): Promise<Memo[]> {
  if (!users || users.length === 0) {
    return [];
  }

  const fetchPromises = users.map(user => {
    const apiUrl = `${user.link.replace(/\/$/, '')}/api/v1/memo/all`;
    return fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch memos for ${user.creatorName} from ${apiUrl}. Status: ${response.status}`);
        }
        return response.json() as Promise<Memo[]>;
      })
      .then(memos => ({ status: 'fulfilled' as const, value: memos, user }))
      .catch(error => ({ status: 'rejected' as const, reason: error, user }));
  });

  const results = await Promise.allSettled(fetchPromises);

  const allMemos: Memo[] = [];
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value.status === 'fulfilled') {
      // Add user information to each memo
      const userMemos = result.value.value.map(memo => ({
        ...memo,
        creatorAvatar: result.value.user.avatar, // Add avatar from User object
        creatorWebsite: result.value.user.website // Add website from User object
      }));
      allMemos.push(...userMemos);
    } else if (result.status === 'rejected') {
      console.error(`Error fetching memos for user (from outer promise): ${result.reason?.user?.creatorName}:`, result.reason);
    } else if (result.status === 'fulfilled' && result.value.status === 'rejected') {
      console.error(`Error fetching memos for user ${result.value.user.creatorName}:`, result.value.reason);
    }
  });

  // Sort memos by creation timestamp in descending order (newest first)
  allMemos.sort((a, b) => b.createdTs - a.createdTs);

  return allMemos;
}
