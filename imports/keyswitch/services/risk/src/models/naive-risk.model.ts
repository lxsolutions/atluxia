




















export interface RiskAssessmentInput {
  userAge?: number;
  hasMVRSignal?: boolean; // Motor Vehicle Record signal
  bookingDurationDays: number;
  timeOfDay?: string; // e.g., 'day', 'night'
  vehicleClass?: string; // e.g., 'compact', 'SUV', 'luxury'
  priorPlatformHistory?: string; // e.g., 'good', 'neutral', 'poor'
}

export interface RiskAssessmentOutput {
  riskBand: 'LOW' | 'MEDIUM' | 'HIGH';
  suggestedDeposit: number;
  priceMultiplier: number;
}

/**
 * Naive rule-based risk assessment model
 */
export class NaiveRiskModel {
  /**
   * Assess the risk level for a booking based on various factors
   */
  assessRisk(input: RiskAssessmentInput): RiskAssessmentOutput {
    let score = 0;

    // Age factor (younger drivers are higher risk)
    if (input.userAge) {
      if (input.userAge < 25) score += 3;
      else if (input.userAge >= 65) score -= 1; // Older drivers can be more cautious
    }

    // MVR signal factor (no record is better)
    if (input.hasMVRSignal === false) {
      score += 2; // Poor driving history increases risk
    } else if (input.hasMVRSignal === true) {
      score -= 1; // Good driving history decreases risk
    }

    // Booking duration factor (longer rentals can be more stable)
    if (input.bookingDurationDays < 3) {
      score += 2;
    } else if (input.bookingDurationDays >= 7) {
      score -= 1;
    }

    // Time of day factor (night driving increases risk)
    if (input.timeOfDay === 'night') {
      score += 1;
    }

    // Vehicle class factor (more expensive vehicles increase risk)
    if (input.vehicleClass && ['luxury', 'SUV'].includes(input.vehicleClass)) {
      score += 2;
    } else if (input.vehicleClass === 'compact') {
      score -= 1;
    }

    // Prior platform history
    if (input.priorPlatformHistory === 'poor') {
      score += 3;
    } else if (input.priorPlatformHistory === 'good') {
      score -= 2;
    }

    // Determine risk band based on score
    let riskBand: RiskAssessmentOutput['riskBand'] = 'MEDIUM';
    if (score <= -2) riskBand = 'LOW';
    if (score >= 4) riskBand = 'HIGH';

    // Map risk band to deposit and price multiplier
    const output: RiskAssessmentOutput = {
      riskBand,
      suggestedDeposit: this.getSuggestedDeposit(riskBand),
      priceMultiplier: this.getPriceMultiplier(riskBand)
    };

    return output;
  }

  /**
   * Get suggested deposit amount based on risk band
   */
  private getSuggestedDeposit(riskBand: RiskAssessmentOutput['riskBand']): number {
    switch (riskBand) {
      case 'LOW':
        return 150.00; // $150 for low-risk drivers
      case 'MEDIUM':
        return 300.00; // $300 for medium-risk drivers
      case 'HIGH':
        return 600.00; // $600 for high-risk drivers
    }
  }

  /**
   * Get price multiplier based on risk band (applied to base rental rate)
   */
  private getPriceMultiplier(riskBand: RiskAssessmentOutput['riskBand']): number {
    switch (riskBand) {
      case 'LOW':
        return 0.95; // 5% discount for low-risk drivers
      case 'MEDIUM':
        return 1.00; // Standard rate for medium-risk drivers
      case 'HIGH':
        return 1.20; // 20% surcharge for high-risk drivers
    }
  }
}


















