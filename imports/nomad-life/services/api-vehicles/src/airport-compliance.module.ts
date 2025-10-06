


















import { Module } from '@nestjs/common';
import { AirportConfigService } from './airport-config.service';

@Module({
  providers: [AirportConfigService],
  exports: [AirportConfigService]
})
export class AirportComplianceModule {}















