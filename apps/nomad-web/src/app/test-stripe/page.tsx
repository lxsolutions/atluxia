

'use client';

import { useState } from 'react';

export default function TestStripePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const testPaymentIntent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 2000, // $20.00
          currency: 'usd',
          metadata: {
            test: 'true',
            product: 'test-payment'
          }
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Failed to create payment intent' });
    } finally {
      setLoading(false);
    }
  };

  const testCustomer = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test Customer',
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Failed to create customer' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Stripe Integration Test</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={testPaymentIntent} 
          disabled={loading}
          style={{ marginRight: '1rem', padding: '0.5rem 1rem' }}
        >
          Test Payment Intent
        </button>
        
        <button 
          onClick={testCustomer} 
          disabled={loading}
          style={{ padding: '0.5rem 1rem' }}
        >
          Test Customer Creation
        </button>
      </div>

      {loading && <p>Loading...</p>}
      
      {result && (
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h3>Result:</h3>
          <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

