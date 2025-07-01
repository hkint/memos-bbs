import { User, Memo } from './types';

export async function fetchPublicMemos(users: User[]): Promise<Memo[]> {
  if (!users || users.length === 0) {
    return [];
  }

  const fetchPromises = users.map(user => {
    let apiUrl = '';
    if (user.apiType === 'v1' && user.creatorId) {
      // For Memos v1, creatorId is the numeric part. API expects `users/{creatorId}`.
      const filter = `creator=='users/${user.creatorId}' && visibilities==['PUBLIC']`;
      apiUrl = `${user.link.replace(/\/$/, '')}/api/v1/memos?filter=${encodeURIComponent(filter)}`;
    } else {
      // Fallback or default to 'all' type API (older Memos versions)
      // These older versions often don't need creatorId for /memo/all if it's a public instance dump
      // or might use it as a query param if fetching for a specific user publicly.
      // For this aggregator, we assume `user.link` points to an API that gives all public memos for that source.
      apiUrl = `${user.link.replace(/\/$/, '')}/api/v1/memo/all`;
    }

    return fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch memos for ${user.creatorName} from ${apiUrl}. Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        let processedMemos: Partial<Memo>[] = []; // Use Partial<Memo> for intermediate processing
        if (user.apiType === 'v1') {
          processedMemos = (data.memos || []).map((m: any) => ({
            ...m, // Spread original fields first
            id: parseInt(m.name.split('/').pop(), 10), // Memos v1 'name' is like "memos/101"
            createdTs: Math.floor(new Date(m.createTime).getTime() / 1000),
            displayTs: Math.floor(new Date(m.displayTime || m.createTime).getTime() / 1000),
            // visibility, content, rowStatus, pinned, resourceList should map okay or be defaulted later
          }));
        } else {
          // Assumes data is directly an array of Memo-like objects from older API
          // These usually have numeric id, createdTs, displayTs
          processedMemos = data.map((m:any) => ({ ...m }));
        }
        return { status: 'fulfilled' as const, value: processedMemos, user };
      })
      .catch(error => ({ status: 'rejected' as const, reason: error, user }));
  });

  const results = await Promise.allSettled(fetchPromises);

  const allMemos: Memo[] = [];
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value.status === 'fulfilled') {
      const userMemos = result.value.value.map(apiMemo => {
        // Ensure all fields of Memo are present and correctly typed
        const memoWithDefaults: Memo = {
          id: Number(apiMemo.id || 0),
          rowStatus: apiMemo.rowStatus || "NORMAL",
          creatorId: String(result.value.user.creatorId), // Ensure creatorId is from User and string
          createdTs: Number(apiMemo.createdTs || Math.floor(Date.now() / 1000)),
          updatedTs: Number(apiMemo.updatedTs || apiMemo.createdTs || Math.floor(Date.now() / 1000)),
          displayTs: Number(apiMemo.displayTs || apiMemo.createdTs || Math.floor(Date.now() / 1000)),
          content: String(apiMemo.content || ""),
          visibility: apiMemo.visibility || "PUBLIC",
          pinned: Boolean(apiMemo.pinned || false),
          creatorName: String(result.value.user.creatorName),
          resourceList: apiMemo.resourceList || [],
          relationList: apiMemo.relationList || [],

          // User-specific fields merged in
          creatorAvatar: result.value.user.avatar,
          creatorWebsite: result.value.user.website,
          link: result.value.user.link,
          twikooEnvId: result.value.user.twikoo, // Map from User.twikoo
          artalkEnvUrl: result.value.user.artalk, // Map from User.artalk
          artalkSite: result.value.user.artSite,   // Map from User.artSite
        };
        return memoWithDefaults;
      });
      allMemos.push(...userMemos);
    } else if (result.status === 'rejected') {
      console.error(`Error fetching memos for user (from outer promise): ${result.reason?.user?.creatorName}:`, result.reason);
    } else if (result.status === 'fulfilled' && result.value.status === 'rejected') {
      console.error(`Error fetching memos for user ${result.value.user.creatorName}:`, result.value.reason);
    }
  });

  allMemos.sort((a, b) => b.displayTs - a.displayTs);

  return allMemos;
}
