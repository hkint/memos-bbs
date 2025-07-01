import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Placeholder for i18n function
const i18n = (key: string) => key;

interface UserAvatarProps {
  src: string;
  alt: string;
  fallbackText?: string; // Optional fallback text if image fails or for initials
}

export function UserAvatar({ src, alt, fallbackText = "User" }: UserAvatarProps) {
  return (
    <Avatar className="w-10 h-10 border border-gray-200 dark:border-gray-700">
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>{fallbackText.substring(0, 2)}</AvatarFallback>
    </Avatar>
  );
}
