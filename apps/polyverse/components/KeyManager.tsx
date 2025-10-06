

import { useState } from 'react';

// Simple key generation for demo purposes
const generateKeyPair = () => {
  // Generate random keys (in production, use proper crypto)
  const publicKey = 'pub_' + Math.random().toString(36).substring(2, 15);
  const privateKey = 'priv_' + Math.random().toString(36).substring(2, 15);
  return { publicKey, privateKey };
};

interface KeyPair {
  publicKey: string;
  privateKey: string;
  did: string;
}

const KeyManager = ({ onKeyChange }: { onKeyChange: (keys: KeyPair | null) => void }) => {
  const [keys, setKeys] = useState<KeyPair | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const generateNewKeys = () => {
    const keyPair = generateKeyPair();
    const did = `did:key:${keyPair.publicKey}`;
    const newKeys = { ...keyPair, did };
    setKeys(newKeys);
    onKeyChange(newKeys);
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('userKeys', JSON.stringify(newKeys));
    }
  };

  const importKeys = (privateKey: string) => {
    try {
      // For demo purposes, we'll generate a public key from private key
      // In production, this would use proper key derivation
      const keyPair = generateKeyPair(); // This generates new keys, but we'll use the imported private
      const did = `did:key:${keyPair.publicKey}`;
      const importedKeys = { publicKey: keyPair.publicKey, privateKey, did };
      setKeys(importedKeys);
      onKeyChange(importedKeys);
      if (typeof window !== 'undefined') {
        localStorage.setItem('userKeys', JSON.stringify(importedKeys));
      }
    } catch (error) {
      alert('Invalid private key format');
    }
  };

  const clearKeys = () => {
    setKeys(null);
    onKeyChange(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('userKeys');
    }

  };

  // Load keys from localStorage on component mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const storedKeys = localStorage.getItem('userKeys');
      if (storedKeys) {
        const parsedKeys = JSON.parse(storedKeys);
        setKeys(parsedKeys);
        onKeyChange(parsedKeys);
      }
    }
  });

  return (
    <div className="key-manager">
      <h3>Key Management</h3>
      
      {keys ? (
        <div className="keys-display">
          <p><strong>DID:</strong> {keys.did}</p>
          <p><strong>Public Key:</strong> {keys.publicKey}</p>
          <div className="private-key-section">
            <label>
              <input
                type="checkbox"
                checked={showPrivateKey}
                onChange={(e) => setShowPrivateKey(e.target.checked)}
              />
              Show Private Key
            </label>
            {showPrivateKey && (
              <p className="private-key-warning">
                <strong>Private Key (keep this secret!):</strong> {keys.privateKey}
              </p>
            )}
          </div>
          <button onClick={clearKeys} className="danger">
            Clear Keys
          </button>
        </div>
      ) : (
        <div className="key-setup">
          <div className="key-options">
            <button onClick={generateNewKeys} className="primary">
              Generate New Keys
            </button>
            <div className="import-section">
              <h4>Import Existing Keys</h4>
              <input
                type="password"
                placeholder="Enter private key"
                onChange={(e) => importKeys(e.target.value)}
                className="import-input"
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .key-manager {
          border: 1px solid #ccc;
          padding: 1rem;
          margin: 1rem 0;
          border-radius: 8px;
        }
        
        .keys-display p {
          margin: 0.5rem 0;
          word-break: break-all;
          font-family: monospace;
          font-size: 0.9rem;
        }
        
        .private-key-warning {
          color: #d32f2f;
          background: #ffebee;
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #ffcdd2;
        }
        
        .private-key-section {
          margin: 1rem 0;
        }
        
        .key-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        
        .primary {
          background: #1976d2;
          color: white;
        }
        
        .danger {
          background: #d32f2f;
          color: white;
        }
        
        .import-input {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          width: 100%;
          margin-top: 0.5rem;
        }
        
        .import-section h4 {
          margin: 0 0 0.5rem 0;
        }
      `}</style>
    </div>
  );
};

export default KeyManager;

