'use client'; // For DropdownMenu interactions

import { Memo } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit3, Trash2, Archive, Link as LinkIcon } from "lucide-react";

// Placeholder for i18n function
const i18n = (key: string) => key;

interface MemoActionsProps {
  memo: Memo;
  // Add handlers for actions e.g.
  // onEdit?: (memoId: number) => void;
  // onDelete?: (memoId: number) => void;
  // onArchive?: (memoId: number) => void;
}

export function MemoActions({ memo /*, onEdit, onDelete, onArchive */ }: MemoActionsProps) {
  const handleEdit = () => {
    // onEdit?.(memo.id);
    alert(i18n("Edit action for memo ID:") + " " + memo.id); // Placeholder
  };

  const handleDelete = () => {
    // onDelete?.(memo.id);
    if (confirm(i18n("Are you sure you want to delete this memo?"))) {
      alert(i18n("Delete action for memo ID:") + " " + memo.id); // Placeholder
    }
  };

  const handleArchive = () => {
    // onArchive?.(memo.id);
    alert(i18n("Archive action for memo ID:") + " " + memo.id); // Placeholder
  };

  const handleCopyLink = () => {
    // This would ideally use the app's domain + memo path
    const memoLink = `${window.location.origin}/m/${memo.id}`;
    navigator.clipboard.writeText(memoLink)
      .then(() => alert(i18n("Link copied to clipboard!")))
      .catch(err => console.error(i18n("Failed to copy link: "), err));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <MoreHorizontal className="h-5 w-5" />
          <span className="sr-only">{i18n("Memo actions")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{i18n("Actions")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
          <Edit3 className="mr-2 h-4 w-4" />
          <span>{i18n("Edit")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleArchive} className="cursor-pointer">
          <Archive className="mr-2 h-4 w-4" />
          <span>{i18n("Archive")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          <LinkIcon className="mr-2 h-4 w-4" />
          <span>{i18n("Copy Link")}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-500 hover:!text-red-700 dark:hover:!text-red-400 cursor-pointer">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>{i18n("Delete")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
