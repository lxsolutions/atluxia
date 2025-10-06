import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Short {
  id: string;
  videoUrl: string;
  creator: {
    id: string;
    username: string;
    avatar?: string;
  };
  title: string;
  description?: string;
  duration: number;
  createdAt: string;
}

interface TransparencyRecord {
  algorithm: string;
  features: Record<string, number>;
  weights: Record<string, number>;
  timestamp: string;
}

type Algorithm = 'recency_follow' | 'diversity_dissent' | 'locality_first';

const mockShorts: Short[] = [
  {
    id: '1',
    videoUrl: 'https://example.com/short1.mp4',
    creator: { id: '1', username: 'science_enthusiast' },
    title: 'The Science of Climate Change',
    description: 'Exploring the latest climate research',
    duration: 45,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    videoUrl: 'https://example.com/short2.mp4',
    creator: { id: '2', username: 'tech_innovator' },
    title: 'AI Ethics Explained',
    description: 'Understanding the ethical implications of AI',
    duration: 60,
    createdAt: '2024-01-14T15:30:00Z',
  },
];

const mockTransparencyRecords: Record<string, TransparencyRecord> = {
  '1': {
    algorithm: 'diversity_dissent',
    features: { recency: 0.8, creator_diversity: 0.9, topic_variety: 0.7 },
    weights: { recency: 0.3, creator_diversity: 0.4, topic_variety: 0.3 },
    timestamp: '2024-01-15T10:00:00Z',
  },
  '2': {
    algorithm: 'recency_follow',
    features: { recency: 0.9, follow_affinity: 0.8, engagement: 0.6 },
    weights: { recency: 0.4, follow_affinity: 0.4, engagement: 0.2 },
    timestamp: '2024-01-14T15:30:00Z',
  },
};

export function useShortsFeed() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('diversity_dissent');

  const { data: shorts = [], isLoading } = useQuery({
    queryKey: ['shorts', algorithm],
    queryFn: async () => {
      // Mock API call - replace with actual fetch
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockShorts;
    },
  });

  const transparencyRecords = mockTransparencyRecords;

  return {
    shorts,
    algorithm,
    setAlgorithm,
    transparencyRecords,
    isLoading,
  };
}