import { Injectable } from '@nestjs/common';

export interface FamilyProfile {
  id: string;
  nomadUserId: string;
  children: Array<{
    id: string;
    name: string;
    age: number;
    gradeLevel?: string;
    curioCritterId?: string;
  }>;
  educationalPreferences: {
    subjects: string[];
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    dailyLearningTime: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningRecommendation {
  id: string;
  familyId: string;
  childId: string;
  type: 'curriculum' | 'activity' | 'game' | 'resource';
  title: string;
  description: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  platform: 'everpath' | 'curio-critters' | 'external';
  url?: string;
  relevanceScore: number;
  createdAt: Date;
}

@Injectable()
export class IntegrationService {
  private familyProfiles: Map<string, FamilyProfile> = new Map();
  private recommendations: Map<string, LearningRecommendation[]> = new Map();

  constructor() {
    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    const demoFamily: FamilyProfile = {
      id: 'demo-family-123',
      nomadUserId: 'demo-user-123',
      children: [
        {
          id: 'child-1',
          name: 'Emma',
          age: 7,
          gradeLevel: '2nd Grade',
          curioCritterId: 'critter-emma-123',
        },
        {
          id: 'child-2',
          name: 'Liam',
          age: 5,
          gradeLevel: 'Kindergarten',
          curioCritterId: 'critter-liam-456',
        },
      ],
      educationalPreferences: {
        subjects: ['math', 'science', 'reading'],
        learningStyle: 'mixed',
        dailyLearningTime: 60,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.familyProfiles.set(demoFamily.id, demoFamily);

    const demoRecommendations: LearningRecommendation[] = [
      {
        id: 'rec-1',
        familyId: 'demo-family-123',
        childId: 'child-1',
        type: 'game',
        title: 'Math Adventure with Curio Critters',
        description: 'Interactive math game featuring Emma\'s favorite critter',
        subject: 'math',
        difficulty: 'beginner',
        estimatedTime: 20,
        platform: 'curio-critters',
        url: '/kids/curio-critters/game/math-adventure',
        relevanceScore: 95,
        createdAt: new Date(),
      },
      {
        id: 'rec-2',
        familyId: 'demo-family-123',
        childId: 'child-1',
        type: 'activity',
        title: 'Science Exploration Kit',
        description: 'Hands-on science experiments for curious minds',
        subject: 'science',
        difficulty: 'intermediate',
        estimatedTime: 30,
        platform: 'everpath',
        url: '/everpath/activities/science-exploration',
        relevanceScore: 88,
        createdAt: new Date(),
      },
      {
        id: 'rec-3',
        familyId: 'demo-family-123',
        childId: 'child-2',
        type: 'game',
        title: 'Alphabet Safari',
        description: 'Fun letter recognition game with animal friends',
        subject: 'reading',
        difficulty: 'beginner',
        estimatedTime: 15,
        platform: 'curio-critters',
        url: '/kids/curio-critters/game/alphabet-safari',
        relevanceScore: 92,
        createdAt: new Date(),
      },
      {
        id: 'rec-4',
        familyId: 'demo-family-123',
        childId: 'child-2',
        type: 'activity',
        title: 'Counting with Colors',
        description: 'Visual counting activity using colorful objects',
        subject: 'math',
        difficulty: 'beginner',
        estimatedTime: 25,
        platform: 'everpath',
        url: '/everpath/activities/counting-colors',
        relevanceScore: 85,
        createdAt: new Date(),
      },
    ];

    this.recommendations.set(demoFamily.id, demoRecommendations);
  }

  async createFamilyProfile(profileData: Omit<FamilyProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<FamilyProfile> {
    const profile: FamilyProfile = {
      ...profileData,
      id: `family-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.familyProfiles.set(profile.id, profile);
    
    // Generate initial recommendations
    await this.generateRecommendations(profile.id);
    
    return profile;
  }

  async getFamilyProfileByUserId(userId: string): Promise<FamilyProfile | null> {
    for (const profile of this.familyProfiles.values()) {
      if (profile.nomadUserId === userId) {
        return profile;
      }
    }
    return null;
  }

  async getFamilyProfile(id: string): Promise<FamilyProfile | null> {
    return this.familyProfiles.get(id) || null;
  }

  async generateRecommendations(familyId: string): Promise<LearningRecommendation[]> {
    const profile = this.familyProfiles.get(familyId);
    if (!profile) {
      return [];
    }

    const recommendations: LearningRecommendation[] = [];
    
    for (const child of profile.children) {
      // Generate recommendations based on child's age and preferences
      const childRecommendations = this.generateChildRecommendations(profile, child);
      recommendations.push(...childRecommendations);
    }

    this.recommendations.set(familyId, recommendations);
    return recommendations;
  }

  private generateChildRecommendations(profile: FamilyProfile, child: any): LearningRecommendation[] {
    const recommendations: LearningRecommendation[] = [];
    const baseId = `rec-${Date.now()}`;

    // Age-appropriate recommendations
    if (child.age >= 4 && child.age <= 9) {
      // Curio Critters recommendations for younger children
      profile.educationalPreferences.subjects.forEach((subject, index) => {
        recommendations.push({
          id: `${baseId}-${index}`,
          familyId: profile.id,
          childId: child.id,
          type: 'game',
          title: `${this.capitalize(subject)} Adventure with Curio Critters`,
          description: `Fun ${subject} game featuring ${child.name}'s favorite critter`,
          subject,
          difficulty: this.getDifficultyByAge(child.age),
          estimatedTime: 15 + Math.floor(Math.random() * 15),
          platform: 'curio-critters',
          url: `/kids/curio-critters/game/${subject}-adventure`,
          relevanceScore: 80 + Math.floor(Math.random() * 20),
          createdAt: new Date(),
        });
      });
    }

    // EverPath recommendations for more structured learning
    profile.educationalPreferences.subjects.forEach((subject, index) => {
      recommendations.push({
        id: `${baseId}-everpath-${index}`,
        familyId: profile.id,
        childId: child.id,
        type: 'activity',
        title: `${this.capitalize(subject)} Learning Activity`,
        description: `Structured ${subject} activity designed for ${child.age}-year-olds`,
        subject,
        difficulty: this.getDifficultyByAge(child.age),
        estimatedTime: 20 + Math.floor(Math.random() * 20),
        platform: 'everpath',
        url: `/everpath/activities/${subject}-learning`,
        relevanceScore: 75 + Math.floor(Math.random() * 25),
        createdAt: new Date(),
      });
    });

    return recommendations;
  }

  private getDifficultyByAge(age: number): 'beginner' | 'intermediate' | 'advanced' {
    if (age <= 6) return 'beginner';
    if (age <= 9) return 'intermediate';
    return 'advanced';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async getRecommendations(familyId: string): Promise<LearningRecommendation[]> {
    return this.recommendations.get(familyId) || [];
  }

  async updateFamilyProfile(id: string, updates: Partial<FamilyProfile>): Promise<FamilyProfile | null> {
    const profile = this.familyProfiles.get(id);
    if (!profile) {
      return null;
    }

    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date(),
    };

    this.familyProfiles.set(id, updatedProfile);
    
    // Regenerate recommendations if preferences changed
    if (updates.educationalPreferences || updates.children) {
      await this.generateRecommendations(id);
    }
    
    return updatedProfile;
  }

  async getPlatformStats(): Promise<{
    totalFamilies: number;
    totalChildren: number;
    totalRecommendations: number;
    platformUsage: Record<string, number>;
  }> {
    let totalChildren = 0;
    let totalRecommendations = 0;
    const platformUsage: Record<string, number> = {};

    for (const profile of this.familyProfiles.values()) {
      totalChildren += profile.children.length;
    }

    for (const recs of this.recommendations.values()) {
      totalRecommendations += recs.length;
      for (const rec of recs) {
        platformUsage[rec.platform] = (platformUsage[rec.platform] || 0) + 1;
      }
    }

    return {
      totalFamilies: this.familyProfiles.size,
      totalChildren,
      totalRecommendations,
      platformUsage,
    };
  }
}