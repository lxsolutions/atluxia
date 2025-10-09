






















import { Injectable } from '@nestjs/common';
import {
  NaiveRiskModel,
  RiskAssessmentInput,
  RiskAssessmentOutput
} from './models/naive-risk.model';

@Injectable()
export class RiskAssessmentService {
  private riskModel: NaiveRiskModel;

  constructor() {
    this.riskModel = new NaiveRiskModel();
  }

  /**
   * Assess the risk for a booking or driver
   */
  assessRisk(input: RiskAssessmentInput): RiskAssessmentOutput {
    return this.riskModel.assessRisk(input);
  }

  /**
   * Get suggested deposit amount based on risk band
   */
  getSuggestedDeposit(riskBand: 'LOW' | 'MEDIUM' | 'HIGH'): number {
    switch (riskBand) {
      case 'LOW':
        return 150.00;
      case 'MEDIUM':
        return 300.00;
      case 'HIGH':
        return 600.00;
    }
  }

  /**
   * Get price multiplier based on risk band
   */
  getPriceMultiplier(riskBand: 'LOW' | 'MEDIUM' | 'HIGH'): number {
    switch (riskBand) {
      case 'LOW':
        return 0.95; // 5% discount for low-risk drivers
      case 'MEDIUM':
        return 1.00;
      case 'HIGH':
        return 1.20; // 20% surcharge for high-risk drivers
    }
  }

  /**
   * Simulate a logistic regression baseline model (placeholder)
   */
  async simulateLogisticModel(input: RiskAssessmentInput): Promise<RiskAssessmentOutput> {
    // In a real implementation, this would call an actual machine learning model

    // For now, use the naive model with some random variation
    const baseResult = this.riskModel.assessRisk(input);

    // Add some variability to simulate a more sophisticated model
    if (Math.random() < 0.2) {
      // Randomly adjust risk band in 20% of cases
      const adjustments: Record<string, 'LOW' | 'MEDIUM' | 'HIGH'> = {
        LOW: baseResult.riskBand === 'LOW' ? 'MEDIUM' : 'LOW',
        MEDIUM: Math.random() < 0.5 ? 'LOW' : 'HIGH',
        HIGH: baseResult.riskBand === 'HIGH' ? 'MEDIUM' : 'HIGH'
      };
      return {
        ...baseResult,
        riskBand: adjustments[baseResult.riskBand]
      };
    }

    return baseResult;
  }
}


















