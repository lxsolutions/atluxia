// Shared database types and schemas for Atluxia platforms

export interface AtluxiaUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  platforms: {
    nomad?: {
      userId: string;
      profile: any;
      createdAt: Date;
    };
    polyverse?: {
      userId: string;
      profile: any;
      createdAt: Date;
    };
    everpath?: {
      userId: string;
      profile: any;
      createdAt: Date;
    };
  };
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyProfile {
  id: string;
  atluxiaUserId: string;
  name: string;
  children: ChildProfile[];
  educationalPreferences: EducationalPreferences;
  travelPreferences: TravelPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChildProfile {
  id: string;
  familyId: string;
  name: string;
  age: number;
  birthDate?: Date;
  gradeLevel?: string;
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  interests: string[];
  curioCritterId?: string;
  everpathStudentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EducationalPreferences {
  subjects: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  dailyLearningTime: number; // minutes
  preferredPlatforms: ('curio-critters' | 'everpath' | 'external')[];
  curriculumStyle: 'structured' | 'exploratory' | 'mixed';
  assessmentFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}

export interface TravelPreferences {
  preferredDestinations: string[];
  travelFrequency: 'occasional' | 'frequent' | 'constant';
  accommodationType: 'hotel' | 'apartment' | 'house' | 'mixed';
  educationDuringTravel: boolean;
  internetRequirements: 'basic' | 'reliable' | 'high-speed';
}

export interface LearningRecommendation {
  id: string;
  familyId: string;
  childId: string;
  type: 'curriculum' | 'activity' | 'game' | 'resource' | 'assessment';
  title: string;
  description: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  platform: 'everpath' | 'curio-critters' | 'external';
  url?: string;
  prerequisites?: string[];
  learningObjectives: string[];
  relevanceScore: number; // 0-100
  feedback?: {
    rating: number;
    comments?: string;
    completed: boolean;
    completionDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformIntegration {
  id: string;
  atluxiaUserId: string;
  platform: 'nomad' | 'polyverse' | 'everpath';
  platformUserId: string;
  accessToken?: string;
  refreshToken?: string;
  scopes: string[];
  isActive: boolean;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentSync {
  id: string;
  familyId: string;
  platform: 'everpath' | 'curio-critters';
  contentType: 'progress' | 'achievement' | 'activity' | 'profile';
  contentId: string;
  data: any;
  syncDirection: 'inbound' | 'outbound' | 'bidirectional';
  status: 'pending' | 'synced' | 'failed' | 'conflict';
  lastAttemptAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsEvent {
  id: string;
  familyId: string;
  childId?: string;
  eventType: 'recommendation_viewed' | 'recommendation_completed' | 'platform_accessed' | 'learning_session' | 'feedback_provided';
  platform: 'nomad' | 'polyverse' | 'everpath' | 'curio-critters' | 'integration';
  data: any;
  timestamp: Date;
}

// Database schema validation utilities
export function validateFamilyProfile(profile: any): profile is FamilyProfile {
  return (
    typeof profile === 'object' &&
    typeof profile.id === 'string' &&
    typeof profile.atluxiaUserId === 'string' &&
    Array.isArray(profile.children) &&
    typeof profile.educationalPreferences === 'object' &&
    typeof profile.travelPreferences === 'object' &&
    profile.createdAt instanceof Date &&
    profile.updatedAt instanceof Date
  );
}

export function validateChildProfile(child: any): child is ChildProfile {
  return (
    typeof child === 'object' &&
    typeof child.id === 'string' &&
    typeof child.familyId === 'string' &&
    typeof child.name === 'string' &&
    typeof child.age === 'number' &&
    Array.isArray(child.interests) &&
    child.createdAt instanceof Date &&
    child.updatedAt instanceof Date
  );
}

// Data transformation utilities
export function normalizeUserData(userData: any): Partial<AtluxiaUser> {
  return {
    email: userData.email?.toLowerCase().trim(),
    name: userData.name?.trim(),
    image: userData.image,
    preferences: {
      language: userData.preferences?.language || 'en',
      timezone: userData.preferences?.timezone || 'UTC',
      notifications: {
        email: userData.preferences?.notifications?.email ?? true,
        push: userData.preferences?.notifications?.push ?? true,
        sms: userData.preferences?.notifications?.sms ?? false,
      },
    },
  };
}

export function calculateRelevanceScore(
  child: ChildProfile,
  preferences: EducationalPreferences,
  recommendation: Partial<LearningRecommendation>
): number {
  let score = 50; // Base score

  // Age appropriateness
  if (recommendation.difficulty === 'beginner' && child.age <= 6) score += 20;
  if (recommendation.difficulty === 'intermediate' && child.age > 6 && child.age <= 9) score += 20;
  if (recommendation.difficulty === 'advanced' && child.age > 9) score += 20;

  // Subject match
  if (recommendation.subject && preferences.subjects.includes(recommendation.subject)) score += 15;

  // Learning style match
  if (child.learningStyle && child.learningStyle === preferences.learningStyle) score += 10;

  // Platform preference
  if (recommendation.platform && preferences.preferredPlatforms.includes(recommendation.platform)) score += 5;

  return Math.min(100, score);
}

// All types are already exported above