import { ReputationLensesDB } from './db';
import { EventService, initializeNATS, closeNATS } from './events';

async function testReputationLenses() {
  console.log('Testing Reputation & Lenses Service...\n');

  try {
    // Initialize NATS
    await initializeNATS();
    console.log('✅ NATS initialized');

    // Test creating a lens
    console.log('\n1. Creating a lens...');
    const lens = await ReputationLensesDB.createLens({
      name: 'Fact Checking Lens',
      description: 'Analyzes claims for factual accuracy',
      algorithm: 'fact_checking',
      parameters: { sources: ['reliable', 'verified'] },
      weight: '0.80',
    });
    console.log('✅ Lens created:', lens.id);

    // Test running the lens
    console.log('\n2. Running lens on a claim...');
    const lensRun = await ReputationLensesDB.createLensRun({
      lensId: lens.id,
      claimId: 'test-claim-123',
      confidenceScore: '0.75',
      reasoning: 'Fact-checking analysis completed successfully',
      evidenceUsed: ['evidence-1', 'evidence-2'],
      processingTimeMs: 150,
    });
    console.log('✅ Lens run completed:', lensRun.id);

    // Test user reputation
    console.log('\n3. Creating user reputation...');
    const reputation = await ReputationLensesDB.updateUserReputation(
      'user-123',
      lens.id,
      {
        reputationScore: '0.85',
        contributionCount: 5,
        accuracyScore: '0.90',
      }
    );
    console.log('✅ User reputation created:', reputation.id);

    // Test merit transaction
    console.log('\n4. Creating merit transaction...');
    const meritTransaction = await ReputationLensesDB.createMeritTransaction({
      userId: 'user-123',
      lensId: lens.id,
      claimId: 'test-claim-123',
      meritAmount: '10.00',
      transactionType: 'contribution',
      description: 'High-quality fact-checking contribution',
    });
    console.log('✅ Merit transaction created:', meritTransaction.id);

    // Test lens calibration
    console.log('\n5. Calibrating lens...');
    const calibration = await ReputationLensesDB.createLensCalibration({
      lensId: lens.id,
      groundTruthClaimId: 'ground-truth-claim-456',
      expectedScore: '0.95',
      actualScore: '0.90',
      calibrationError: '0.05',
    });
    console.log('✅ Lens calibration completed:', calibration.id);

    // Test event emission
    console.log('\n6. Testing event emission...');
    await EventService.emitLensCreated(lens);
    await EventService.emitLensRunCompleted(lensRun);
    await EventService.emitReputationUpdated(reputation);
    await EventService.emitMeritTransaction(meritTransaction);
    await EventService.emitLensCalibration(calibration);
    console.log('✅ Events emitted successfully');

    // Test data retrieval
    console.log('\n7. Testing data retrieval...');
    const retrievedLens = await ReputationLensesDB.getLens(lens.id);
    console.log('✅ Lens retrieved:', retrievedLens?.name);

    const lensRuns = await ReputationLensesDB.getLensRunsForClaim('test-claim-123');
    console.log('✅ Lens runs retrieved:', lensRuns.length);

    const userReputation = await ReputationLensesDB.getUserReputation('user-123', lens.id);
    console.log('✅ User reputation retrieved:', userReputation?.reputationScore);

    const meritHistory = await ReputationLensesDB.getUserMeritHistory('user-123', 10);
    console.log('✅ Merit history retrieved:', meritHistory.length);

    const calibrationHistory = await ReputationLensesDB.getLensCalibrationHistory(lens.id, 10);
    console.log('✅ Calibration history retrieved:', calibrationHistory.length);

    console.log('\n🎉 All tests passed! Reputation & Lenses service is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Clean up
    await closeNATS();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testReputationLenses().catch(console.error);
}

export { testReputationLenses };