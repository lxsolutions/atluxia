import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query;

  if (req.method === 'GET') {
    try {
      const response = await fetch(`http://localhost:3001/wiki/${slug}`);
      
      if (response.ok) {
        const data = await response.json();
        res.status(200).json(data);
      } else if (response.status === 404) {
        res.status(404).json({ error: 'Wiki page not found' });
      } else {
        res.status(response.status).json({ error: 'Failed to fetch wiki page' });
      }
    } catch (error) {
      console.error('Error fetching wiki page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, content, authorDid, citations } = req.body;
      
      const response = await fetch(`http://localhost:3001/wiki/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, authorDid, citations })
      });

      if (response.ok) {
        const data = await response.json();
        res.status(200).json(data);
      } else {
        const errorData = await response.json();
        res.status(response.status).json(errorData);
      }
    } catch (error) {
      console.error('Error updating wiki page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;