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
        // Get specific claim
        const response = await fetch(`${TRUTH_GRAPH_URL}/api/v1/claims/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            return res.status(404).json({ error: 'Claim not found' });
          }
          throw new Error(`Truth graph service responded with status: ${response.status}`);
        }

        const claim = await response.json();
        res.status(200).json(claim);
        break;

      case 'PUT':
        // Update claim
        const updateResponse = await fetch(`${TRUTH_GRAPH_URL}/api/v1/claims/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req.body),
        });

        if (!updateResponse.ok) {
          throw new Error(`Truth graph service responded with status: ${updateResponse.status}`);
        }

        const updatedClaim = await updateResponse.json();
        res.status(200).json(updatedClaim);
        break;

      case 'DELETE':
        // Delete claim
        const deleteResponse = await fetch(`${TRUTH_GRAPH_URL}/api/v1/claims/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!deleteResponse.ok) {
          throw new Error(`Truth graph service responded with status: ${deleteResponse.status}`);
        }

        res.status(204).end();
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
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