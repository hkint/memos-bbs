'use client';

import { useEffect, useRef } from 'react';

// Placeholder for i18n function
const i18n = (key: string) => key;

declare global {
  interface Window {
    Twikoo: any; // Adjust if Twikoo has specific types
    Artalk: any;  // Adjust if Artalk has specific types
  }
}
interface CommentWrapperProps {
  memoId: string | number; // Unique identifier for the memo/page
  siteName?: string; // For Artalk site distinction

  // Twikoo specific props
  twikooEnvId?: string;
  twikooRegion?: string;
  twikooLang?: string;

  // Artalk specific props
  artalkEnvUrl?: string; // Server URL for Artalk
  artalkSite?: string;   // Site name for Artalk

  // Potentially other comment systems
  commentSystem?: 'twikoo' | 'artalk' | 'none';
}

export function CommentWrapper({
  memoId,
  siteName = 'MemoBBS',
  twikooEnvId,
  twikooRegion,
  twikooLang = 'zh-CN',
  artalkEnvUrl,
  artalkSite,
  commentSystem = 'none', // Default to no comments if not specified
}: CommentWrapperProps) {
  const commentContainerRef = useRef<HTMLDivElement>(null);
  const isLoadedRef = useRef(false); // To prevent multiple initializations

  useEffect(() => {
    if (isLoadedRef.current || !commentContainerRef.current) return;

    const pageKey = `/m/${memoId}`; // Unique path for the memo
    const pageTitle = `${i18n("Memo")} ${memoId}`;

    const loadScript = (src: string, onLoadCallback: () => void) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = onLoadCallback;
      script.onerror = () => console.error(`${i18n("Failed to load script:")} ${src}`);
      document.body.appendChild(script);
    };

    const loadCSS = (href: string) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    if (commentSystem === 'twikoo' && twikooEnvId) {
      if (window.Twikoo) {
        window.Twikoo.init({
          envId: twikooEnvId,
          el: `#twikoo-comment-container-${memoId}`,
          region: twikooRegion,
          path: pageKey,
          lang: twikooLang,
        });
        isLoadedRef.current = true;
      } else {
        loadScript('https://cdn.staticfile.org/twikoo/1.6.22/twikoo.all.min.js', () => {
          if (window.Twikoo) {
            window.Twikoo.init({
              envId: twikooEnvId,
              el: `#twikoo-comment-container-${memoId}`,
              region: twikooRegion,
              path: pageKey,
              lang: twikooLang,
            });
            isLoadedRef.current = true;
          }
        });
      }
    } else if (commentSystem === 'artalk' && artalkEnvUrl && artalkSite) {
        loadCSS('https://cdn.staticfile.org/artalk/2.5.5/Artalk.css'); // Or your preferred CDN / self-hosted
      if (window.Artalk) {
        new window.Artalk({
          el: `#artalk-comment-container-${memoId}`,
          pageKey: pageKey,
          pageTitle: pageTitle,
          server: artalkEnvUrl,
          site: artalkSite, // Your Artalk site name
          // ... other Artalk options
        });
        isLoadedRef.current = true;
      } else {
        loadScript('https://cdn.staticfile.org/artalk/2.5.5/Artalk.js', () => { // Or your preferred CDN / self-hosted
          if (window.Artalk) {
            new window.Artalk({
              el: `#artalk-comment-container-${memoId}`,
              pageKey: pageKey,
              pageTitle: pageTitle,
              server: artalkEnvUrl,
              site: artalkSite,
              // ... other Artalk options
            });
            isLoadedRef.current = true;
          }
        });
      }
    }

    // Cleanup function to remove scripts/styles if component unmounts,
    // though for comment systems, this might not be necessary or could be complex.
    // return () => { /* ... */ };
  }, [memoId, twikooEnvId, twikooRegion, twikooLang, artalkEnvUrl, artalkSite, commentSystem]);

  if (commentSystem === 'none') {
    return null;
  }

  return (
    <div className="mt-6 p-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-3">{i18n("Comments")}</h3>
      {commentSystem === 'twikoo' && <div id={`twikoo-comment-container-${memoId}`} ref={commentContainerRef}></div>}
      {commentSystem === 'artalk' && <div id={`artalk-comment-container-${memoId}`} ref={commentContainerRef}></div>}
    </div>
  );
}
