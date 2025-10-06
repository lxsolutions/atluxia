import React from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { ClaimBundle } from '@atluxia/truth-archive-js';
import { truthApi } from '../../../lib/api';

interface BundlesPageProps {
  bundles: ClaimBundle[];
  topics: string[];
}

export default function BundlesPage({ bundles, topics }: BundlesPageProps) {
  const [selectedTopic, setSelectedTopic] = React.useState<string>('all');

  const filteredBundles = selectedTopic === 'all' 
    ? bundles 
    : bundles.filter(bundle => bundle.topic === selectedTopic);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Claim Bundles</h1>
        <p className="text-gray-600 mb-6">
          Explore topic-based collections of claims with confidence timelines
        </p>
        
        {/* Topic Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedTopic('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedTopic === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Topics
          </button>
          {topics.map(topic => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTopic === topic
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Bundles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBundles.map(bundle => (
          <Link key={bundle.id} href={`/truth/bundles/${bundle.id}`}>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{bundle.name}</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {bundle.topic}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {bundle.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{bundle.claims.length} claims</span>
                <span>
                  {bundle.confidenceTimeline.length > 0 && (
                    <span className="text-green-600 font-medium">
                      {Math.round(bundle.confidenceTimeline[bundle.confidenceTimeline.length - 1].confidence * 100)}%
                    </span>
                  )}
                </span>
              </div>
              
              {/* Mini Timeline */}
              {bundle.confidenceTimeline.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Confidence Trend</span>
                    <span>
                      {bundle.confidenceTimeline.length} updates
                    </span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ 
                        width: `${Math.round(bundle.confidenceTimeline[bundle.confidenceTimeline.length - 1].confidence * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filteredBundles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No bundles found for the selected topic.</p>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // In a real implementation, these would be actual API calls
    const bundles: ClaimBundle[] = [
      {
        id: '1',
        title: 'Climate Change Evidence',
        name: 'Climate Change Evidence',
        description: 'Comprehensive collection of climate change research and data',
        topic: 'environment',
        claims: [],
        confidenceTimeline: [
          { timestamp: '2024-01-01', confidence: 0.85, lensId: 'climate-lens' },
          { timestamp: '2024-02-01', confidence: 0.87, lensId: 'climate-lens' },
          { timestamp: '2024-03-01', confidence: 0.89, lensId: 'climate-lens' },
        ],
        created_at: '2024-01-01',
        createdAt: '2024-01-01',
        updated_at: '2024-03-01',
        updatedAt: '2024-03-01',
      },
      {
        id: '2',
        title: 'Vaccine Efficacy Studies',
        name: 'Vaccine Efficacy Studies',
        description: 'Analysis of vaccine effectiveness across multiple studies',
        topic: 'health',
        claims: [],
        confidenceTimeline: [
          { timestamp: '2024-01-01', confidence: 0.92, lensId: 'health-lens' },
          { timestamp: '2024-02-01', confidence: 0.91, lensId: 'health-lens' },
          { timestamp: '2024-03-01', confidence: 0.93, lensId: 'health-lens' },
        ],
        created_at: '2024-01-01',
        createdAt: '2024-01-01',
        updated_at: '2024-03-01',
        updatedAt: '2024-03-01',
      },
      {
        id: '3',
        title: 'Economic Policy Analysis',
        name: 'Economic Policy Analysis',
        description: 'Evaluation of economic policies and their impacts',
        topic: 'economics',
        claims: [],
        confidenceTimeline: [
          { timestamp: '2024-01-01', confidence: 0.78, lensId: 'economics-lens' },
          { timestamp: '2024-02-01', confidence: 0.76, lensId: 'economics-lens' },
          { timestamp: '2024-03-01', confidence: 0.79, lensId: 'economics-lens' },
        ],
        created_at: '2024-01-01',
        createdAt: '2024-01-01',
        updated_at: '2024-03-01',
        updatedAt: '2024-03-01',
      },
    ];

    const topics = Array.from(new Set(bundles.map(bundle => bundle.topic)));

    return {
      props: {
        bundles,
        topics,
      },
    };
  } catch (error) {
    console.error('Error fetching bundles:', error);
    return {
      props: {
        bundles: [],
        topics: [],
      },
    };
  }
};