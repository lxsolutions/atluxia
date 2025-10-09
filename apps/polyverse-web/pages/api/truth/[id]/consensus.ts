import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const { id } = query;
  const CONSENSUS_URL = process.env.NEXT_PUBLIC_CONSENSUS_URL || 'http://localhost:3005';

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid claim ID' });
  }

  try {
    switch (method) {
      case 'GET':
        // Get consensus reports for claim
        const response = await fetch(`${CONSENSUS_URL}/api/v1/consensus/claim/${id}/reports`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Consensus service responded with status: ${response.status}`);
        }

        const reports = await response.json();
        res.status(200).json(reports);
        break;

      case 'POST':
        // Run consensus analysis
        const { lensId } = req.body;
        if (!lensId) {
          return res.status(400).json({ error: 'lensId is required' });
        }

        const runResponse = await fetch(`${CONSENSUS_URL}/api/v1/consensus/run`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            claimId: id,
            lensId,
          }),
        });

        if (!runResponse.ok) {
          throw new Error(`Consensus service responded with status: ${runResponse.status}`);
        }

        const result = await runResponse.json();
        res.status(200).json(result);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in truth consensus API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}