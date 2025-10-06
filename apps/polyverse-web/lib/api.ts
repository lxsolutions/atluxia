import { Claim, Evidence, ConsensusReport } from '@atluxia/truth-archive-js';

// Mock API implementation for polyverse-web
// TODO: Replace with actual API calls to truth-archive services

export const truthApi = {
  async getClaims(): Promise<Claim[]> {
    // Mock implementation
    return [];
  },

  async getClaim(id: string): Promise<Claim | null> {
    // Mock implementation
    return null;
  },

  async getEvidence(id: string): Promise<Evidence[]> {
    // Mock implementation
    return [];
  },

  async getConsensusReports(id: string): Promise<ConsensusReport[]> {
    // Mock implementation
    return [];
  }
};