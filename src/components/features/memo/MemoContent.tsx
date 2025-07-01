import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Placeholder for i18n function - not typically used directly in markdown content itself
// const i18n = (key: string) => key;

interface MemoContentProps {
  content: string;
}

export function MemoContent({ content }: MemoContentProps) {
  return (
    <div className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none p-4">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
