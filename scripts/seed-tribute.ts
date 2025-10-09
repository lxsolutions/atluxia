#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker';

// Database connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://polyverse:polyverse@localhost:5432/polyverse';
const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

// Sample games for disputes
const sampleGames = [
  {
    id: 1,
    name: 'StarCraft II',
    slug: 'starcraft-ii',
    description: 'Real-time strategy game with deep tactical gameplay',
    min_players: 2,
    max_players: 2,
    default_entry_fee: 10.00
  },
  {
    id: 2,
    name: 'Age of Empires II',
    slug: 'age-of-empires-ii',
    description: 'Classic historical real-time strategy game',
    min_players: 2,
    max_players: 8,
    default_entry_fee: 5.00
  },
  {
    id: 3,
    name: 'Supreme Commander: Forged Alliance',
    slug: 'supreme-commander',
    description: 'Large-scale strategic warfare simulation',
    min_players: 2,
    max_players: 8,
    default_entry_fee: 7.50
  }
];

// Sample game variants
const sampleGameVariants = [
  {
    id: 1,
    game_id: 1,
    name: '1v1 Ladder',
    description: 'Standard competitive 1v1 format'
  },
  {
    id: 2,
    game_id: 2,
    name: 'Random Map',
    description: 'Classic random map gameplay'
  },
  {
    id: 3,
    game_id: 3,
    name: 'Supreme Warfare',
    description: 'Large-scale team battles'
  }
];

// Sample users (challengers and opponents)
const sampleUsers = [
  {
    id: 1,
    username: 'pro_gamer_1',
    email: 'pro1@example.com',
    display_name: 'Pro Gamer One',
    skill_level: 'expert'
  },
  {
    id: 2,
    username: 'strategist_2',
    email: 'strat2@example.com',
    display_name: 'Master Strategist',
    skill_level: 'expert'
  },
  {
    id: 3,
    username: 'new_challenger',
    email: 'new@example.com',
    display_name: 'Rising Star',
    skill_level: 'intermediate'
  },
  {
    id: 4,
    username: 'veteran_player',
    email: 'vet@example.com',
    display_name: 'Seasoned Veteran',
    skill_level: 'advanced'
  }
];

// Sample disputes linked to truth claims
const sampleDisputes = [
  {
    title: 'Climate Change Debate: Human Impact vs Natural Cycles',
    description: 'Strategic debate on the primary causes of climate change',
    game_id: 1,
    game_variant_id: 1,
    challenger_id: 1,
    opponent_id: 2,
    challenger_side: 'pro_human_cause',
    opponent_side: 'pro_natural_cycles',
    entry_fee: 25.00,
    payment_method: 'stripe',
    currency: 'USD',
    status: 'completed',
    truth_claim_id: 'claim_climate_human_caused',
    winner_id: 1,
    winner_proof_url: 'https://example.com/replays/climate_debate_2024.sc2replay',
    winner_proof_verified: true,
    playful_signal_emitted: true,
    playful_signal_strength: 0.015,
    payout_processed: true
  },
  {
    title: 'Vaccine Efficacy Strategic Analysis',
    description: 'Tactical analysis of vaccine effectiveness data',
    game_id: 2,
    game_variant_id: 2,
    challenger_id: 3,
    opponent_id: 4,
    challenger_side: 'pro_vaccine_efficacy',
    opponent_side: 'vaccine_skeptic',
    entry_fee: 15.00,
    payment_method: 'stripe',
    currency: 'USD',
    status: 'in_progress',
    truth_claim_id: 'claim_vaccines_effective',
    is_streamed: true,
    stream_url: 'https://twitch.tv/example_stream'
  },
  {
    title: 'AI Job Market Impact Simulation',
    description: 'Economic simulation of AI impact on employment',
    game_id: 3,
    game_variant_id: 3,
    challenger_id: 2,
    opponent_id: 1,
    challenger_side: 'ai_job_displacement',
    opponent_side: 'ai_job_creation',
    entry_fee: 20.00,
    payment_method: 'crypto',
    currency: 'USDC',
    status: 'pending',
    truth_claim_id: 'claim_ai_impact_jobs'
  }
];

// Sample match history
const sampleMatchHistory = [
  {
    dispute_id: 1,
    winner_id: 1,
    score: '3-1',
    replay_url: 'https://example.com/replays/climate_debate_match1.sc2replay',
    screenshot_url: 'https://example.com/screenshots/climate_victory.png',
    notes: 'Superior economic management and tech timing'
  }
];

// Sample argument history
const sampleArgumentHistory = [
  {
    argument_name: 'Climate Change: Human vs Natural',
    game_id: 1,
    side_a_name: 'Human Activity Primary',
    side_b_name: 'Natural Cycles Primary',
    side_a_wins: 8,
    side_b_wins: 3,
    total_matches: 11
  },
  {
    argument_name: 'Vaccine Efficacy Debate',
    game_id: 2,
    side_a_name: 'Vaccines Effective',
    side_b_name: 'Vaccine Skeptic',
    side_a_wins: 15,
    side_b_wins: 2,
    total_matches: 17
  }
];

// Sample leaderboards
const sampleLeaderboards = [
  {
    user_id: 1,
    game_id: 1,
    rank: 1,
    wins: 12,
    losses: 3,
    win_rate: 80.0,
    total_tribute: 300.00,
    current_streak: 5,
    longest_streak: 8,
    elo_rating: 1850
  },
  {
    user_id: 2,
    game_id: 1,
    rank: 2,
    wins: 10,
    losses: 5,
    win_rate: 66.7,
    total_tribute: 250.00,
    current_streak: 3,
    longest_streak: 6,
    elo_rating: 1720
  }
];

async function seedTributeData() {
  console.log('Starting Tribute Battles data seeding...');

  try {
    // Note: We assume the games-api tables are in the same database
    // In a real implementation, we would use the games-api service directly
    
    console.log('Seeding would insert:');
    console.log(`- ${sampleGames.length} games`);
    console.log(`- ${sampleGameVariants.length} game variants`);
    console.log(`- ${sampleUsers.length} users`);
    console.log(`- ${sampleDisputes.length} disputes`);
    console.log(`- ${sampleMatchHistory.length} match history records`);
    console.log(`- ${sampleArgumentHistory.length} argument history records`);
    console.log(`- ${sampleLeaderboards.length} leaderboard entries`);
    
    console.log('\nDisputes are linked to truth claims:');
    sampleDisputes.forEach(dispute => {
      console.log(`- "${dispute.title}" → ${dispute.truth_claim_id}`);
    });
    
    console.log('\nNote: In production, this would use the games-api service endpoints');
    console.log('to properly create disputes with proper payment processing and validation.');

  } catch (error) {
    console.error('Error seeding tribute data:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTributeData();
}

export { seedTributeData };