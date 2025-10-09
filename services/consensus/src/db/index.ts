// Simple in-memory storage for development
// Will be replaced with proper database integration later

interface ConfidenceReport {
  id: string;
  claimId: string;
  lensId: string;
  score: number;
  intervals: { lower: number; upper: number; method: string };
  inputs: Record<string, any>;
  dissentingViews: string[];
  computedAt: Date;
  version: number;
  isActive: boolean;
}

interface TransparencyRecord {
  id: string;
  recordType: string;
  recordData: Record<string, any>;
  claimId?: string;
  lensId?: string;
  actorId?: string;
  createdAt: Date;
  signature?: string;
  publicKey?: string;
}

// In-memory storage
const confidenceReports: ConfidenceReport[] = [];
const transparencyRecords: TransparencyRecord[] = [];

// Consensus operations
export const consensusDb = {
  // Store confidence report
  async storeConfidenceReport(report: Omit<ConfidenceReport, 'id'>): Promise<ConfidenceReport> {
    const newReport: ConfidenceReport = {
      ...report,
      id: Math.random().toString(36).substring(2, 15),
    };
    confidenceReports.push(newReport);
    return newReport;
  },
  
  // Get confidence reports for a claim
  async getConfidenceReports(claimId: string): Promise<ConfidenceReport[]> {
    return confidenceReports.filter(report => 
      report.claimId === claimId && report.isActive
    ).sort((a, b) => a.computedAt.getTime() - b.computedAt.getTime());
  },
  
  // Store transparency record
  async storeTransparencyRecord(record: Omit<TransparencyRecord, 'id'>): Promise<void> {
    const newRecord: TransparencyRecord = {
      ...record,
      id: Math.random().toString(36).substring(2, 15),
    };
    transparencyRecords.push(newRecord);
  },
  
  // Get transparency records
  async getTransparencyRecords(
    claimId?: string,
    lensId?: string,
    recordType?: string,
    limit = 100,
    offset = 0
  ): Promise<TransparencyRecord[]> {
    let filtered = transparencyRecords;
    
    if (claimId) {
      filtered = filtered.filter(record => record.claimId === claimId);
    }
    if (lensId) {
      filtered = filtered.filter(record => record.lensId === lensId);
    }
    if (recordType) {
      filtered = filtered.filter(record => record.recordType === recordType);
    }
    
    return filtered
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(offset, offset + limit);
  },
  
  // Store jury composition (stub for now)
  async storeJuryComposition(composition: {
    claimId: string;
    jurors: {
      actorId: string;
      expertise: number;
      calibration: number;
      diversityCluster: string;
      weight: number;
    }[];
    diversityConstraints: {
      minPerCluster: number;
      maxPerCluster: number;
      clusters: string[];
    };
  }): Promise<void> {
    // Store in transparency records for now
    await consensusDb.storeTransparencyRecord({
      recordType: 'jury_composition',
      recordData: composition,
      claimId: composition.claimId,
      createdAt: new Date(),
    });
  },
  
  // Update community note rating (stub for now)
  async updateCommunityNoteRating(noteId: string, helpful: boolean): Promise<void> {
    // This would update Elo ratings in a real implementation
    console.log(`Note ${noteId} marked as ${helpful ? 'helpful' : 'unhelpful'}`);
  }
};