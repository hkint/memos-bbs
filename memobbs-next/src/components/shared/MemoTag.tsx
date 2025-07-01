// Placeholder for i18n function
const i18n = (key: string) => key;

interface MemoTagProps {
  tagName: string;
  // Potentially add a link prop if tags are clickable
  // href?: string;
}

export function MemoTag({ tagName }: MemoTagProps) {
  return (
    <span className="inline-block bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-150">
      #{i18n(tagName)}
    </span>
  );
}
