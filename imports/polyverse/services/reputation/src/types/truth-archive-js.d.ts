declare module '@polyverse/truth-archive-js' {
  export interface ConfidenceReport {
    claimId: string;
    lensId: string;
    score: number;
    intervals: {
      lower: number;
      upper: number;
      method: string;
    };
    inputs: Record<string, any>;
    dissentingViews: string[];
    computed_at: string;
  }

  export interface TransparencyRecord {
    id: string;
    recordType: string;
    recordData: Record<string, any>;
    claimId?: string;
    lensId?: string;
    actorId?: string;
    createdAt: string;
    signature?: string;
    publicKey?: string;
  }

  export function verifySignature(message: string, signature: string, publicKey: string): boolean;
  export function createSignature(message: string, privateKey: string): string;
}