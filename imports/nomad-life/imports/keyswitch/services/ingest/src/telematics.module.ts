






















import { Module } from '@nestjs/common';
import { TelematicsService } from './telematics.service';

@Module({
  providers: [TelematicsService],
  exports: [TelematicsService]
})
export class TelematicsModule {}



















