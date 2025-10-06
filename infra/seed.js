






import fetch from 'node-fetch';

async function seedDemoData() {
  console.log("Seeding demo data...");

  // Create some demo users
  const demoUsers = [
    { did: "did:key:user1", name: "Alice" },
    { did: "did:key:user2", name: "Bob" },
    { did: "did:key:user3", name: "Charlie" }
  ];

  // Create some demo posts
  const demoPosts = [
    {
      kind: "post",
      created_at: Date.now(),
      author_did: "did:key:user1",
      body: { text: "Hello world! This is my first post on PolyVerse." },
      refs: []
    },
    {
      kind: "post",
      created_at: Date.now() - 3600000, // 1 hour ago
      author_did: "did:key:user2",
      body: { text: "Check out this cool project I'm working on!" },
      refs: []
    },
    {
      kind: "post",
      created_at: Date.now() - 7200000, // 2 hours ago
      author_did: "did:key:user3",
      body: { text: "PolyVerse is amazing! Decentralized social networks for the win." },
      refs: []
    }
  ];

  try {
    console.log("Creating demo posts...");

    for (const post of demoPosts) {
      const response = await fetch('http://localhost:3010/pvp/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      });

      if (!response.ok) {
        console.error(`Failed to create post: ${await response.text()}`);
      } else {
        const result = await response.json();
        console.log(`Created post with ID: ${result.event_id}`);
      }
    }

    console.log("Demo data seeding complete!");

  } catch (error) {
    console.error("Error seeding demo data:", error);
  }
}

seedDemoData();

