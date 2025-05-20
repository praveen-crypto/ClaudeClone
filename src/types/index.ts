import { Timestamp } from 'firebase/firestore';

export interface Chat {
  id: string;
  title: string;
  createdBy: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  participants: string[];
  pinned: boolean;
  folder?: string;
}

export interface Message {
  id: string;
  content: string;
  type: string;
  senderId: string;
  createdAt: Date | Timestamp;
  reactions: Record<string, string>;
}

export interface ChatFolder {
  id: string;
  name: string;
  createdBy: string;
  chats: string[];
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: string;
  role: string;
  emailVerified:  boolean;
  lastLoginAt: string;
  preferences?: UserPreferences;
  stats?: UserStats;
  activityLog?: ActivityLogEntry[];
  subscriptionTier?: 'free' | 'premium' | 'enterprise';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  notifications: {
    newMessages: boolean;
    mentions: boolean;
    systemUpdates: boolean;
    email: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    showReadReceipts: boolean;
    allowDirectMessages: boolean;
  };
  language: string;
  keyboardShortcuts: Record<string, string>;
}

export interface UserStats {
  totalMessages: number;
  totalChats: number;
  joinDate: string;
  lastActive: string;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  timestamp: string;
  details?: any;
}
