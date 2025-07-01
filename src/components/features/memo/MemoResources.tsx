import { Resource } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

// Placeholder for i18n function
const i18n = (key: string) => key;

interface MemoResourcesProps {
  resources: Resource[];
}

export function MemoResources({ resources }: MemoResourcesProps) {
  if (!resources || resources.length === 0) {
    return null;
  }

  // Filter for image resources for this example.
  // Other resource types (videos, files) might need different rendering.
  const imageResources = resources.filter(res => res.type.startsWith('image/'));

  if (imageResources.length === 0) {
    // Optionally render placeholders or links for non-image resources here
    return null;
  }

  return (
    <div className="p-4">
      <div className={`grid gap-2 ${imageResources.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
        {imageResources.map((resource) => (
          <div key={resource.id} className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <Link href={resource.externalLink} passHref legacyBehavior>
              <a target="_blank" rel="noopener noreferrer" title={resource.filename}>
                <Image
                  src={resource.externalLink}
                  alt={resource.filename || i18n("Resource Image")}
                  layout="fill"
                  objectFit="cover"
                  className="hover:opacity-90 transition-opacity duration-150"
                  // Add placeholder and blurDataURL for better UX if possible
                  // placeholder="blur"
                  // blurDataURL="data:image/png;base64,..." - generate a small base64 placeholder
                />
              </a>
            </Link>
          </div>
        ))}
      </div>
      {/* Render other resource types here if needed */}
    </div>
  );
}
