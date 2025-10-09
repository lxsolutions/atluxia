import { useQuery } from '@tanstack/react-query';

interface Claim {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  evidenceCount: number;
  counterclaimCount: number;
  createdAt: string;
  updatedAt: string;
}

const mockClaims: Claim[] = [
  {
    id: '1',
    title: 'Climate change is primarily caused by human activity',
    summary: 'Scientific consensus supports that human activities are the main driver of recent climate change.',
    confidence: 0.92,
    evidenceCount: 15,
    counterclaimCount: 3,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
  },
  {
    id: '2',
    title: 'Vaccines are safe and effective for preventing diseases',
    summary: 'Extensive research demonstrates the safety and efficacy of vaccines in preventing infectious diseases.',
    confidence: 0.95,
    evidenceCount: 25,
    counterclaimCount: 5,
    createdAt: '2024-01-08T12:00:00Z',
    updatedAt: '2024-01-14T09:15:00Z',
  },
  {
    id: '3',
    title: 'Renewable energy can meet global energy demands',
    summary: 'Studies show that renewable energy sources have the potential to meet global energy needs sustainably.',
    confidence: 0.78,
    evidenceCount: 8,
    counterclaimCount: 7,
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-16T11:20:00Z',
  },
];

export function useTruthClaims() {
  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['truth-claims'],
    queryFn: async () => {
      // Mock API call - replace with actual fetch
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockClaims;
    },
  });

  return {
    claims,
    isLoading,
  };
}