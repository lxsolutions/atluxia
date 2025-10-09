import { Module } from '@nestjs/common';
import { RulePacksController } from './rule-packs.controller';
import { RulePacksService } from './rule-packs.service';
import { PrismaService } from '../utils/prisma.service';

@Module({
  controllers: [RulePacksController],
  providers: [RulePacksService, PrismaService],
  exports: [RulePacksService]
})
export class RulePacksModule {}