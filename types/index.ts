export interface User {
  id: string;
  email: string;
  accountType: 'brand' | 'individual';
  preferences: UserPreferences;
  createdAt: Date;
}

export interface UserPreferences {
  contentTone: string;
  postingSchedule: PostSchedule;
  platformSettings: PlatformSettings[];
}

export interface PostSchedule {
  frequency: 'daily' | 'weekly';
  preferredTimes: string[];
  maxPostsPerDay: number;
}

export interface PlatformSettings {
  platform: 'X' | 'Threads';
  enabled: boolean;
  accountHandle: string;
  contentType: 'text' | 'thread';
  tonePreference: string;
  lengthPreference: string;
}

export interface ContentSource {
  id: string;
  userId: string;
  url: string;
  category: string;
  crawlFrequency: string;
  lastCrawled: Date;
}

export interface ScrapedContent {
  sourceUrl: string;
  timestamp: Date;
  title: string;
  content: string;
  metadata: {
    author?: string;
    tags?: string[];
    engagement?: number;
  };
}

export interface GeneratedPost {
  id: string;
  userId: string;
  content: string;
  platform: string;
  sourceMaterials: ScrapedContent[];
  status: 'pending' | 'approved' | 'rejected' | 'posted';
  scheduledTime?: Date;
  feedbackRating?: number;
  feedbackComments?: string;
  createdAt: Date;
}

export interface PostHistory {
  id: string;
  postId: string;
  platform: string;
  postedAt: Date;
  status: string;
  platformPostId: string;
}