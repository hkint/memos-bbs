'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Smile, Image as ImageIcon, Paperclip, Send, Settings2, CalendarDays, Tag } from 'lucide-react';
import { Memo, Resource } from '@/lib/types'; // Assuming Resource might be part of it

// Placeholder for i18n function
const i18n = (key: string) => key;

interface EditorProps {
  initialMemo?: Partial<Memo>; // For editing existing memos
  onSubmit: (data: {
    content: string;
    visibility: 'PUBLIC' | 'PROTECTED' | 'PRIVATE';
    resourceIdList?: number[]; // Or Resource[] if handling uploads here
    // other fields like tags, etc.
  }) => Promise<void>;
  isSubmitting?: boolean;
}

type Visibility = 'PUBLIC' | 'PROTECTED' | 'PRIVATE';

export function Editor({ initialMemo, onSubmit, isSubmitting = false }: EditorProps) {
  const [content, setContent] = useState(initialMemo?.content || '');
  const [visibility, setVisibility] = useState<Visibility>(initialMemo?.visibility || 'PUBLIC');
  // const [resourceIdList, setResourceIdList] = useState<number[]>(initialMemo?.resourceList?.map(r => r.id) || []);
  // For simplicity, resource handling (uploads, selection) is stubbed
  const [selectedResources, setSelectedResources] = useState<File[]>([]);


  const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  const handleVisibilityChange = (value: string) => {
    setVisibility(value as Visibility);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedResources(Array.from(event.target.files));
      // In a real app, you'd upload these files and get resource IDs
      // For now, we'll just log them
      console.log("Selected files:", Array.from(event.target.files).map(f => f.name));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!content.trim()) {
      alert(i18n("Content cannot be empty."));
      return;
    }
    // Actual resourceIdList would come from uploaded files
    await onSubmit({ content, visibility /*, resourceIdList */ });
    // Optionally clear fields after successful submission if not editing
    if (!initialMemo?.id) {
        setContent('');
        setVisibility('PUBLIC');
        setSelectedResources([]);
    }
  };

  const handleInsertText = (textToInsert: string) => {
    // This is a basic implementation. A more robust solution would use
    // the textarea's selectionStart and selectionEnd properties.
    setContent(prevContent => prevContent + textToInsert);
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800">
      <Textarea
        value={content}
        onChange={handleContentChange}
        placeholder={i18n("What's on your mind?")}
        className="min-h-[120px] text-base focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        maxLength={5000} // Example max length
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon" aria-label={i18n("Insert Emoji")}>
                <Smile className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              {/* Emoji Picker would go here. For now, a placeholder. */}
              <div className="p-2">{i18n("Emoji picker placeholder")}</div>
            </PopoverContent>
          </Popover>

          <Button type="button" variant="ghost" size="icon" aria-label={i18n("Add Image or File")} onClick={() => document.getElementById('file-upload')?.click()}>
            <ImageIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </Button>
          <input id="file-upload" type="file" multiple onChange={handleFileChange} className="hidden" />

          <Button type="button" variant="ghost" size="icon" aria-label={i18n("Add Tag")} onClick={() => handleInsertText(' #')}>
            <Tag className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </Button>

          {/* More tools can be added here, e.g., schedule, content warning */}
           <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon" aria-label={i18n("More Options")}>
                <Settings2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2 space-y-2">
                <Button type="button" variant="outline" size="sm" className="w-full justify-start" onClick={() => alert(i18n("Schedule Post"))}>
                    <CalendarDays className="mr-2 h-4 w-4"/> {i18n("Schedule")}
                </Button>
                 {/* Add other options here */}
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={visibility} onValueChange={handleVisibilityChange}>
            <SelectTrigger className="w-[130px] h-9 text-xs dark:bg-gray-700 dark:border-gray-600">
              <SelectValue placeholder={i18n("Visibility")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLIC">{i18n("Public")}</SelectItem>
              <SelectItem value="PROTECTED">{i18n("Protected")}</SelectItem>
              <SelectItem value="PRIVATE">{i18n("Private")}</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={isSubmitting || !content.trim()} className="h-9 px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
            {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Send className="h-4 w-4 mr-2 sm:mr-0" />
            )}
            <span className="hidden sm:inline ml-1">{initialMemo?.id ? i18n("Update") : i18n("Post")}</span>
          </Button>
        </div>
      </div>
      {selectedResources.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {i18n("Selected files:")} {selectedResources.map(f => f.name).join(', ')}
          {/* In a real app, show previews or upload progress */}
        </div>
      )}
    </form>
  );
}
