import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: 'Invalid media ID' });
    }

    // Call media service to get metadata
    const mediaServiceResponse = await fetch(`http://media:3006/media/${id}/meta`);

    if (!mediaServiceResponse.ok) {
      const error = await mediaServiceResponse.text();
      return res.status(mediaServiceResponse.status).json({ error });
    }

    const metadata = await mediaServiceResponse.json();
    res.status(200).json(metadata);
  } catch (error) {
    console.error('Media metadata error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}