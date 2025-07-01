export interface User {
  creatorName: string;
  website: string;
  link: string;
  creatorId: string; // User ID, typically a number but stored as string for flexibility e.g. "1", "101"
  avatar: string;
  twikoo?: string; // Twikoo environment ID
  artalk?: string;  // Artalk server URL
  artSite?: string; // Artalk site name
  v1?: string;
  apiType?: 'all' | 'v1';
}

export interface Resource {
  id: number; // Resource ID from API
  // creatorId: number; // Usually not directly on resource object from common APIs, but can be inferred
  createdTs: number;
  updatedTs: number;
  filename: string;
  externalLink: string; // This is the primary URL to use for the resource
  type: string;
  size: number;
  publicId?: string; // Memos v0 specific for URL construction if externalLink is not full
  [key: string]: any;
}

export interface Relation {
  [key: string]: any;
}

export interface Memo {
  id: number; // Memo ID from API (could be string for v1 if not transformed)
  rowStatus: "NORMAL" | "ARCHIVED";
  creatorId: string; // User ID of the memo creator, matches User.creatorId
  createdTs: number;
  updatedTs: number;
  displayTs: number;
  content: string;
  visibility: "PUBLIC" | "PROTECTED" | "PRIVATE";
  pinned: boolean;
  creatorName: string; // Added from User object
  creatorUsername?: string; // Potentially from API
  resourceList: Resource[];
  relationList: Relation[];

  // Fields added in client by merging User data:
  creatorAvatar?: string;
  creatorWebsite?: string;
  link: string; // Base URL of the Memos instance this memo belongs to

  // Comment system fields inherited from User
  twikooEnvId?: string;
  artalkEnvUrl?: string;
  artalkSite?: string;
  [key: string]: any;
}

export interface UserList {
  myMemoList: User[];
}

// Types for Blog Feeds
export interface FeedSource {
  id: string;
  name: string;
  url: string;
  type: 'xml' | 'json-custom-cf' | 'json-shinian';
}

export interface FeedItem {
  id: string;
  title: string;
  link: string;
  publishedDate?: string | Date;
  summary?: string;
  authorName?: string;
  authorAvatarUrl?: string;
  siteTitle?: string;
  faviconUrl?: string;
}
