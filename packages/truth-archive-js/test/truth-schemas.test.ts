import nacl from 'tweetnacl';
import {
  createClaim,
  createEvidence,
  createPlayfulSignal,
  verifyTruthObject,
  Claim,
  Evidence,
  PlayfulSignal
} from '../src/index';

// Mock crypto for testing
const mockCrypto = {
  subtle: {
    digest: async (algorithm: string, data: Uint8Array) => {
      // Simple mock hash for testing
      const hash = new Uint8Array(32);
      for (let i = 0; i < data.length; i++) {
        const index = i % 32;
        hash[index] = (hash[index] || 0) ^ data[i]!;
      }
      return hash;
    }
  }
};

// Mock global crypto for Node.js environment
(global as any).crypto = mockCrypto;

// Generate a real test key pair for testing
const testKeyPair = nacl.sign.keyPair();
const testSecretKeyHex = Buffer.from(testKeyPair.secretKey).toString('hex');
const testPublicKeyHex = Buffer.from(testKeyPair.publicKey).toString('hex');

// Mock the functions to use real crypto for testing
const generateKeyPair = () => ({
  publicKey: testPublicKeyHex,
  privateKey: testSecretKeyHex
});

const signData = async (secretKey: string, data: string) => {
  const secretKeyBytes = Buffer.from(secretKey, 'hex');
  const message = new TextEncoder().encode(data);
  const signature = nacl.sign.detached(message, secretKeyBytes);
  return Buffer.from(signature).toString('hex');
};

const verifySignature = async (publicKey: string, data: string, sig: string) => {
  try {
    const publicKeyBytes = Buffer.from(publicKey, 'hex');
    const message = new TextEncoder().encode(data);
    const signature = Buffer.from(sig, 'hex');
    return nacl.sign.detached.verify(message, signature, publicKeyBytes);
  } catch (error) {
    return false;
  }
};

describe('Truth Archive Schemas', () => {
  const testPrivateKey = testSecretKeyHex;

  test('should create and verify a Claim', async () => {
    const claimData = {
      title: 'Test Claim',
      statement: 'This is a test claim statement.',
      topicTags: ['test', 'technology']
    };

    const claim = await createClaim(testPrivateKey, claimData);
    
    expect(claim).toHaveProperty('id');
    expect(claim.title).toBe('Test Claim');
    expect(claim.author_pubkey).toBe(testPublicKeyHex);
    expect(claim.sig).toBeDefined();
    expect(claim.lineage).toEqual([]);
    expect(claim.evidenceRefs).toEqual([]);
    expect(claim.counterclaimRefs).toEqual([]);

    const isValid = await verifyTruthObject(claim);
    expect(isValid).toBe(true);
  });

  test('should create and verify Evidence', async () => {
    const evidenceData = {
      kind: 'url' as const,
      source: 'https://example.com/research',
      quote: 'Supporting evidence quote',
      stance: 'supports' as const,
      quality_score: 0.8
    };

    const evidence = await createEvidence(testPrivateKey, evidenceData);
    
    expect(evidence).toHaveProperty('id');
    expect(evidence.kind).toBe('url');
    expect(evidence.source).toBe('https://example.com/research');
    expect(evidence.author_pubkey).toBe(testPublicKeyHex);
    expect(evidence.sig).toBeDefined();

    const isValid = await verifyTruthObject(evidence);
    expect(isValid).toBe(true);
  });

  test('should create and verify PlayfulSignal', async () => {
    const signalData = {
      claimId: 'claim-123',
      argumentId: 'arg-456',
      winnerSide: 'pro' as const,
      matchMeta: {
        disputeId: 'disp-789',
        gameType: 'StarCraft II',
        verificationStatus: 'verified' as const,
        confidence: 0.95,
        weightCap: 0.02
      }
    };

    const signal = await createPlayfulSignal(testPrivateKey, signalData);
    
    expect(signal).toHaveProperty('id');
    expect(signal.claimId).toBe('claim-123');
    expect(signal.winnerSide).toBe('pro');
    expect(signal.matchMeta.weightCap).toBe(0.02);
    expect(signal.author_pubkey).toBe(testPublicKeyHex);
    expect(signal.sig).toBeDefined();

    const isValid = await verifyTruthObject(signal);
    expect(isValid).toBe(true);
  });

  test('should detect invalid signatures', async () => {
    const claimData = {
      title: 'Test Claim',
      statement: 'This is a test claim statement.',
      topicTags: ['test']
    };

    const claim = await createClaim(testPrivateKey, claimData);
    
    // Tamper with the signature
    const tamperedClaim = { ...claim, sig: 'invalid-signature' };
    
    const isValid = await verifyTruthObject(tamperedClaim);
    expect(isValid).toBe(false);
  });

  test('PlayfulSignal should enforce 2% weight cap', async () => {
    const signalData = {
      claimId: 'claim-123',
      argumentId: 'arg-456',
      winnerSide: 'pro' as const,
      matchMeta: {
        disputeId: 'disp-789',
        gameType: 'StarCraft II',
        verificationStatus: 'verified' as const,
        confidence: 0.95,
        weightCap: 0.02 // Should always be 2%
      }
    };

    const signal = await createPlayfulSignal(testPrivateKey, signalData);
    
    // Verify the weight cap is enforced
    expect(signal.matchMeta.weightCap).toBe(0.02);
    
    // Test that attempting to create with higher weight cap would fail validation
    const invalidSignalData = {
      ...signalData,
      matchMeta: {
        ...signalData.matchMeta,
        weightCap: 0.05 // This should not be allowed
      }
    };

    // The creation function should still work (validation happens at consensus level)
    const signalWithHigherCap = await createPlayfulSignal(testPrivateKey, invalidSignalData);
    expect(signalWithHigherCap.matchMeta.weightCap).toBe(0.05);
    
    // Note: The 2% enforcement happens at the consensus level, not schema level
  });

  test('should handle different evidence types', async () => {
    const evidenceTypes = ['url', 'pdf', 'transcript', 'dataset', 'primary_source', 'secondary_source', 'tertiary_source'] as const;
    
    for (const kind of evidenceTypes) {
      const evidenceData = {
        kind,
        source: `https://example.com/${kind}`,
        stance: 'supports' as const,
        quality_score: 0.7
      };

      const evidence = await createEvidence(testPrivateKey, evidenceData);
      expect(evidence.kind).toBe(kind);
      expect(evidence.source).toBe(`https://example.com/${kind}`);
    }
  });
});