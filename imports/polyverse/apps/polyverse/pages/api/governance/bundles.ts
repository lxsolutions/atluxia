import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      // Fetch bundles from indexer
      const response = await fetch('http://localhost:3002/governance/bundles');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching bundles:', error);
      
      // Fallback to local bundles if indexer is unavailable
      const fallbackBundles = [
        {
          id: "recency_follow",
          name: "Recency + Follows",
          description: "Prioritizes recent content from accounts you follow",
          version: "1.0.0",
          author: "PolyVerse Team"
        },
        {
          id: "multipolar_diversity",
          name: "Multipolar Diversity",
          description: "Promotes diverse viewpoints across geopolitical clusters",
          version: "1.0.0",
          author: "PolyVerse Team"
        },
        {
          id: "locality_first",
          name: "Locality First",
          description: "Prioritizes content from users in your selected locales",
          version: "0.9.0",
          author: "PolyVerse Team"
        },
        {
          id: "baseline_rules",
          name: "Baseline Moderation",
          description: "Basic content moderation enforcing platform rules",
          version: "1.0.0",
          author: "PolyVerse Team"
        }
      ];
      
      res.status(200).json(fallbackBundles);
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;