#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { events, authors, wikiPages, wikiRevisions, wikiTalkPosts, notes } from '../services/indexer/src/db/schema.js';
import { faker } from '@faker-js/faker';
import { signEvent } from '../packages/pvp-sdk-js/dist/index.js';
import { seedTruthData } from './seed-truth.js';
import { seedTributeData } from './seed-tribute.js';

// Database connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://polyverse:polyverse@localhost:5432/polyverse';
const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

// Mock keypairs for seed authors
const seedAuthors = [
  {
    did: 'did:example:alice',
    name: 'Alice Johnson',
    bio: 'Technology enthusiast and open source advocate',
    followers_count: 1250,
    posts_count: 42,
    reputation_score: 85,
    is_verified: true,
    keypair: { publicKey: 'alice_pubkey', privateKey: 'alice_privkey' }
  },
  {
    did: 'did:example:bob',
    name: 'Bob Smith',
    bio: 'Science communicator and educator',
    followers_count: 890,
    posts_count: 28,
    reputation_score: 78,
    is_verified: false,
    keypair: { publicKey: 'bob_pubkey', privateKey: 'bob_privkey' }
  },
  {
    did: 'did:example:carol',
    name: 'Carol Davis',
    bio: 'Policy analyst and governance expert',
    followers_count: 2100,
    posts_count: 67,
    reputation_score: 92,
    is_verified: true,
    keypair: { publicKey: 'carol_pubkey', privateKey: 'carol_privkey' }
  }
];

// Sample posts with different clusters for diversity testing
const samplePosts = [
  {
    content: 'Just published my research on federated social networks! The future is decentralized. #Web3 #Fediverse',
    cluster: 'tech'
  },
  {
    content: 'Climate change requires global cooperation. We need to work together across all nations to address this crisis. #ClimateAction #UN',
    cluster: 'global'
  },
  {
    content: 'Local communities are the backbone of society. Supporting small businesses and neighborhood initiatives matters! #LocalFirst #Community',
    cluster: 'local'
  },
  {
    content: 'The multipolar world order is emerging. Different perspectives and approaches can coexist and enrich global discourse. #Multipolarity #Diversity',
    cluster: 'diverse'
  },
  {
    content: 'Open source software drives innovation. Contributing to public goods benefits everyone. #OpenSource #Collaboration',
    cluster: 'tech'
  }
];

// Sample wiki pages
const sampleWikiPages = [
  {
    slug: 'federated-social-networks',
    title: 'Federated Social Networks',
    content: `Federated social networks are decentralized platforms where multiple independent servers (instances) can communicate with each other.

## Key Features
- Decentralized architecture
- Interoperability between instances
- User control over data
- Resilience to single points of failure

## Examples
- Mastodon
- Matrix
- Bluesky

## Benefits
Federated networks promote free speech while allowing communities to set their own moderation standards.`
  },
  {
    slug: 'multipolar-diversity',
    title: 'Multipolar Diversity in Information Ecosystems',
    content: `Multipolar diversity refers to the presence of multiple distinct perspectives and information sources in a system.

## Importance
- Prevents information monocultures
- Encourages critical thinking
- Fosters innovation through diverse viewpoints
- Builds resilience against manipulation

## Implementation
In ranking algorithms, multipolar diversity can be measured and promoted through:
- Source cluster analysis
- Viewpoint diversity metrics
- Cross-cultural content promotion`
  }
];

