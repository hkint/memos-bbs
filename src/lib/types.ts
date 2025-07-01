export interface User {
  creatorName: string;
  website: string;
  link: string;
  creatorId: string;
  avatar: string;
  twikoo?: string;
  artalk?: string;
  artSite?: string;
  v1?: string; // Not sure what this is, optional for now
}

export interface Resource {
  id: number;
  creatorId: number;
  createdTs: number;
  updatedTs: number;
  filename: string;
  externalLink: string;
  type: string;
  size: number;
  // Potentially other fields if the API can return more
  [key: string]: any;
}

export interface Relation {
  // Based on the API response, relationList is often empty or structure is unknown
  // Using a flexible type for now.
  [key: string]: any;
}

export interface Memo {
  id: number;
  rowStatus: "NORMAL" | "ARCHIVED"; // Assuming ARCHIVED is a possibility
  creatorId: number;
  createdTs: number;
  updatedTs: number;
  displayTs: number;
  content: string;
  visibility: "PUBLIC" | "PROTECTED" | "PRIVATE"; // Assuming other visibilities
  pinned: boolean;
  creatorName: string;
  creatorUsername?: string; // It was in the example, but might not always be there
  resourceList: Resource[];
  relationList: Relation[];
  // Potentially other fields if the API can return more
  [key: string]: any;
}

// For the list of users in memos.json
export interface UserList {
  myMemoList: User[];
}
