












// Use relative imports for testing
import { generateKeyPair, signData, verifySignature } from '../src/crypto.js';
import { createPostEvent, signEvent, verifyEvent } from '../src/event.js';

// Import chai assertions
import { expect } from 'chai';

describe('PVP SDK Signing Tests', () => {
  it('should generate key pairs correctly', async () => {
    const keys = generateKeyPair();
    console.log('Generated public key:', keys.publicKey);
    console.log('Generated private key:', keys.privateKey);

    expect(keys.publicKey).to.be.a('string').that.is.not.empty;
    expect(keys.privateKey).to.be.a('string').that.is.not.empty;
  });

  it('should sign and verify data', async () => {
    const testData = 'Hello, PolyVerse!';
    const { publicKey, privateKey } = generateKeyPair();

    const signature = await signData(privateKey, testData);
    console.log('Generated signature:', signature);

    const isValid = await verifySignature(publicKey, testData, signature);
    expect(isValid).to.be.true;
  });

  it('should create and sign events', async () => {
    const { publicKey, privateKey } = generateKeyPair();
    const unsignedEvent = createPostEvent('did:key:test_user', 'Test post content');

    console.log('Unsigned event:', JSON.stringify(unsignedEvent, null, 2));

    const signedEvent = await signEvent(unsignedEvent, privateKey);
    console.log('Signed event:', JSON.stringify(signedEvent, null, 2));

    expect(signedEvent.id).to.be.a('string').that.is.not.empty;
    expect(signedEvent.sig).to.be.a('string').that.is.not.empty;

    // Verify the signature
    const isValid = await verifyEvent(signedEvent, publicKey);
    expect(isValid).to.be.true;

    console.log('Signature verification:', isValid ? '✅ Valid' : '❌ Invalid');
  });
});





