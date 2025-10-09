#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { 
  truthClaims, 
  confidenceReports, 
  playfulSignals
} from '../services/indexer/src/db/schema.js';
import { faker } from '@faker-js/faker';

// Database connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://polyverse:polyverse@localhost:5432/polyverse';
const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

// Sample truth claims with different confidence levels
const sampleTruthClaims = [
  {
    id: 'claim_climate_human_caused',
    title: 'Climate change is primarily caused by human activities',
    content: 'Scientific consensus indicates that human activities, particularly greenhouse gas emissions, are the dominant cause of observed climate change since the mid-20th century.',
    initial_confidence: 0.92,
    topic: 'climate_science',
    sources: ['https://www.ipcc.ch/report/ar6/wg1/', 'https://climate.nasa.gov/scientific-consensus/']
  },
  {
    id: 'claim_vaccines_effective',
    title: 'Vaccines are effective at preventing serious illness',
    content: 'Extensive clinical trials and real-world data demonstrate that vaccines are highly effective at preventing serious illness, hospitalization, and death from vaccine-preventable diseases.',
    initial_confidence: 0.95,
    topic: 'public_health',
    sources: ['https://www.who.int/health-topics/vaccines-and-immunization', 'https://www.cdc.gov/vaccines/index.html']
  },
  {
    id: 'claim_ai_impact_jobs',
    title: 'AI will significantly impact job markets',
    content: 'Artificial intelligence and automation are expected to transform job markets, with some roles being automated while new roles are created, requiring workforce adaptation and retraining.',
    initial_confidence: 0.85,
    topic: 'technology',
    sources: ['https://www.mckinsey.com/featured-insights/future-of-work', 'https://www.weforum.org/reports/the-future-of-jobs-report-2023/']
  }
];

// Note: Evidence and counterclaims would be stored as part of the claim content
// in a real implementation, but for this seed we focus on the core tables

// Sample confidence reports from different lenses
const sampleConfidenceReports = [
  {
    claim_id: 'claim_climate_human_caused',
    lens_id: 'bayesian_evidence_first',
    confidence_score: 0.92,
    calculation_inputs: {
      evidence_count: 42,
      evidence_quality_avg: 0.88,
      source_reliability: 0.95,
      consensus_strength: 0.97
    },
    transparency_record: {
      algorithm_version: '1.2.0',
      computation_timestamp: new Date().toISOString(),
      evidence_considered: 42,
      dissenting_views_included: true
    }
  },
  {
    claim_id: 'claim_climate_human_caused',
    lens_id: 'expert_jury',
    confidence_score: 0.94,
    calculation_inputs: {
      jury_size: 12,
      diversity_score: 0.89,
      calibration_score: 0.91,
      agreement_level: 0.96
    },
    transparency_record: {
      jury_composition: {
        clusters: ['Academic', 'CivilSociety', 'ICC', 'NonAligned'],
        expertise_range: [0.85, 0.98]
      },
      deliberation_process: 'blind_rubric'
    }
  }
];

// Sample playful signals from arena disputes
const samplePlayfulSignals = [
  {
    claim_id: 'claim_climate_human_caused',
    dispute_id: 'dispute_climate_debate_2024',
    winner_side: 'pro_human_cause',
    match_meta: {
      game: 'Climate Debate Simulator',
      duration_minutes: 45,
      participants: 4,
      skill_level: 'expert',
      verification_status: 'automated_verified'
    },
    weight_applied: 0.015,
    transparency_record: {
      arena_rules_version: '2.1.0',
      verification_method: 'automated_replay_analysis',
      max_weight_cap: 0.02,
      entertainment_grade: true
    }
  }
];

async function seedTruthData() {
  console.log('Starting truth data seeding...');

  try {
    // Clear existing truth data
    console.log('Clearing existing truth data...');
    await db.delete(playfulSignals);
    await db.delete(confidenceReports);
    await db.delete(truthClaims);

    // Insert truth claims
    console.log('Inserting truth claims...');
    for (const claim of sampleTruthClaims) {
      await db.insert(truthClaims).values({
        id: claim.id,
        title: claim.title,
        content: claim.content,
        initial_confidence: claim.initial_confidence,
        topic: claim.topic,
        sources: claim.sources,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Note: Evidence and counterclaims would be inserted here in a full implementation

    // Insert confidence reports
    console.log('Inserting confidence reports...');
    for (const report of sampleConfidenceReports) {
      await db.insert(confidenceReports).values({
        id: `report_${faker.string.uuid()}`,
        claim_id: report.claim_id,
        lens_id: report.lens_id,
        confidence_score: report.confidence_score,
        calculation_inputs: report.calculation_inputs,
        transparency_record: report.transparency_record,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Insert playful signals
    console.log('Inserting playful signals...');
    for (const signal of samplePlayfulSignals) {
      await db.insert(playfulSignals).values({
        id: `signal_${faker.string.uuid()}`,
        claim_id: signal.claim_id,
        dispute_id: signal.dispute_id,
        winner_side: signal.winner_side,
        match_meta: signal.match_meta,
        weight_applied: signal.weight_applied,
        transparency_record: signal.transparency_record,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    console.log('Truth data seeding completed successfully!');
    console.log(`\nSeed data includes:`);
    console.log(`- ${sampleTruthClaims.length} truth claims`);
    console.log(`- ${sampleConfidenceReports.length} confidence reports`);
    console.log(`- ${samplePlayfulSignals.length} playful signals`);
    console.log(`\nYou can now test:`);
    console.log(`- Truth graph queries and lineage`);
    console.log(`- Confidence report generation`);
    console.log(`- Playful signal integration`);
    console.log(`- Arena dispute resolution impact`);

  } catch (error) {
    console.error('Error seeding truth data:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTruthData();
}

export { seedTruthData };