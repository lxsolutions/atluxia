





import * as tweetnacl from 'tweetnacl';

/**
 * Generate Ed25519 key pair
 */
export function generateKeyPair(): {
  publicKey: string;
  privateKey: string;
} {
  const keyPair = tweetnacl.sign.keyPair();
  return {
    publicKey: uint8ArrayToBase64(keyPair.publicKey),
    privateKey: uint8ArrayToBase64(keyPair.secretKey)
  };
}

/**
 * Sign data with Ed25519 private key
 */
export async function signData(privateKey: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const signature = tweetnacl.sign.detached(encodedData, base64ToUint8Array(privateKey));
  return uint8ArrayToBase64(signature);
}

/**
 * Verify Ed25519 signature
 */
export async function verifySignature(
  publicKey: string,
  data: string,
  signature: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  return tweetnacl.sign.detached.verify(encodedData, base64ToUint8Array(signature), base64ToUint8Array(publicKey));
}

// Helper functions for key format conversion

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  // Node.js compatible version
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(uint8Array).toString('base64');
  } else {
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }
}

function base64ToUint8Array(base64: string): Uint8Array {
  // Node.js compatible version
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  } else {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}

function base64ToHex(base64: string): string {
  if (typeof Buffer !== 'undefined') {
    const buffer = Buffer.from(base64, 'base64');
    let hex = '';
    for (const byte of buffer) {
      hex += ('0' + byte.toString(16)).slice(-2);
    }
    return hex;
  } else {
    const bytes = base64ToUint8Array(atob(base64));
    let hex = '';
    for (const byte of bytes) {
      hex += ('0' + byte.toString(16)).slice(-2);
    }
    return hex;
  }
}

function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(Math.ceil(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}





