import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const postId = Array.isArray(req.query.postId) ? req.query.postId[0] : req.query.postId;
    const bundleId = Array.isArray(req.query.bundleId) ? req.query.bundleId[0] : req.query.bundleId;
    
    if (!postId || !bundleId) {
      return res.status(400).json({ error: 'Missing postId or bundleId' });
    }
    
    try {
      // Fetch transparency data from indexer
      const url = `http://localhost:3002/algo/${encodeURIComponent(bundleId as string)}/why/${encodeURIComponent(postId as string)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching transparency data:', error);
      res.status(500).json({ error: 'Failed to fetch transparency data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;