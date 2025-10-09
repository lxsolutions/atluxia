






















import { Controller, Post, Body } from '@nestjs/common';
import { RiskAssessmentService } from './risk-assessment.service';

@Controller('api/v1/risk')
export class RiskController {
  constructor(private readonly riskService: RiskAssessmentService) {}

  @Post('assess')
  async assessRisk(@Body() input: any) {
    try {
      const result = await this.riskService.simulateLogisticModel(input);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error assessing risk:', error);
      return { error: 'Failed to assess risk' };
    }
  }

  @Post('deposit')
  getSuggestedDeposit(@Body() body: any) {
    const { riskBand } = body;
    if (!riskBand || !['LOW', 'MEDIUM', 'HIGH'].includes(riskBand)) {
      return { error: 'Invalid risk band' };
    }
    try {
      const deposit = this.riskService.getSuggestedDeposit(riskBand);
      return { success: true, suggestedDeposit: deposit };
    } catch (error) {
      console.error('Error getting suggested deposit:', error);
      return { error: 'Failed to get suggested deposit' };
    }
  }

  @Post('price-multiplier')
  getPriceMultiplier(@Body() body: any) {
    const { riskBand } = body;
    if (!riskBand || !['LOW', 'MEDIUM', 'HIGH'].includes(riskBand)) {
      return { error: 'Invalid risk band' };
    }
    try {
      const multiplier = this.riskService.getPriceMultiplier(riskBand);
      return { success: true, priceMultiplier: multiplier };
    } catch (error) {
      console.error('Error getting price multiplier:', error);
      return { error: 'Failed to get price multiplier' };
    }
  }

  @Post('demo')
  async demoRiskAssessment(@Body() body: any) {
    // Demo with sample data
    const input = {
      userAge: body.userAge || 30,
      hasMVRSignal: body.hasMVRSignal !== undefined ? body.hasMVRSignal : null,
      bookingDurationDays: body.bookingDurationDays || 5,
      timeOfDay: body.timeOfDay || 'day',
      vehicleClass: body.vehicleClass || 'compact',
      priorPlatformHistory: body.priorPlatformHistory || 'neutral'
    };

    try {
      const result = await this.riskService.simulateLogisticModel(input);
      return { success: true, input, riskAssessment: result };
    } catch (error) {
      console.error('Error in demo assessment:', error);
      return { error: 'Demo failed' };
    }
  }
}


















