import { Memo } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MemoHeader } from "./MemoHeader";
import { MemoContent } from "./MemoContent";
import { MemoResources } from "./MemoResources";
import { MemoActions } from "./MemoActions";
import { MemoTag } from "@/components/shared/MemoTag";
import { CommentWrapper } from "@/components/features/comments/CommentWrapper";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";


// Placeholder for i18n function
const i18n = (key: string) => key;

interface MemoCardProps {
  memo: Memo;
}

export function MemoCard({ memo }: MemoCardProps) {
  const [showComments, setShowComments] = useState(false);

  const extractTags = (content: string): string[] => {
    const regex = /#([\w\u4e00-\u9fa5]+)/g;
    const matches = content.match(regex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  };

  const tags = extractTags(memo.content);
  const baseResourceUrl = memo.link;

  const canShowComments = memo.visibility === "PUBLIC" && (memo.twikooEnvId || (memo.artalkEnvUrl && memo.artalkSite));
  const commentSystem = memo.twikooEnvId ? 'twikoo' : (memo.artalkEnvUrl && memo.artalkSite ? 'artalk' : 'none');

  const toggleComments = () => {
    if (canShowComments) {
      setShowComments(!showComments);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md hover:shadow-lg transition-shadow duration-200 dark:border-gray-700 flex flex-col">
      <CardHeader className="p-0 relative">
        <MemoHeader memo={memo} />
        <div className="absolute top-4 right-4">
          <MemoActions memo={memo} />
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        <MemoContent content={memo.content} />
        {memo.resourceList && memo.resourceList.length > 0 && (
          <MemoResources resources={memo.resourceList} baseResourceUrl={baseResourceUrl} />
        )}
      </CardContent>

      <CardFooter className="p-4 flex flex-col items-start space-y-3 border-t border-gray-200 dark:border-gray-700">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 w-full">
            {tags.map((tag, index) => (
              <MemoTag key={index} tagName={tag} />
            ))}
          </div>
        )}

        {canShowComments && (
           <Button variant="ghost" size="sm" onClick={toggleComments} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
             <MessageCircle className="mr-2 h-4 w-4" />
             {showComments ? i18n("Hide Comments") : i18n("Show Comments")}
           </Button>
        )}
      </CardFooter>

      {showComments && canShowComments && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <CommentWrapper
            memoId={memo.id} // Ensure memo.id is a string or number as expected by CommentWrapper
            commentSystem={commentSystem}
            twikooEnvId={memo.twikooEnvId}
            // twikooRegion and twikooLang can be added if needed, or use defaults in CommentWrapper
            artalkEnvUrl={memo.artalkEnvUrl}
            artalkSite={memo.artalkSite || memo.creatorName} // Default artalkSite to creatorName if not provided
          />
        </div>
      )}
    </Card>
  );
}
