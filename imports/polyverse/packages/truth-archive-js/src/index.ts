


import nacl from 'tweetnacl';

// Convert between hex and Uint8Array
const hexToBytes = (hex: string): Uint8Array => {
  if (hex.length % 2 !== 0) throw new Error('Hex string must have even length');
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Generate a new key pair
const generateKeyPair = (): { publicKey: string; privateKey: string } => {
  const keyPair = nacl.sign.keyPair();
  
  return {
    publicKey: bytesToHex(keyPair.publicKey),
    privateKey: bytesToHex(keyPair.secretKey)
  };
};

// Sign data with private key
const signData = async (secretKeyHex: string, data: string): Promise<string> => {
  const secretKey = hexToBytes(secretKeyHex);
  const message = new TextEncoder().encode(data);
  const signature = nacl.sign.detached(message, secretKey);
  return bytesToHex(signature);
};

// Verify signature with public key
const verifySignature = async (publicKeyHex: string, data: string, sigHex: string): Promise<boolean> => {
  try {
    const publicKey = hexToBytes(publicKeyHex);
    const message = new TextEncoder().encode(data);
    const signature = hexToBytes(sigHex);
    return nacl.sign.detached.verify(message, signature, publicKey);
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
};

export interface TruthArchiveClientOptions {
  baseUrl: string;
  apiKey?: string;
}

// Truth Archive Schema Types
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

export interface Method {
  id: string;
  description: string;
  protocolRefs: string[];
  created_at: string;
  author_pubkey: string;
  sig: string;
  version: number;
  validationStatus: 'draft' | 'peer_reviewed' | 'community_validated' | 'deprecated';
}

export interface Attribution {
  id: string;
  actorId: string;
  role: 'assertor' | 'reviewer' | 'juror' | 'validator' | 'methodologist';
  proof?: string;
  created_at: string;
  contribution: string;
  weight?: number;
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

export interface JuryVerdict {
  claimId: string;
  panel: Array<{
    jurorId: string;
    expertiseScore?: number;
    calibrationScore?: number;
    cluster?: string;
  }>;
  rubricScores: Record<string, number[]>;
  report: string;
  confidence: number;
  consensusLevel: 'unanimous' | 'strong' | 'moderate' | 'weak' | 'divided';
  created_at: string;
}

export interface SearchResult {
  claims: Claim[];
  total: number;
  query: string;
}

export interface PlayfulSignal {
  id: string;
  claimId: string;
  argumentId: string;
  winnerSide: 'pro' | 'con' | 'draw';
  matchMeta: {
    disputeId: string;
    gameType: string;
    verificationStatus: 'verified' | 'manual_review' | 'unverified';
    confidence: number;
    weightCap: number; // Always 0.02 (2%)
  };
  created_at: string;
  author_pubkey: string;
  sig: string;
}

// Truth Creation and Signing Utilities
export async function createClaim(
  privateKey: string,
  claimData: Omit<Claim, 'id' | 'created_at' | 'author_pubkey' | 'sig' | 'lineage' | 'evidenceRefs' | 'counterclaimRefs' | 'methodRefs' | 'attributionRefs' | 'confidenceReports' | 'version'>
): Promise<Claim> {
  const { publicKey } = generateKeyPairFromPrivate(privateKey);
  const created_at = new Date().toISOString();
  
  const claimWithoutSig: Omit<Claim, 'id' | 'sig'> = {
    ...claimData,
    created_at,
    author_pubkey: publicKey,
    lineage: [],
    evidenceRefs: [],
    counterclaimRefs: [],
    methodRefs: [],
    attributionRefs: [],
    confidenceReports: [],
    version: 1
  };

  const sig = await signData(privateKey, JSON.stringify(claimWithoutSig));
  const id = await generateId(JSON.stringify(claimWithoutSig));

  return {
    ...claimWithoutSig,
    id,
    sig
  };
}

export async function createEvidence(
  privateKey: string,
  evidenceData: Omit<Evidence, 'id' | 'created_at' | 'author_pubkey' | 'sig'>
): Promise<Evidence> {
  const { publicKey } = generateKeyPairFromPrivate(privateKey);
  const created_at = new Date().toISOString();
  
  const evidenceWithoutSig: Omit<Evidence, 'id' | 'sig'> = {
    ...evidenceData,
    created_at,
    author_pubkey: publicKey
  };

  const sig = await signData(privateKey, JSON.stringify(evidenceWithoutSig));
  const id = await generateId(JSON.stringify(evidenceWithoutSig));

  return {
    ...evidenceWithoutSig,
    id,
    sig
  };
}

export async function verifyTruthObject<T extends { sig: string; author_pubkey: string; id?: string }>(
  obj: T
): Promise<boolean> {
  const { sig, id, ...objWithoutSig } = obj;
  return verifySignature(obj.author_pubkey, JSON.stringify(objWithoutSig), sig);
}

export async function createPlayfulSignal(
  privateKey: string,
  signalData: Omit<PlayfulSignal, 'id' | 'created_at' | 'author_pubkey' | 'sig'>
): Promise<PlayfulSignal> {
  const { publicKey } = generateKeyPairFromPrivate(privateKey);
  const created_at = new Date().toISOString();
  
  const signalWithoutSig: Omit<PlayfulSignal, 'id' | 'sig'> = {
    ...signalData,
    created_at,
    author_pubkey: publicKey
  };

  const sig = await signData(privateKey, JSON.stringify(signalWithoutSig));
  const id = await generateId(JSON.stringify(signalWithoutSig));

  return {
    ...signalWithoutSig,
    id,
    sig
  };
}

export async function createCounterclaim(
  privateKey: string,
  counterclaimData: Omit<Counterclaim, 'id' | 'created_at' | 'author_pubkey' | 'sig'>
): Promise<Counterclaim> {
  const { publicKey } = generateKeyPairFromPrivate(privateKey);
  const created_at = new Date().toISOString();
  
  const counterclaimWithoutSig: Omit<Counterclaim, 'id' | 'sig'> = {
    ...counterclaimData,
    created_at,
    author_pubkey: publicKey
  };

  const sig = await signData(privateKey, JSON.stringify(counterclaimWithoutSig));
  const id = await generateId(JSON.stringify(counterclaimWithoutSig));

  return {
    ...counterclaimWithoutSig,
    id,
    sig
  };
}

// Helper functions
function generateKeyPairFromPrivate(privateKeyHex: string): { publicKey: string; privateKey: string } {
  const privateKey = hexToBytes(privateKeyHex);
  // In tweetnacl, the secret key contains both private and public key
  // The first 32 bytes are the private key, the last 32 bytes are the public key
  const keyPair = nacl.sign.keyPair.fromSecretKey(privateKey);
  
  return {
    publicKey: bytesToHex(keyPair.publicKey),
    privateKey: privateKeyHex
  };
}

async function generateId(content: string): Promise<string> {
  // Use SHA-256 for consistent hashing
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return btoa(String.fromCharCode(...hashArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } else if (typeof require !== 'undefined') {
    const { createHash } = require('crypto');
    const hash = createHash('sha256').update(content).digest();
    let base64 = Buffer.from(hash).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64;
  } else {
    throw new Error('Crypto API not available');
  }
}

export class TruthArchiveClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(options: TruthArchiveClientOptions) {
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey;
  }

  async search(query: string, limit: number = 10): Promise<SearchResult> {
    return this.request('/search', {
      method: 'POST',
      body: JSON.stringify({ query, limit })
    });
  }

  async addClaim(claim: Omit<Claim, 'id'>): Promise<Claim> {
    return this.request('/claims', {
      method: 'POST',
      body: JSON.stringify(claim)
    });
  }

  async getClaim(id: string): Promise<Claim> {
    return this.request(`/claims/${id}`);
  }

  async healthCheck(): Promise<any> {
    return this.request('/health');
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Truth Archive API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

export default TruthArchiveClient;


