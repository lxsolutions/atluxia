'use client';

import { useState, useEffect } from 'react';
import { FamilySetupForm } from './FamilySetupForm';
import { FamilyDashboard } from './FamilyDashboard';

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
  createdAt: string;
}

export interface FamilyIntegration {
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
  createdAt: string;
  updatedAt: string;
}

export default function FamilyEducationPage() {
  const [familyIntegration, setFamilyIntegration] = useState<FamilyIntegration | null>(null);
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    try {
      setLoading(true);
      
      // In a real app, we would get the user ID from auth context
      const userId = 'demo-user-123';
      
      // Try to get existing family integration
      const integrationResponse = await fetch(`http://localhost:3012/api/integration/families/user/${userId}`);
      
      if (integrationResponse.ok) {
        const integration = await integrationResponse.json();
        setFamilyIntegration(integration);
        
        // Load recommendations
        const recResponse = await fetch(`http://localhost:3012/api/integration/recommendations/${integration.id}`);
        if (recResponse.ok) {
          const recs = await recResponse.json();
          setRecommendations(recs);
        }
      } else {
        // No integration exists yet - we'll show setup form
        setFamilyIntegration(null);
      }
    } catch (err) {
      console.error('Error loading family data:', err);
      setError('Failed to load family education data');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupFamily = async (formData: {
    children: Array<{ name: string; age: number; gradeLevel?: string }>;
    educationalPreferences: {
      subjects: string[];
      learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
      dailyLearningTime: number;
    };
  }) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3012/api/integration/families', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomadUserId: 'demo-user-123',
          ...formData,
        }),
      });

      if (response.ok) {
        const integration = await response.json();
        setFamilyIntegration(integration);
        
        // Load recommendations
        const recResponse = await fetch(`http://localhost:3012/api/integration/recommendations/${integration.id}`);
        if (recResponse.ok) {
          const recs = await recResponse.json();
          setRecommendations(recs);
        }
      } else {
        throw new Error('Failed to create family integration');
      }
    } catch (err) {
      console.error('Error setting up family:', err);
      setError('Failed to setup family education');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading family education data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadFamilyData}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Family Education</h1>
          <p className="text-gray-600">
            Access educational resources and learning recommendations for your children while traveling
          </p>
        </div>

        {!familyIntegration ? (
          <FamilySetupForm onSubmit={handleSetupFamily} />
        ) : (
          <FamilyDashboard 
            integration={familyIntegration}
            recommendations={recommendations}
            onRefresh={loadFamilyData}
          />
        )}
      </div>
    </div>
  );
}