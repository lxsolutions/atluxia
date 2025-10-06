import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const TRUTH_GRAPH_URL = process.env.NEXT_PUBLIC_TRUTH_GRAPH_URL || 'http://localhost:3003';

  try {
    switch (method) {
      case 'GET':
        // Get claims list
        const response = await fetch(`${TRUTH_GRAPH_URL}/api/v1/claims`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Truth graph service responded with status: ${response.status}`);
        }

        const claims = await response.json();
        res.status(200).json(claims);
        break;

      case 'POST':
        // Create new claim
        const createResponse = await fetch(`${TRUTH_GRAPH_URL}/api/v1/claims`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req.body),
        });

        if (!createResponse.ok) {
          throw new Error(`Truth graph service responded with status: ${createResponse.status}`);
        }

        const newClaim = await createResponse.json();
        res.status(201).json(newClaim);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in truth API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}