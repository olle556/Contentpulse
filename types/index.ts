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
  scrapedContent?: string; // Add this field
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
  content: string;
  platform: string;
  status: string;
  scheduledTime?: Date;
  feedbackRating?: number;
  feedbackComments?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface PostHistory {
  id: string;
  postId: string;
  platform: string;
  postedAt: Date;
  status: string;
  platformPostId: string;
}

// Create a new file if it doesn't exist: types/index.ts
export type ContentSchedule = {
  id: string;
  userId: string;
  contentSourceId: string;
  tonality: string;
  platforms: string[];
  isRecurring: boolean;
  recurringDays: string[];
  startDate?: Date | null;
  date?: Date | null;
  time: string;
  aiInstructions?: string | null;
  createdAt: Date;
  updatedAt: Date;
  useEmojis?: boolean;
  threadCount: number;
}

export interface OnboardingStep {
  id: 'brand' | 'sources' | 'posts' | 'schedule';
  title: string;
  description: string;
  icon: JSX.Element;
  href: string;
  isCompleted: boolean;
}

export interface Post {
  id: string;
  title: string;
}
