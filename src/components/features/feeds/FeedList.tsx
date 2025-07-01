'use client';

import { useState, useEffect, useCallback } from 'react';
import { FeedItem, FeedSource } from '@/lib/types'; // Will define FeedSource later
import { FeedCard } from './FeedCard';
import { Button } from '@/components/ui/button';
import { Loader2, Rss } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Placeholder for i18n
const i18n = (key: string) => key;

// Predefined feed sources similar to the old project
const PREDEFINED_FEED_SOURCES: FeedSource[] = [
  {
    id: 'cf-friends',
    name: 'CF Friends',
    url: 'https://cf.edui.fun/all?rule=created&end=20', // Old project's default
    type: 'json-custom-cf' // Special type for this JSON structure
  },
  {
    id: 'blogfinder',
    name: 'BlogFinder',
    url: 'https://bf.zzxworld.com/feed.xml',
    type: 'xml'
  },
  {
    id: 'boyouquan',
    name: '博友圈',
    url: 'https://www.boyouquan.com/feed.xml',
    type: 'xml'
  },
  {
    id: 'shinianzhiyue',
    name: '十年之约',
    url: 'https://www.foreverblog.cn/api/v1/blog/feeds?page=1', // This is JSON
    type: 'json-shinian' // Special type for this JSON structure
  },
];


interface FeedListProps {
  initialFeedSourceId?: string;
}

export function FeedList({ initialFeedSourceId = PREDEFINED_FEED_SOURCES[0].id }: FeedListProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<string>(initialFeedSourceId);

  const fetchAndParseFeed = useCallback(async (source: FeedSource) => {
    setIsLoading(true);
    setError(null);
    setFeedItems([]); // Clear previous items

    try {
      // For client-side fetching, a proxy might be needed for CORS.
      // Using a simple proxy for XML feeds. JSON feeds might work directly if CORS allows.
      const proxyUrl = '/api/feed-proxy?url=';
      const fetchUrl = source.type === 'xml' ? `${proxyUrl}${encodeURIComponent(source.url)}` : source.url;

      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`${i18n("Failed to fetch feed:")} ${response.statusText}`);
      }

      let items: FeedItem[] = [];
      if (source.type === 'xml') {
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "application/xml");

        // Basic RSS/Atom parsing (can be greatly improved with a library)
        const entries = Array.from(xmlDoc.querySelectorAll('item, entry'));
        items = entries.map(entry => ({
          id: entry.querySelector('guid, id')?.textContent || entry.querySelector('link')?.textContent || Date.now().toString() + Math.random(),
          title: entry.querySelector('title')?.textContent || '',
          link: entry.querySelector('link')?.getAttribute('href') || entry.querySelector('link')?.textContent || '',
          publishedDate: entry.querySelector('pubDate, published, updated')?.textContent || new Date().toISOString(),
          summary: entry.querySelector('description, summary, content')?.textContent?.replace(/<[^>]*>?/gm, '').substring(0, 200) || '',
          authorName: entry.querySelector('dc\\:creator, author > name')?.textContent || undefined,
          siteTitle: xmlDoc.querySelector('channel > title, feed > title')?.textContent || source.name,
          faviconUrl: `https://favicon.memobbs.app?url=${new URL(entry.querySelector('link')?.getAttribute('href') || entry.querySelector('link')?.textContent || source.url).hostname}`
        })).slice(0, 20); // Limit to 20 items
      } else if (source.type === 'json-custom-cf') {
        const jsonData = await response.json();
        items = (jsonData.article_data || []).map((item: any) => ({
          id: item.link || Date.now().toString() + Math.random(),
          title: item.title,
          link: item.link,
          publishedDate: item.updated || new Date(item.created).toISOString(), // Assuming 'updated' or 'created'
          authorName: item.creator || item.author, // If available
          authorAvatarUrl: item.avatar,
          siteTitle: item.floor, // Using 'floor' as site/source title from this specific API
        })).slice(0, 20);
      } else if (source.type === 'json-shinian') {
        const jsonData = await response.json();
        items = (jsonData.data?.data || []).map((item: any) => ({
          id: item.link || Date.now().toString() + Math.random(),
          title: item.title,
          link: item.link,
          publishedDate: item.created_at,
          authorName: item.nickname || item.author_name,
          authorAvatarUrl: `https://gravatar.com/avatar/${item.email_md5 || item.email}?d=identicon`, // Assuming email_md5 or email for gravatar
          siteTitle: item.blog_name || source.name,
        })).slice(0, 20);
      }
      setFeedItems(items);
    } catch (err: any) {
      console.error(`Error fetching feed from ${source.url}:`, err);
      setError(err.message || i18n("Could not load feed items."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentSource = PREDEFINED_FEED_SOURCES.find(s => s.id === selectedSourceId);
    if (currentSource) {
      fetchAndParseFeed(currentSource);
    }
  }, [selectedSourceId, fetchAndParseFeed]);

  const handleSourceChange = (newSourceId: string) => {
    setSelectedSourceId(newSourceId);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b dark:border-gray-700">
        <div className="flex items-center text-lg font-semibold">
            <Rss className="mr-2 h-5 w-5 text-orange-500" />
            {i18n("Blog Feeds")}
        </div>
        <Select value={selectedSourceId} onValueChange={handleSourceChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={i18n("Select feed source")} />
          </SelectTrigger>
          <SelectContent>
            {PREDEFINED_FEED_SOURCES.map(source => (
              <SelectItem key={source.id} value={source.id}>
                {i18n(source.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="text-center py-10">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500" />
          <p className="text-gray-500 mt-2">{i18n("Loading feed...")}</p>
        </div>
      )}
      {error && <p className="text-red-500 text-center py-4">{error}</p>}

      {!isLoading && !error && feedItems.length === 0 && (
         <p className="text-center text-gray-500 dark:text-gray-400 py-10">
           {i18n("No items in this feed or unable to load.")}
         </p>
      )}

      {!isLoading && feedItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {feedItems.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