async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await db.delete(wikiTalkPosts);
    await db.delete(wikiRevisions);
    await db.delete(wikiPages);
    await db.delete(notes);
    await db.delete(events);
    await db.delete(authors);

    // Insert authors
    console.log('Inserting authors...');
    for (const author of seedAuthors) {
      await db.insert(authors).values({
        did: author.did,
        name: author.name,
        bio: author.bio,
        followers_count: author.followers_count,
        posts_count: author.posts_count,
        reputation_score: author.reputation_score,
        is_verified: author.is_verified
      });
    }

    // Insert events (posts)
    console.log('Inserting posts...');
    for (let i = 0; i < 20; i++) {
      const author = seedAuthors[i % seedAuthors.length];
      const post = samplePosts[i % samplePosts.length];
      
      const eventData = {
        id: `event_${i}`,
        kind: 'Post',
        author_did: author.did,
        signature: `sig_${i}`,
        created_at: new Date(Date.now() - i * 3600000), // Stagger timestamps
        content: post.content,
        refs: []
      };

      await db.insert(events).values(eventData);
    }

    // Insert sample notes
    console.log('Inserting community notes...');
    const sampleNotes = [
      {
        subject_event_id: 'event_0',
        note_type: 'fact_check',
        content: 'This research paper has been peer-reviewed and published in a reputable journal.',
        citations: ['https://example.com/research-paper'],
        confidence: 'high'
      },
      {
        subject_event_id: 'event_1', 
        note_type: 'context',
        content: 'The IPCC report referenced here represents the scientific consensus on climate change.',
        citations: ['https://www.ipcc.ch/report/ar6/syr/'],
        confidence: 'high'
      },
      {
        subject_event_id: 'event_2',
        note_type: 'warning',
        content: 'While supporting local businesses is important, this post may oversimplify complex economic factors.',
        citations: [],
        confidence: 'medium'
      }
    ];

    for (let i = 0; i < sampleNotes.length; i++) {
      const note = sampleNotes[i];
      const author = seedAuthors[i % seedAuthors.length];
      
      await db.insert(notes).values({
        id: `note_${i}`,
        subject_event_id: note.subject_event_id,
        author_did: author.did,
        note_type: note.note_type,
        content: note.content,
        citations: note.citations,
        confidence: note.confidence,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Insert wiki pages
    console.log('Inserting wiki pages...');
    for (const wikiPage of sampleWikiPages) {
      const pageId = `wiki_${faker.string.uuid()}`;
      
      await db.insert(wikiPages).values({
        id: pageId,
        slug: wikiPage.slug,
        title: wikiPage.title,
        content: wikiPage.content,
        latest_revision_id: `rev_${faker.string.uuid()}`
      });

      // Insert initial revision
      await db.insert(wikiRevisions).values({
        id: `rev_${faker.string.uuid()}`,
        page_id: pageId,
        author_did: seedAuthors[0].did,
        content: wikiPage.content,
        diff: 'Initial creation',
        citations: [
          {
            url: 'https://en.wikipedia.org/wiki/Fediverse',
            title: 'Fediverse - Wikipedia',
            quote: 'The fediverse is an ensemble of federated servers that are used for web publishing and social networking.',
            accessedAt: new Date().toISOString()
          }
        ]
      });
    }

    // Insert some wiki talk posts
    console.log('Inserting wiki talk posts...');
    const pages = await db.select().from(wikiPages);
    for (const page of pages) {
      for (let i = 0; i < 3; i++) {
        const author = seedAuthors[i % seedAuthors.length];
        await db.insert(wikiTalkPosts).values({
          id: `talk_${faker.string.uuid()}`,
          page_id: page.id,
          author_did: author.did,
          content: faker.lorem.paragraph(),
          parent_id: i > 0 ? `talk_${faker.string.uuid()}` : undefined
        });
      }
    }

    console.log('Database seeding completed successfully!');
    console.log(`\nSeed data includes:`);
    console.log(`- ${seedAuthors.length} authors`);
    console.log(`- 20 posts with diverse content clusters`);
    console.log(`- ${sampleNotes.length} community notes`);
    console.log(`- ${sampleWikiPages.length} wiki pages with revisions`);
    console.log(`- Wiki talk discussions`);
    
    // Seed truth data
    console.log('\nSeeding truth data...');
    await seedTruthData();
    
    // Seed tribute data
    console.log('\nSeeding tribute data...');
    await seedTributeData();
    
    console.log(`\nYou can now test:`);
    console.log(`- Home feed with diverse content`);
    console.log(`- Multipolar diversity ranking`);
    console.log(`- Wiki page editing and citations`);
    console.log(`- Truth Agent queries`);
    console.log(`- Truth claims with evidence and confidence reports`);
    console.log(`- Arena disputes linked to truth claims`);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };