














import { Module } from '@nestjs/common';
import { RiskAssessmentService } from './services/risk-assessment.service';

@Module({
  providers: [RiskAssessmentService],
})
export class RiskServiceModule {}












