import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import type { ShareEvent } from '@atluxia/contracts';

export interface FamilyIntegration {
  id: string;
  nomadUserId: string;
  everpathFamilyId?: string;
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
    dailyLearningTime: number; // in minutes
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
  estimatedTime: number; // in minutes
  platform: 'everpath' | 'curio-critters' | 'external';
  url?: string;
  relevanceScore: number; // 0-100
  createdAt: Date;
}

@Controller('integration')
export class IntegrationController {
  private integrations: Map<string, FamilyIntegration> = new Map();
  private recommendations: Map<string, LearningRecommendation[]> = new Map();

  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'integration', timestamp: new Date() };
  }

  @Post('families')
  createFamilyIntegration(@Body() data: {
    nomadUserId: string;
    children: Array<{ name: string; age: number; gradeLevel?: string }>;
    educationalPreferences: {
      subjects: string[];
      learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
      dailyLearningTime: number;
    };
  }) {
    const integration: FamilyIntegration = {
      id: `family_${Date.now()}`,
      nomadUserId: data.nomadUserId,
      children: data.children.map(child => ({
        id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: child.name,
        age: child.age,
        gradeLevel: child.gradeLevel,
      })),
      educationalPreferences: data.educationalPreferences,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.integrations.set(integration.id, integration);
    
    // Generate initial recommendations
    this.generateRecommendations(integration.id);

    return integration;
  }

  @Get('families/:id')
  getFamilyIntegration(@Param('id') id: string) {
    const integration = this.integrations.get(id);
    if (!integration) {
      throw new Error('Family integration not found');
    }
    return integration;
  }

  @Get('families/user/:userId')
  getFamilyIntegrationByUser(@Param('userId') userId: string) {
    const integration = Array.from(this.integrations.values())
      .find(integration => integration.nomadUserId === userId);
    
    if (!integration) {
      throw new Error('Family integration not found for user');
    }
    return integration;
  }

  @Get('recommendations/:familyId')
  getRecommendations(
    @Param('familyId') familyId: string,
    @Query('childId') childId?: string,
    @Query('subject') subject?: string
  ) {
    let recommendations = this.recommendations.get(familyId) || [];
    
    if (childId) {
      recommendations = recommendations.filter(rec => rec.childId === childId);
    }
    
    if (subject) {
      recommendations = recommendations.filter(rec => rec.subject === subject);
    }

    return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  @Post('recommendations/:familyId/feedback')
  provideFeedback(
    @Param('familyId') familyId: string,
    @Body() data: { recommendationId: string; rating: number; feedback?: string }
  ) {
    // In a real implementation, this would update the recommendation algorithm
    console.log(`Feedback for recommendation ${data.recommendationId}: ${data.rating} - ${data.feedback}`);
    return { success: true, message: 'Feedback recorded' };
  }

  private generateRecommendations(familyId: string) {
    const integration = this.integrations.get(familyId);
    if (!integration) return;

    const recommendations: LearningRecommendation[] = [];

    integration.children.forEach(child => {
      // Generate recommendations based on child's age and preferences
      const ageBasedRecommendations = this.getAgeBasedRecommendations(child, integration);
      recommendations.push(...ageBasedRecommendations);

      // Generate Curio Critters recommendations
      const critterRecommendations = this.getCurioCrittersRecommendations(child, integration);
      recommendations.push(...critterRecommendations);
    });

    this.recommendations.set(familyId, recommendations);
  }

  private getAgeBasedRecommendations(child: any, integration: FamilyIntegration): LearningRecommendation[] {
    const recommendations: LearningRecommendation[] = [];
    const baseId = `rec_${Date.now()}`;

    if (child.age >= 4 && child.age <= 9) {
      // Curio Critters is perfect for this age range
      recommendations.push({
        id: `${baseId}_critters`,
        familyId: integration.id,
        childId: child.id,
        type: 'game',
        title: 'Curio Critters Educational Adventure',
        description: 'Interactive learning game with virtual pets that adapts to your child\'s learning level',
        subject: 'multi-subject',
        difficulty: 'beginner',
        estimatedTime: 30,
        platform: 'curio-critters',
        url: '/kids/curio-critters',
        relevanceScore: 95,
        createdAt: new Date(),
      });
    }

    if (integration.educationalPreferences.subjects.includes('math')) {
      recommendations.push({
        id: `${baseId}_math`,
        familyId: integration.id,
        childId: child.id,
        type: 'activity',
        title: 'Interactive Math Puzzles',
        description: 'Age-appropriate math challenges and puzzles',
        subject: 'math',
        difficulty: this.getDifficultyForAge(child.age),
        estimatedTime: 20,
        platform: 'everpath',
        relevanceScore: 85,
        createdAt: new Date(),
      });
    }

    if (integration.educationalPreferences.subjects.includes('science')) {
      recommendations.push({
        id: `${baseId}_science`,
        familyId: integration.id,
        childId: child.id,
        type: 'activity',
        title: 'Science Exploration',
        description: 'Hands-on science experiments and discovery activities',
        subject: 'science',
        difficulty: this.getDifficultyForAge(child.age),
        estimatedTime: 25,
        platform: 'everpath',
        relevanceScore: 80,
        createdAt: new Date(),
      });
    }

    return recommendations;
  }

  private getCurioCrittersRecommendations(child: any, integration: FamilyIntegration): LearningRecommendation[] {
    const recommendations: LearningRecommendation[] = [];
    const baseId = `rec_${Date.now()}_critters`;

    recommendations.push({
      id: `${baseId}_main`,
      familyId: integration.id,
      childId: child.id,
      type: 'game',
      title: 'Curio Critters Main Game',
      description: 'Complete educational adventure with virtual pet care and learning activities',
      subject: 'multi-subject',
      difficulty: 'beginner',
      estimatedTime: 45,
      platform: 'curio-critters',
      url: '/kids/curio-critters',
      relevanceScore: 90,
      createdAt: new Date(),
    });

    recommendations.push({
      id: `${baseId}_rpg`,
      familyId: integration.id,
      childId: child.id,
      type: 'game',
      title: 'RPG Adventure Mode',
      description: 'Story-based learning adventure with quests and achievements',
      subject: 'multi-subject',
      difficulty: 'intermediate',
      estimatedTime: 60,
      platform: 'curio-critters',
      url: '/kids/curio-critters/rpg',
      relevanceScore: 75,
      createdAt: new Date(),
    });

    return recommendations;
  }

  private getDifficultyForAge(age: number): 'beginner' | 'intermediate' | 'advanced' {
    if (age <= 6) return 'beginner';
    if (age <= 8) return 'intermediate';
    return 'advanced';
  }

  @Post('events/share')
  async handleShareEvent(@Body() shareEvent: ShareEvent) {
    console.log('Received share event:', shareEvent);
    
    // In a real implementation, this would:
    // 1. Store the share event in the database
    // 2. Process it for the Polyverse feed
    // 3. Trigger any downstream integrations
    
    // For now, just log it and return success
    return { 
      success: true, 
      message: 'Share event received successfully',
      eventId: `share_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }
}