'use client';

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
import { MoreHorizontal, Edit3, Trash2, Archive, Link as LinkIcon, Star, MessageSquareQuote } from "lucide-react";

const i18n = (key: string) => key;

interface MemoActionsProps {
  memo: Memo;
  // Future: Pass actual API interaction handlers
  // onEdit?: (memo: Memo) => void;
  // onDelete?: (memoId: number) => void;
  // onArchive?: (memoId: number) => void;
  // onFavorite?: (memo: Memo) => void;
}

export function MemoActions({ memo }: MemoActionsProps) {

  const handleEdit = () => {
    // onEdit?.(memo);
    alert(`${i18n("Edit action for memo ID:")} ${memo.id}\n${i18n("Content:")} ${memo.content.substring(0, 50)}...`);
  };

  const handleDelete = () => {
    // onDelete?.(memo.id);
    if (confirm(i18n("Are you sure you want to delete this memo?"))) {
      alert(`${i18n("Delete action for memo ID:")} ${memo.id}`);
    }
  };

  const handleArchive = () => {
    // onArchive?.(memo.id);
    alert(`${i18n("Archive action for memo ID:")} ${memo.id}`);
  };

  const handleCopyLink = () => {
    // Construct a user-friendly link if possible, or use the memo's direct link from source
    // Assuming memo.link is the base URL of the memos instance, and memo.id is the memo's unique ID.
    // The old project used `${link}m/${memo.id}`.
    const memoPageLink = `${memo.link?.replace(/\/$/, '')}/m/${memo.id}`;
    navigator.clipboard.writeText(memoPageLink)
      .then(() => alert(i18n("Link copied to clipboard!")))
      .catch(err => console.error(i18n("Failed to copy link: "), err));
  };

  const handleFavorite = () => {
    // onFavorite?.(memo);
    // This would typically involve an API call to save/favorite the memo for the current user.
    // Since no user system is in place, it's a placeholder.
    alert(`${i18n("Favorite action for memo ID:")} ${memo.id}\n${i18n("Content:")} "${memo.content.substring(0,50)}..."`);
  };

  const handleViaNow = () => { // Quote
    const quoteText = `${memo.content.substring(0, 120)}... (via @${memo.creatorName} ${memo.link?.replace(/\/$/, '')}/m/${memo.id})`;
    navigator.clipboard.writeText(quoteText)
      .then(() => alert(i18n("Quote content copied to clipboard!")))
      .catch(err => console.error(i18n("Failed to copy quote: "), err));
  };

  // Determine if actions that modify content should be available.
  // For now, assuming these are always available as placeholders.
  // In a real app, this would depend on user authentication and permissions.
  const canModify = true; // Placeholder for permission check

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-8 w-8">
          <MoreHorizontal className="h-5 w-5" />
          <span className="sr-only">{i18n("Memo actions")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{i18n("Actions")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleFavorite} className="cursor-pointer">
          <Star className="mr-2 h-4 w-4 text-yellow-500" />
          <span>{i18n("Favorite")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleViaNow} className="cursor-pointer">
          <MessageSquareQuote className="mr-2 h-4 w-4 text-blue-500" />
          <span>{i18n("Quote (Via)")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          <LinkIcon className="mr-2 h-4 w-4" />
          <span>{i18n("Copy Link to Memo")}</span>
        </DropdownMenuItem>

        {canModify && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
              <Edit3 className="mr-2 h-4 w-4" />
              <span>{i18n("Edit")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleArchive} className="cursor-pointer">
              <Archive className="mr-2 h-4 w-4" />
              <span>{i18n("Archive")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-500 hover:!text-red-700 dark:hover:!text-red-400 focus:!text-red-700 focus:dark:!text-red-400 cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>{i18n("Delete")}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
