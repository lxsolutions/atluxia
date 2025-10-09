





import { NextApiRequest, NextApiResponse } from 'next';

// Simple event creation for demo purposes
const createEvent = (kind: string, author: string, body: any) => {
  return {
    id: '', // Will be set after signing
    kind,
    created_at: Math.floor(Date.now() / 1000),
    author,
    body,
    refs: [],
    sig: ''
  };
};

// Simple signing for demo purposes (in production, use proper crypto)
const signEvent = async (event: any, privateKey: string) => {
  // For demo, just create a mock signature
  const eventWithId = {
    ...event,
    id: 'event_' + Math.random().toString(36).substring(2, 15),
    sig: 'sig_' + Math.random().toString(36).substring(2, 15)
  };
  return eventWithId;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { content, privateKey, did, mediaId } = req.body;

    try {
      if (!privateKey || !did) {
        return res.status(400).json({ error: "Missing private key or DID" });
      }

      // Create and sign the event
      const unsignedEvent = createEvent("post", did, {
        text: content,
        mediaId: mediaId || null
      });

      const signedEvent = await signEvent(unsignedEvent, privateKey);

      console.log('Created signed event:', signedEvent);

      const response = await fetch('http://localhost:8080/pvp/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signedEvent)
      });

      if (response.ok) {
        const data = await response.json();
        res.status(201).json({ status: "Post created", event_id: data.event_id });
      } else {
        const errorData = await response.json();
        console.error('Relay error:', errorData);
        res.status(response.status).json(errorData);
      }
    } catch (error) {
      console.error("Error posting event:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;




