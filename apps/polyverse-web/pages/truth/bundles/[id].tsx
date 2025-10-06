import React from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { ClaimBundle, Claim } from '@atluxia/truth-archive-js';
import { truthApi } from '../../../lib/api';

interface BundleDetailPageProps {
  bundle: ClaimBundle;
  bundleClaims: Claim[];
}

export default function BundleDetailPage({ bundle, bundleClaims }: BundleDetailPageProps) {
  const [selectedLens, setSelectedLens] = React.useState<string>('all');

  const lenses = Array.from(new Set(bundle.confidenceTimeline.map(item => item.lensId)));
  
  const filteredTimeline = selectedLens === 'all'
    ? bundle.confidenceTimeline
    : bundle.confidenceTimeline.filter(item => item.lensId === selectedLens);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/truth/bundles" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Bundles
        </Link>
        
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{bundle.name}</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {bundle.topic}
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {bundle.confidenceTimeline.length > 0 && (
                `${Math.round(bundle.confidenceTimeline[bundle.confidenceTimeline.length - 1].confidence * 100)}%`
              )}
            </div>
            <div className="text-sm text-gray-500">Current Confidence</div>
          </div>
        </div>
        
        <p className="text-gray-600 text-lg mb-6">{bundle.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Confidence Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Confidence Timeline</h2>
            <select
              value={selectedLens}
              onChange={(e) => setSelectedLens(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Lenses</option>
              {lenses.map(lens => (
                <option key={lens} value={lens}>{lens}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-4">
            {filteredTimeline.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">{item.lensId}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    {Math.round(item.confidence * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">confidence</div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredTimeline.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No timeline data available for the selected lens.
            </div>
          )}
        </div>

        {/* Claims in Bundle */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Claims in Bundle</h2>
          
          <div className="space-y-4">
            {bundleClaims.map(claim => (
              <Link key={claim.id} href={`/truth/${claim.id}`}>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <h3 className="font-medium text-gray-900 mb-2">{claim.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {claim.description || claim.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Status: {claim.status}</span>
                    {claim.confidence && (
                      <span className="font-medium text-green-600">
                        {Math.round(claim.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {bundleClaims.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No claims found in this bundle.
            </div>
          )}
        </div>
      </div>

      {/* Bundle Metadata */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bundle Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Created</div>
            <div className="font-medium">{new Date(bundle.createdAt).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-gray-500">Last Updated</div>
            <div className="font-medium">{new Date(bundle.updatedAt).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-gray-500">Total Claims</div>
            <div className="font-medium">{bundle.claims.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const bundleId = params?.id as string;

    // Mock data - in real implementation, fetch from API
    const bundle: ClaimBundle = {
      id: bundleId,
      title: 'Climate Change Evidence',
      name: 'Climate Change Evidence',
      description: 'Comprehensive collection of climate change research and data from multiple sources and studies.',
      topic: 'environment',
      claims: [], // Empty array for now - in real implementation, fetch actual claims
      confidenceTimeline: [
        { timestamp: '2024-01-01', confidence: 0.85, lensId: 'climate-lens' },
        { timestamp: '2024-01-15', confidence: 0.86, lensId: 'climate-lens' },
        { timestamp: '2024-02-01', confidence: 0.87, lensId: 'climate-lens' },
        { timestamp: '2024-02-15', confidence: 0.88, lensId: 'climate-lens' },
        { timestamp: '2024-03-01', confidence: 0.89, lensId: 'climate-lens' },
        { timestamp: '2024-01-01', confidence: 0.82, lensId: 'scientific-lens' },
        { timestamp: '2024-02-01', confidence: 0.84, lensId: 'scientific-lens' },
        { timestamp: '2024-03-01', confidence: 0.86, lensId: 'scientific-lens' },
      ],
      created_at: '2024-01-01',
      createdAt: '2024-01-01',
      updated_at: '2024-03-01',
      updatedAt: '2024-03-01',
    };

    const bundleClaims: Claim[] = [
      {
        id: '1',
        title: 'Global temperatures are rising due to human activity',
        statement: 'Human activity is causing global temperature rise',
        content: 'Multiple studies show correlation between CO2 emissions and temperature increases',
        description: 'Evidence from multiple climate studies',
        topicTags: ['climate', 'science', 'environment'],
        tags: ['climate', 'science', 'environment'],
        created_at: '2024-01-01',
        createdAt: '2024-01-01',
        updatedAt: '2024-03-01',
        author_pubkey: 'user1',
        creator: 'Climate Research Institute',
        sig: 'mock-signature-1',
        lineage: [],
        evidenceRefs: [],
        counterclaimRefs: [],
        methodRefs: [],
        attributionRefs: [],
        confidenceReports: [],
        version: 1,
        status: 'resolved',
        confidence: 0.92,
      },
      {
        id: '2',
        title: 'Sea levels are rising at an accelerating rate',
        statement: 'Sea levels are rising due to climate change',
        content: 'Satellite data shows consistent sea level rise over the past 30 years',
        description: 'Oceanographic data analysis',
        topicTags: ['climate', 'ocean', 'environment'],
        tags: ['climate', 'ocean', 'environment'],
        created_at: '2024-01-15',
        createdAt: '2024-01-15',
        updatedAt: '2024-03-01',
        author_pubkey: 'user2',
        creator: 'Oceanographic Institute',
        sig: 'mock-signature-2',
        lineage: [],
        evidenceRefs: [],
        counterclaimRefs: [],
        methodRefs: [],
        attributionRefs: [],
        confidenceReports: [],
        version: 1,
        status: 'resolved',
        confidence: 0.88,
      },
      {
        id: '3',
        title: 'Extreme weather events are becoming more frequent',
        statement: 'Climate change increases frequency of extreme weather',
        content: 'Analysis of weather patterns shows increase in extreme events',
        description: 'Meteorological pattern analysis',
        topicTags: ['climate', 'weather', 'environment'],
        tags: ['climate', 'weather', 'environment'],
        created_at: '2024-02-01',
        createdAt: '2024-02-01',
        updatedAt: '2024-03-01',
        author_pubkey: 'user3',
        creator: 'Meteorological Association',
        sig: 'mock-signature-3',
        lineage: [],
        evidenceRefs: [],
        counterclaimRefs: [],
        methodRefs: [],
        attributionRefs: [],
        confidenceReports: [],
        version: 1,
        status: 'resolved',
        confidence: 0.85,
      },
    ];

    return {
      props: {
        bundle,
        bundleClaims,
      },
    };
  } catch (error) {
    console.error('Error fetching bundle details:', error);
    return {
      notFound: true,
    };
  }
};