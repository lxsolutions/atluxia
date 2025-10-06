'use client';

import { useState } from 'react';
import Link from 'next/link';

interface LearningRecommendation {
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

interface FamilyIntegration {
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

interface FamilyDashboardProps {
  integration: FamilyIntegration;
  recommendations: LearningRecommendation[];
  onRefresh: () => void;
}

export function FamilyDashboard({ 
  integration, 
  recommendations, 
  onRefresh 
}: FamilyDashboardProps) {
  const [selectedChild, setSelectedChild] = useState<string | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string | 'all'>('all');

  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedChild !== 'all' && rec.childId !== selectedChild) return false;
    if (selectedSubject !== 'all' && rec.subject !== selectedSubject) return false;
    return true;
  });

  const subjects = Array.from(new Set(recommendations.map(rec => rec.subject)));

  return (
    <div className="space-y-6">
      {/* Family Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">Family Overview</h2>
          <button
            onClick={onRefresh}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Refresh Recommendations
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Children</h3>
            <div className="space-y-3">
              {integration.children.map(child => (
                <div key={child.id} className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{child.name}</p>
                      <p className="text-sm text-gray-600">
                        Age {child.age} {child.gradeLevel && `• ${child.gradeLevel}`}
                      </p>
                    </div>
                    {child.curioCritterId && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Curio Critter Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Preferences</h3>
            <div className="space-y-2">
              <p><strong>Subjects:</strong> {integration.educationalPreferences.subjects.join(', ')}</p>
              <p><strong>Learning Style:</strong> {integration.educationalPreferences.learningStyle}</p>
              <p><strong>Daily Learning Time:</strong> {integration.educationalPreferences.dailyLearningTime} minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Learning Recommendations</h2>
          <div className="flex gap-4">
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Children</option>
              {integration.children.map(child => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject.charAt(0).toUpperCase() + subject.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No recommendations found for the selected filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecommendations.map(rec => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/kids/curio-critters"
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center hover:bg-blue-100 transition-colors"
          >
            <h3 className="font-medium text-blue-800">Curio Critters</h3>
            <p className="text-sm text-blue-600 mt-1">Educational Games</p>
          </Link>
          <Link
            href="/everpath"
            className="bg-green-50 border border-green-200 rounded-lg p-4 text-center hover:bg-green-100 transition-colors"
          >
            <h3 className="font-medium text-green-800">EverPath Learning</h3>
            <p className="text-sm text-green-600 mt-1">Curriculum & Activities</p>
          </Link>
          <Link
            href="/parent"
            className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center hover:bg-purple-100 transition-colors"
          >
            <h3 className="font-medium text-purple-800">Parent Dashboard</h3>
            <p className="text-sm text-purple-600 mt-1">Progress Tracking</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: LearningRecommendation }) {
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'curio-critters':
        return 'bg-blue-100 text-blue-800';
      case 'everpath':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <span className={`text-xs px-2 py-1 rounded ${getPlatformColor(recommendation.platform)}`}>
          {recommendation.platform}
        </span>
        <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(recommendation.difficulty)}`}>
          {recommendation.difficulty}
        </span>
      </div>
      
      <h3 className="font-medium text-gray-900 mb-2">{recommendation.title}</h3>
      <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
      
      <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
        <span>Subject: {recommendation.subject}</span>
        <span>{recommendation.estimatedTime} min</span>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          <span className="text-xs text-gray-500">{recommendation.relevanceScore}% match</span>
        </div>
        {recommendation.url && (
          <Link
            href={recommendation.url}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Start →
          </Link>
        )}
      </div>
    </div>
  );
}