import { FastifyInstance } from 'fastify';
import { and, eq, desc } from 'drizzle-orm';
import { Client } from '@opensearch-project/opensearch';
import { db } from '../db/index.js';
import { wikiPages, wikiRevisions, wikiTalkPosts, authors } from '../db/schema.js';
import { z } from 'zod';
import { moderateWikiContent } from '../moderation/wiki.js';

export default async function wikiRoutes(fastify: FastifyInstance) {
  const OPENSEARCH_HOST = process.env.OPENSEARCH_HOST || 'http://localhost:9200';
  const osClient = new Client({
    node: OPENSEARCH_HOST,
  });
  // Get wiki page by slug
  fastify.get('/wiki/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    
    const page = await db.query.wikiPages.findFirst({
      where: eq(wikiPages.slug, slug),
      with: {
        revisions: {
          orderBy: desc(wikiRevisions.created_at),
          limit: 1,
          with: {
            author: true
          }
        }
      }
    });

    if (!page) {
      return reply.status(404).send({ error: 'Wiki page not found' });
    }

    const pageWithContent = page as any;
    const revisions = pageWithContent.revisions || [];
    return {
      ...pageWithContent,
      content: revisions[0]?.content || pageWithContent.content,
      latestRevision: revisions[0]
    };
  });

  // Get wiki page revisions
  fastify.get('/wiki/:slug/revisions', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    
    const page = await db.query.wikiPages.findFirst({
      where: eq(wikiPages.slug, slug),
      with: {
        revisions: {
          orderBy: desc(wikiRevisions.created_at),
          with: {
            author: true
          }
        }
      }
    });

    if (!page) {
      return reply.status(404).send({ error: 'Wiki page not found' });
    }

    return page.revisions;
  });

  // Get specific revision
  fastify.get('/wiki/:slug/revisions/:revisionId', async (request, reply) => {
    const { slug, revisionId } = request.params as { slug: string; revisionId: string };
    
    const revision = await db.query.wikiRevisions.findFirst({
      where: and(
        eq(wikiRevisions.id, revisionId),
        eq(wikiPages.slug, slug)
      ),
      with: {
        author: true,
        page: true
      }
    });

    if (!revision) {
      return reply.status(404).send({ error: 'Revision not found' });
    }

    return revision;
  });

  // Create or update wiki page
  fastify.post('/wiki/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const { title, content, citations, authorDid } = request.body as any;

    let page = await db.query.wikiPages.findFirst({
      where: eq(wikiPages.slug, slug)
    });

    const oldContent = page?.content || '';

    // Check content moderation
    const moderationResult = moderateWikiContent(content, title);
    
    if (!page) {
      // Create new page
      const newPage = await db.insert(wikiPages).values({
        id: `wiki_${Date.now()}`,
        slug,
        title,
        content,
        moderation_status: moderationResult.status
      }).returning();
      
      page = newPage[0];
    } else {
      // Update existing page
      await db.update(wikiPages)
        .set({ 
          title, 
          content, 
          updated_at: new Date(),
          moderation_status: moderationResult.status
        })
        .where(eq(wikiPages.id, page.id));
    }

    // Create revision
    const revision = await db.insert(wikiRevisions).values({
      id: `rev_${Date.now()}`,
      page_id: page!.id,
      author_did: authorDid,
      content,
      citations,
      diff: page!.content ? generateDiff(oldContent, content) : 'Initial version'
    }).returning();

    // Update page with latest revision
    if (revision[0]) {
      await db.update(wikiPages)
        .set({ latest_revision_id: revision[0].id })
        .where(eq(wikiPages.id, page!.id));
    }

    // Create PVP wiki_edit event
    try {
      const wikiEditEvent = {
        id: `wiki_edit_${Date.now()}`,
        kind: 'wiki_edit',
        created_at: Math.floor(Date.now() / 1000),
        author_did: authorDid,
        body: {
          slug: slug,
          title: title,
          content: content,
          previous_version: oldContent,
          change_summary: `Updated content from ${oldContent.length} to ${content.length} characters`
        },
        refs: {},
        sig: 'demo_signature' // For demo purposes - in production, use proper signing
      };

      // Send to relay
      const relayResponse = await fetch('http://localhost:8080/pvp/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wikiEditEvent)
      });

      if (!relayResponse.ok) {
        console.warn('Failed to send wiki_edit event to relay:', await relayResponse.text());
      }
    } catch (error) {
      console.error('Error creating PVP wiki_edit event:', error);
      // Don't fail the wiki edit if event creation fails
    }

    // Index in OpenSearch
    try {
      await osClient.index({
        index: 'wiki_pages',
        id: page!.id,
        body: {
          id: page!.id,
          slug: page!.slug,
          title: page!.title,
          content: page!.content,
          created_at: page!.created_at,
          updated_at: new Date(),
          author_did: authorDid
        }
      });
    } catch (error) {
      console.error('Failed to index wiki page in OpenSearch:', error);
    }

    return { page, revision: revision[0] };
  });

  // Get talk posts for wiki page
  fastify.get('/wiki/:slug/talk', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    
    const page = await db.query.wikiPages.findFirst({
      where: eq(wikiPages.slug, slug)
    });

    if (!page) {
      return reply.status(404).send({ error: 'Wiki page not found' });
    }

    const talkPosts = await db.query.wikiTalkPosts.findMany({
      where: eq(wikiTalkPosts.page_id, page.id),
      orderBy: desc(wikiTalkPosts.created_at),
      with: {
        author: true
      }
    });

    return talkPosts;
  });

  // Create talk post
  fastify.post('/wiki/:slug/talk', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const { content, authorDid, parentId } = request.body as any;

    const page = await db.query.wikiPages.findFirst({
      where: eq(wikiPages.slug, slug)
    });

    if (!page) {
      return reply.status(404).send({ error: 'Wiki page not found' });
    }

    const talkPost = await db.insert(wikiTalkPosts).values({
      id: `talk_${Date.now()}`,
      page_id: page.id,
      author_did: authorDid,
      content,
      parent_id: parentId
    }).returning();

    return talkPost[0];
  });

  // Search wiki pages
  fastify.get('/wiki-search', async (request, reply) => {
    const { q } = request.query as { q: string };
    
    // Use OpenSearch for full-text search
    const searchResults = await osClient.search({
      index: 'wiki_pages',
      body: {
        query: {
          multi_match: {
            query: q,
            fields: ['title^3', 'content', 'slug']
          }
        }
      }
    });

    return searchResults.body.hits.hits.map((hit: any) => hit._source);
  });
}

// Simple diff generation for demo purposes
function generateDiff(oldContent: string, newContent: string): string {
  if (oldContent === newContent) return 'No changes';
  
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  
  let diff = '';
  for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
    if (i >= oldLines.length) {
      diff += `+ ${newLines[i]}\n`;
    } else if (i >= newLines.length) {
      diff += `- ${oldLines[i]}\n`;
    } else if (oldLines[i] !== newLines[i]) {
      diff += `- ${oldLines[i]}\n`;
      diff += `+ ${newLines[i]}\n`;
    } else {
      diff += `  ${oldLines[i]}\n`;
    }
  }
  
  return diff;
}