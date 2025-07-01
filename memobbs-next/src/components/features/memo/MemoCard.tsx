import { Memo } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MemoHeader } from "./MemoHeader";
import { MemoContent } from "./MemoContent";
import { MemoResources } from "./MemoResources";
import { MemoActions } from "./MemoActions";
import { MemoTag } from "@/components/shared/MemoTag";

// Placeholder for i18n function
const i18n = (key: string) => key;

interface MemoCardProps {
  memo: Memo;
}

export function MemoCard({ memo }: MemoCardProps) {
  // Basic tag parsing, assuming tags are like #tag1 #tag2 in content
  // This could be more sophisticated, e.g., from a dedicated tags field if available
  const extractTags = (content: string): string[] => {
    const regex = /#([\w\u4e00-\u9fa5]+)/g; // Matches alphanumeric and CJK characters for tags
    const matches = content.match(regex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  };

  const tags = extractTags(memo.content);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md hover:shadow-lg transition-shadow duration-200 dark:border-gray-700">
      <CardHeader className="p-0 relative">
        <MemoHeader memo={memo} />
        <div className="absolute top-4 right-4">
          <MemoActions memo={memo} />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <MemoContent content={memo.content} />
        {memo.resourceList && memo.resourceList.length > 0 && (
          <MemoResources resources={memo.resourceList} />
        )}
      </CardContent>
      {tags.length > 0 && (
        <CardFooter className="p-4 flex flex-wrap gap-2 border-t border-gray-200 dark:border-gray-700">
          {tags.map((tag, index) => (
            <MemoTag key={index} tagName={tag} />
          ))}
        </CardFooter>
      )}
    </Card>
  );
}
