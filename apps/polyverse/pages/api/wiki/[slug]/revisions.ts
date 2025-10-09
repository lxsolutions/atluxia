import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query;

  if (req.method === 'GET') {
    try {
      const response = await fetch(`http://localhost:3001/wiki/${slug}/revisions`);
      
      if (response.ok) {
        const data = await response.json();
        res.status(200).json(data);
      } else if (response.status === 404) {
        res.status(404).json({ error: 'Wiki page not found' });
      } else {
        res.status(response.status).json({ error: 'Failed to fetch revisions' });
      }
    } catch (error) {
      console.error('Error fetching wiki revisions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;