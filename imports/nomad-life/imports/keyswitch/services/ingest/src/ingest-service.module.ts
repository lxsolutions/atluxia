














import { Module } from '@nestjs/common';
import { TelematicsAdapterService } from './adapters/telematics-adapter.service';

@Module({
  providers: [TelematicsAdapterService],
})
export class IngestServiceModule {}














