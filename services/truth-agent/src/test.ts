import { TruthAgentService } from './services/truthAgent';
import { TruthAgentDB } from './db';
import { EventService } from './events';

async function runTests() {
  console.log('=== Truth Agent Service Tests ===\n');

  try {
    // Test 1: Create a truth agent
    console.log('Test 1: Creating truth agent...');
    const agent = await TruthAgentService.createAgent({
      name: 'Citation Verifier v1',
      description: 'Citations-first truth verification agent',
      agentType: 'citation_verifier',
      modelConfig: {
        maxCitations: 5,
        minRelevanceScore: 0.3,
      },
    });
    console.log('✓ Agent created:', agent.id);

    // Test 2: Verify a claim with citations
    console.log('\nTest 2: Verifying claim with citations...');
    const claimText = `
      According to NASA's climate data (https://climate.nasa.gov/evidence/), 
      global temperatures have risen by about 1.1°C since the late 19th century. 
      This is supported by multiple studies including the IPCC report (https://www.ipcc.ch/).
    `;
    
    const result = await TruthAgentService.verifyClaim('test-claim-1', claimText);
    console.log('✓ Claim verification completed:');
    console.log(`  - Verdict: ${result.verdict}`);
    console.log(`  - Confidence: ${result.confidenceScore}`);
    console.log(`  - Citations found: ${result.citations.length}`);
    console.log(`  - Processing time: ${result.processingTimeMs}ms`);

    // Test 3: Get verification history
    console.log('\nTest 3: Getting verification history...');
    const history = await TruthAgentService.getClaimVerificationHistory('test-claim-1');
    console.log(`✓ Found ${history.length} verification runs`);

    // Test 4: Test source credibility
    console.log('\nTest 4: Testing source credibility...');
    const nasaSource = await TruthAgentDB.getSourceCredibility('climate.nasa.gov');
    console.log(`✓ NASA credibility score: ${nasaSource?.credibilityScore || 'Not evaluated'}`);

    // Test 5: Event emission
    console.log('\nTest 5: Testing event emission...');
    await EventService.emitAgentCreated(agent);
    console.log('✓ Agent created event emitted');

    console.log('\n=== All tests completed successfully! ===');

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}