declare module '@polyverse/truth-archive-js' {
  export interface Claim {
    id: string;
    title: string;
    statement: string;
    topicTags: string[];
    created_at: string;
    author_pubkey: string;
    sig: string;
    prevId?: string;
    lineage: string[];
    evidenceRefs: string[];
    counterclaimRefs: string[];
    methodRefs: string[];
    attributionRefs: string[];
    confidenceReports: ConfidenceReport[];
    version: number;
  }

  export interface Evidence {
    id: string;
    kind: 'url' | 'pdf' | 'transcript' | 'dataset' | 'primary_source' | 'secondary_source' | 'tertiary_source';
    source: string;
    quote?: string;
    hash?: string;
    authoredBy?: string;
    methodId?: string;
    created_at: string;
    author_pubkey: string;
    sig: string;
    stance: 'supports' | 'contradicts' | 'mixed' | 'unclear' | 'neutral';
    quality_score: number;
  }

  export interface Counterclaim {
    id: string;
    claimId: string;
    statement: string;
    evidenceRefs: string[];
    created_at: string;
    author_pubkey: string;
    sig: string;
    strength?: number;
    status: 'active' | 'resolved' | 'withdrawn' | 'superseded';
  }

  export interface ConfidenceReport {
    claimId: string;
    lensId: string;
    score: number;
    intervals?: {
      lower: number;
      upper: number;
      method: string;
    };
    inputs: Record<string, any>;
    dissentingViews: string[];
    computed_at: string;
  }

  export interface SearchResult {
    claims: Claim[];
    total: number;
    query: string;
  }

  export interface TruthArchiveClient {
    verifyTruthObject(obj: any, pubkey: string): Promise<boolean>;
  }

  export function verifyTruthObject<T extends { sig: string; author_pubkey: string; id?: string }>(obj: T): Promise<boolean>;
  export function createClaim(privateKey: string, claimData: Omit<Claim, 'id' | 'created_at' | 'author_pubkey' | 'sig' | 'lineage' | 'evidenceRefs' | 'counterclaimRefs' | 'methodRefs' | 'attributionRefs' | 'confidenceReports' | 'version'>): Promise<Claim>;
  export function createEvidence(privateKey: string, evidenceData: Omit<Evidence, 'id' | 'created_at' | 'author_pubkey' | 'sig'>): Promise<Evidence>;
  export function createCounterclaim(privateKey: string, counterclaimData: Omit<Counterclaim, 'id' | 'created_at' | 'author_pubkey' | 'sig'>): Promise<Counterclaim>;
}