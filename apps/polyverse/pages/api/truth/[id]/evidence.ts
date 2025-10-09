import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const { id } = query;
  const TRUTH_GRAPH_URL = process.env.NEXT_PUBLIC_TRUTH_GRAPH_URL || 'http://localhost:3003';

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid claim ID' });
  }

  try {
    switch (method) {
      case 'GET':
        // Get evidence for claim
        const response = await fetch(`${TRUTH_GRAPH_URL}/api/v1/claims/${id}/evidence`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Truth graph service responded with status: ${response.status}`);
        }

        const evidence = await response.json();
        res.status(200).json(evidence);
        break;

      case 'POST':
        // Add evidence to claim
        const createResponse = await fetch(`${TRUTH_GRAPH_URL}/api/v1/claims/${id}/evidence`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req.body),
        });

        if (!createResponse.ok) {
          throw new Error(`Truth graph service responded with status: ${createResponse.status}`);
        }

        const newEvidence = await createResponse.json();
        res.status(201).json(newEvidence);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in truth evidence API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}