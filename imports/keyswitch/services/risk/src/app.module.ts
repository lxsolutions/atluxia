






















import { Module } from '@nestjs/common';
import { RiskAssessmentModule } from './risk-assessment.module';
import { RiskController } from './risk.controller';

@Module({
  imports: [RiskAssessmentModule],
  controllers: [RiskController]
})
export class AppModule {}




















