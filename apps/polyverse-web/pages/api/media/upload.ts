import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, contentType, fileSize } = req.body;

    // Validate request
    if (!filename || !contentType || !fileSize) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Call media service to get presigned URL
    const mediaServiceResponse = await fetch('http://media:3006/media/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        contentType,
        fileSize,
      }),
    });

    if (!mediaServiceResponse.ok) {
      const error = await mediaServiceResponse.text();
      return res.status(mediaServiceResponse.status).json({ error });
    }

    const result = await mediaServiceResponse.json();
    res.status(200).json(result);
  } catch (error) {
    console.error('Media upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}