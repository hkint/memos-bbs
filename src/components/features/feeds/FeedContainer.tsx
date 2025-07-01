'use client';

import { FeedList } from './FeedList';

// Placeholder for i18n
const i18n = (key: string) => key;

export function FeedContainer() {
  // This container can be enhanced with more complex logic,
  // like allowing users to add custom feed URLs, etc. in the future.
  // For now, it just wraps FeedList.
  return (
    <section aria-labelledby="feed-section-title" className="py-8">
      {/*
        It might be good to have a title here, but FeedList also adds one.
        If FeedList's title/select is sufficient, this h2 can be sr-only or removed.
      */}
      <h2 id="feed-section-title" className="sr-only">{i18n("Blog Feeds")}</h2>
      <FeedList />
    </section>
  );
}
