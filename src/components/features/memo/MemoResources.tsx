import { Resource } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { FileText, Video } from "lucide-react";

// Placeholder for i18n function
const i18n = (key: string) => key;

interface MemoResourcesProps {
  resources: Resource[];
  // Base URL for resolving internal resource links if `externalLink` is not present
  // e.g., memo.link from the parent memo object
  baseResourceUrl?: string;
}

export function MemoResources({ resources, baseResourceUrl }: MemoResourcesProps) {
  if (!resources || resources.length === 0) {
    return null;
  }

  const getResourceUrl = (resource: Resource) => {
    if (resource.externalLink) {
      return resource.externalLink;
    }
    // Construct internal link if baseResourceUrl and resource.id (or name) are available
    // Example: `${baseResourceUrl?.replace(/\/$/, '')}/o/r/${resource.id}`
    // This depends on how Memos API structures internal resource URLs
    // For now, let's assume externalLink is prioritized or internal structure is known
    // The old code used: `${link}o/r/${fileId}` where fileId could be resource.id or resource.name
    // Let's assume resource.id is the primary identifier for internal links if externalLink is missing
    if (baseResourceUrl && resource.id) {
         // Ensure baseResourceUrl ends with a slash if it's meant to be a directory
         const normalizedBaseUrl = baseResourceUrl.endsWith('/') ? baseResourceUrl : `${baseResourceUrl}/`;
         // The old code used /o/r/RESOURCE_ID or /o/r/FILENAME?thumbnail=1
         // Using resource.id for now, and assuming it's the direct link to the resource
         return `${normalizedBaseUrl}o/r/${resource.id}`;
    }
    return '#'; // Fallback URL
  };


  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {resources.map((resource) => {
          const resourceUrl = getResourceUrl(resource);
          const resourceTitle = resource.filename || i18n("View Resource");

          if (resource.type.startsWith('image/')) {
            return (
              <div key={resource.id} className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 group">
                <Link href={resourceUrl} passHref legacyBehavior>
                  <a target="_blank" rel="noopener noreferrer" title={resourceTitle}>
                    <Image
                      src={resourceUrl} // Use the resolved resourceUrl
                      alt={resource.filename || i18n("Resource Image")}
                      layout="fill"
                      objectFit="cover"
                      className="group-hover:opacity-90 transition-opacity duration-150"
                      // Consider adding placeholder="blur" and blurDataURL if you have small placeholders
                    />
                  </a>
                </Link>
              </div>
            );
          } else if (resource.type.startsWith('video/')) {
            return (
              <div key={resource.id} className="aspect-video overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-black">
                <video
                  src={resourceUrl}
                  controls
                  className="w-full h-full object-contain"
                  title={resource.filename}
                >
                  {i18n("Your browser does not support the video tag.")}
                </video>
              </div>
            );
          } else {
            // Generic file type
            return (
              <div key={resource.id} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                <Link href={resourceUrl} passHref legacyBehavior>
                  <a target="_blank" rel="noopener noreferrer" title={resourceTitle} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    {resource.type.startsWith('audio/') ?
                        <Video className="w-5 h-5 text-blue-500 flex-shrink-0" /> // Using Video icon for audio too for simplicity
                        : <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    }
                    <span className="truncate">{resource.filename || i18n("Download File")}</span>
                  </a>
                </Link>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {resource.type} ({resource.size ? `${(resource.size / 1024).toFixed(1)} KB` : i18n("Unknown size")})
                </p>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
