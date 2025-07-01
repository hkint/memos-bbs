'use client';

import { FeedItem } from '@/lib/types'; // Will define this type next
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { UserAvatar } from '@/components/shared/UserAvatar'; // Assuming a generic avatar component

// Placeholder for i18n
const i18n = (key: string) => key;

// Placeholder for relative time formatting
const formatRelativeTime = (dateString: string | Date): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString(); // Fallback to simple date
  } catch (e) {
    return String(dateString); // Fallback if date is invalid
  }
};


interface FeedCardProps {
  item: FeedItem;
}

export function FeedCard({ item }: FeedCardProps) {
  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-150 dark:border-gray-700">
      <CardHeader className="p-4">
        <div className="flex items-center space-x-3">
          {item.authorAvatarUrl && (
             <UserAvatar src={item.authorAvatarUrl} alt={item.authorName || 'Feed Author'} fallbackText={item.authorName?.substring(0,1) || 'A'} size="sm" />
          )}
           {!item.authorAvatarUrl && item.faviconUrl && (
             <UserAvatar src={item.faviconUrl} alt={item.siteTitle || 'Site Favicon'} fallbackText={item.siteTitle?.substring(0,1) || 'S'} size="sm" />
           )}
          <div className="flex flex-col">
            {item.authorName && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.authorName}</span>}
            {item.siteTitle && !item.authorName && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.siteTitle}</span>}
            {item.publishedDate && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatRelativeTime(item.publishedDate)}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <h3 className="text-lg font-semibold mb-1 leading-tight">
          <Link href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {item.title || i18n("Untitled Post")}
          </Link>
        </h3>
        {item.summary && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {item.summary}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 flex justify-end">
        <Link href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center">
          {i18n("Read more")} <ExternalLink size={12} className="ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
