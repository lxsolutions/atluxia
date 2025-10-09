import { Module } from '@nestjs/common';
import { ImmigrationController } from './immigration.controller';
import { ImmigrationService } from './immigration.service';
import { RulesModule } from './rules.module';

@Module({
  imports: [RulesModule],
  controllers: [ImmigrationController],
  providers: [ImmigrationService],
})
export class AppModule {}
