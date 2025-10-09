







export interface NomadScoreParams {
  wifiSpeedMbps?: number
  workspaceQuality?: 'none' | 'basic' | 'dedicated' | 'professional'
  noiseLevelDb?: number
  locationScore?: number // 0-1 scale based on neighborhood analysis
}

/**
 * Calculates the NomadScore for a property unit.
 *
 * NomadScore = 0.35*wifi + 0.25*workspace + 0.15*noise + 0.25*location
 */
export function calculateNomadScore(params: NomadScoreParams): number {
  // Default values with reasonable assumptions for digital nomads
  const wifi = params.wifiSpeedMbps || 30 // Default to 30 Mbps if not specified
  const workspace = getWorkspaceQualityScore(params.workspaceQuality)
  const noiseLevelDb = params.noiseLevelDb || 50 // Default to moderate noise level
  const locationScore = params.locationScore || 0.7 // Default to good location

  // Calculate individual component scores (normalized to 0-1 scale)

  // Wifi score: higher is better, capped at 200 Mbps for scoring purposes
  const wifiScore = Math.min(wifi / 200, 1) * 0.35

  // Noise score: lower noise is better (inverted)
  const maxNoiseDb = 80 // Very loud
  const minNoiseDb = 40 // Quiet office environment
  let noiseScore = 1 - ((noiseLevelDb - minNoiseDb) / (maxNoiseDb - minNoiseDb))
  noiseScore = Math.max(0, Math.min(noiseScore, 1)) * 0.15

  // Location score should be normalized to 0-1 scale, clamp if out of bounds
  const clampedLocationScore = Math.max(0, Math.min(locationScore, 1))
  const locationWeighted = clampedLocationScore * 0.25

  return wifiScore + (workspace * 0.25) + noiseScore + locationWeighted
}

/**
 * Converts workspace quality enum to a numeric score (0-1 scale)
 */
function getWorkspaceQualityScore(quality?: 'none' | 'basic' | 'dedicated' | 'professional'): number {
  switch (quality) {
    case undefined:
      return 0.25 // Default: basic workspace assumption
    case 'none':
      return 0.1
    case 'basic':
      return 0.3
    case 'dedicated':
      return 0.6
    case 'professional':
      return 0.9
    default:
      return 0.25 // Default: basic workspace assumption
  }
}



