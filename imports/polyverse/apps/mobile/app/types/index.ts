// Common types for the mobile app

export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
}

export interface Short {
  id: string;
  videoUrl: string;
  creator: User;
  title: string;
  description?: string;
  duration: number;
  createdAt: string;
  likes: number;
  views: number;
}

export interface Claim {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  evidenceCount: number;
  counterclaimCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TransparencyRecord {
  algorithm: string;
  features: Record<string, number>;
  weights: Record<string, number>;
  timestamp: string;
  explanation?: string[];
  bundleId?: string;
}

export type Algorithm = 'recency_follow' | 'diversity_dissent' | 'locality_first';

export interface UploadTask {
  id: string;
  fileUri: string;
  uploadUrl: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
}

export interface PushNotification {
  title: string;
  body: string;
  data?: {
    type: 'new_short' | 'new_claim' | 'new_comment' | 'tip_received' | 'follow' | 'upload_started' | 'upload_completed';
    targetId?: string;
    targetType?: 'short' | 'claim' | 'user';
    deepLink?: string;
    uploadId?: string;
  };
}