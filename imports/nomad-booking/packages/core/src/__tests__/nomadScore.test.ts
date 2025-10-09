










import { calculateNomadScore } from '../nomadScore'
import { describe, it, expect } from 'vitest'

describe('calculateNomadScore', () => {
  it('should return a score between 0 and 1', () => {
    const result = calculateNomadScore({})
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(1)
  })

  it('should give higher scores for better wifi', () => {
    // Fast wifi (200 Mbps) should approach max score contribution
    const fastWifiScore = calculateNomadScore({ wifiSpeedMbps: 200 })
    expect(fastWifiScore).toBeGreaterThan(calculateNomadScore({}))

    // Very slow wifi should give lower score
    const slowWifiScore = calculateNomadScore({ wifiSpeedMbps: 10 })
    expect(slowWifiScore).toBeLessThan(calculateNomadScore({}))
  })

  it('should give higher scores for better workspace quality', () => {
    // Professional workspace should be highest
    const professionalWorkspace = calculateNomadScore({
      workspaceQuality: 'professional'
    })
    expect(professionalWorkspace).toBeGreaterThan(
      calculateNomadScore({ workspaceQuality: 'dedicated' })
    )
    expect(professionalWorkspace).toBeGreaterThan(
      calculateNomadScore({ workspaceQuality: 'basic' })
    )

    // No workspace should be lowest
    const noWorkspace = calculateNomadScore({
      workspaceQuality: 'none'
    })
    expect(noWorkspace).toBeLessThan(calculateNomadScore({}))
  })

  it('should give higher scores for quieter environments', () => {
    // Very quiet (40 dB) should be better than default
    const quietEnv = calculateNomadScore({
      noiseLevelDb: 40
    })
    expect(quietEnv).toBeGreaterThan(
      calculateNomadScore({ noiseLevelDb: 50 }) // Default is 50
    )

    // Very loud (80 dB) should be worse than default
    const loudEnv = calculateNomadScore({
      noiseLevelDb: 80
    })
    expect(loudEnv).toBeLessThan(
      calculateNomadScore({ noiseLevelDb: 50 }) // Default is 50
    )
  })

  it('should give higher scores for better locations', () => {
    const excellentLocation = calculateNomadScore({
      locationScore: 1.0
    })
    expect(excellentLocation).toBeGreaterThan(
      calculateNomadScore({ locationScore: 0.7 }) // Default is 0.7
    )

    const poorLocation = calculateNomadScore({
      locationScore: 0.3
    })
    expect(poorLocation).toBeLessThan(
      calculateNomadScore({ locationScore: 0.7 }) // Default is 0.7
    )
  })

  it('should handle edge cases gracefully', () => {
    const extremeWifi = calculateNomadScore({
      wifiSpeedMbps: 1000, // Extremely high speed
      noiseLevelDb: -10,   // Impossible low noise (clamped)
      locationScore: 2     // Out of bounds (clamped)
    })
    expect(extremeWifi).toBeLessThanOrEqual(1)

    const minimalData = calculateNomadScore({})
    expect(minimalData).toBeGreaterThan(0) // Should still be reasonable with defaults
  })

  it('should maintain weight distribution', () => {
    // Test that weights add up to approximately 1.0
    const totalWeightTest = calculateNomadScore({
      wifiSpeedMbps: 200,   // Maxes out at ~0.35 contribution
      workspaceQuality: 'professional',
      noiseLevelDb: 40,
      locationScore: 1.0
    })
    expect(totalWeightTest).toBeGreaterThan(0.9) // Should be close to perfect score

    const minimalWeightTest = calculateNomadScore({
      wifiSpeedMbps: 20,   // Low contribution ~0.35 * (20/200)
      workspaceQuality: 'none',
      noiseLevelDb: 80,
      locationScore: 0.1
    })
    expect(minimalWeightTest).toBeLessThan(0.4) // Should be quite low score
  })
})






