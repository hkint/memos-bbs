'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

// Placeholder for i18n
const i18n = (key: string) => key;

interface NeoDBData {
  title: string;
  brief?: string;
  cover_image_url?: string;
  rating?: string | number;
  url: string; // Original URL for linking
  category?: string; // e.g., "game", "movie", "book"
  // Add more fields as needed based on API response
}

interface NeoDBEmbedProps {
  url: string;
}

// Simple cache for NeoDB data
const neoDBCache = new Map<string, NeoDBData>();

export function NeoDBEmbed({ url }: NeoDBEmbedProps) {
  const [data, setData] = useState<NeoDBData | null>(neoDBCache.get(url) || null);
  const [isLoading, setIsLoading] = useState<boolean>(!neoDBCache.has(url));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (neoDBCache.has(url)) {
      setData(neoDBCache.get(url)!);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Construct the API URL. Using a proxy might be necessary for CORS.
        // Option 1: Direct API (might have CORS issues)
        // const apiUrl = url.replace("neodb.social/", "neodb.social/api/");
        // Option 2: Using a proxy like the old project (if available and reliable)
        const proxyApiUrl = `https://api.immmmm.com/neodb?url=${encodeURIComponent(url)}`;
        // const proxyApiUrl = `https://api-neodb.immmmm.com/?url=${encodeURIComponent(url)}`; // old one

        const response = await fetch(proxyApiUrl);
        if (!response.ok) {
          throw new Error(`${i18n("Failed to fetch NeoDB data:")} ${response.statusText}`);
        }
        const fetchedData: NeoDBData = await response.json();

        // Ensure essential data like title is present
        if (!fetchedData.title) {
            throw new Error(i18n("Fetched NeoDB data is incomplete."));
        }

        const enrichedData = { ...fetchedData, url: url }; // Add original URL back for linking
        neoDBCache.set(url, enrichedData);
        setData(enrichedData);
      } catch (err: any) {
        console.error("Error fetching NeoDB data for URL:", url, err);
        setError(err.message || i18n("Could not load NeoDB entry."));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url]);

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg my-2 text-sm animate-pulse bg-gray-50 dark:bg-gray-800">
        {i18n("Loading NeoDB entry...")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900 rounded-lg my-2 text-sm text-red-700 dark:text-red-200">
        {i18n("Error:")} {error} <br />
        <Link href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          {i18n("Try accessing directly")}
        </Link>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Helper to render rating stars (simplified)
  const renderRating = (ratingStr: string | number | undefined) => {
    if (ratingStr === undefined) return null;
    const rating = parseFloat(typeof ratingStr === 'string' ? ratingStr : ratingStr.toString());
    if (isNaN(rating) || rating < 0 || rating > 5) return null; // Assuming 0-5 scale, NeoDB uses 0-10, so adjust if needed. Let's assume 0-5 for now.
    // NeoDB seems to use 0-10. The old code css used rating*10% for width.
    // So a rating of '8.5' would be 85%.
    const percentage = (rating / 10) * 100;


    return (
      <div className="rating text-xs text-gray-600 dark:text-gray-400">
        <span className="allstardark relative inline-block h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded-sm overflow-hidden">
          <span
            className="allstarlight absolute top-0 left-0 h-full bg-yellow-400 dark:bg-yellow-500"
            style={{ width: `${percentage}%` }}
          ></span>
        </span>
        <span className="rating_nums ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };


  return (
    <Card className="neodb-card my-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-150">
      <div className="db-card-subject flex flex-col sm:flex-row">
        {data.cover_image_url && (
          <div className="db-card-post sm:w-1/4 flex-shrink-0 relative min-h-[150px] sm:min-h-0">
            {/* Using next/image if domains are configured, else regular img */}
            {/* For external URLs, ensure domain is in next.config.js images.domains */}
            <Image
              src={data.cover_image_url.replace("neodb.social/m", "neodb.prvcy.page/m/")} // Using a privacy proxy for images
              alt={data.title}
              width={120}
              height={180}
              className="object-cover w-full h-full"
              // layout="responsive" // if you want it to scale within the container width
            />
          </div>
        )}
        <div className="db-card-content p-3 flex-grow">
          <CardHeader className="p-0 mb-1">
            <h4 className="db-card-title text-base font-semibold leading-tight">
              <Link href={data.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
                {data.title}
                <ExternalLink size={14} className="ml-1 opacity-70" />
              </Link>
            </h4>
          </CardHeader>
          <CardContent className="p-0 text-xs">
            {data.rating !== undefined && renderRating(data.rating)}
            {data.brief && (
              <p className="db-card-abstract text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">
                {data.brief}
              </p>
            )}
          </CardContent>
        </div>
        {data.category && (
            <div className="db-card-cate text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 sm:self-start sm:rounded-bl-md sm:rounded-tr-none rounded-b-md sm:rounded-b-none">
                {i18n(data.category.charAt(0).toUpperCase() + data.category.slice(1))}
            </div>
        )}
      </div>
    </Card>
  );
}

[end of src/components/features/memo/NeoDBEmbed.tsx]
