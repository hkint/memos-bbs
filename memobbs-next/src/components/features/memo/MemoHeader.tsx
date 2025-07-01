import { Memo } from "@/lib/types";
import { UserAvatar } from "@/components/shared/UserAvatar";
import Link from "next/link";

// Placeholder for i18n function
const i18n = (key: string) => key;

// Placeholder for Timestamp component
const Timestamp = ({ timestamp }: { timestamp: number }) => {
  const date = new Date(timestamp * 1000); // Assuming timestamp is in seconds
  return (
    <time dateTime={date.toISOString()} className="text-sm text-gray-500 dark:text-gray-400">
      {date.toLocaleDateString()} {date.toLocaleTimeString()} {/* Replace with more sophisticated formatting later */}
    </time>
  );
};


interface MemoHeaderProps {
  memo: Memo;
}

export function MemoHeader({ memo }: MemoHeaderProps) {
  return (
    <div className="flex items-center space-x-3 p-4 border-b border-gray-200 dark:border-gray-700">
      <Link href={memo.creatorWebsite || '#'} passHref legacyBehavior>
        <a target="_blank" rel="noopener noreferrer">
          <UserAvatar src={memo.creatorAvatar || `https://gravatar.com/avatar/${memo.creatorId}?d=identicon`} alt={memo.creatorName || i18n("User")} fallbackText={memo.creatorName?.substring(0,2) || "U"} />
        </a>
      </Link>
      <div className="flex flex-col">
        <Link href={memo.creatorWebsite || '#'} passHref legacyBehavior>
          <a target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 dark:text-gray-100 hover:underline">
            {memo.creatorName || i18n("Anonymous")}
          </a>
        </Link>
        <Timestamp timestamp={memo.displayTs} />
      </div>
    </div>
  );
}
