import { Module } from '@nestjs/common';
import { StaysController } from './stays.controller';
import { StaysService } from './application/stays.service';
import { MockStayProvider } from './adapters/mock-stay-provider.adapter';
import { WeightedLinearRanker } from './adapters/weighted-linear-ranker.adapter';
import { HttpSharePublisher } from './adapters/http-share-publisher.adapter';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [StaysController],
  providers: [
    StaysService,
    PrismaService,
    {
      provide: 'IStayProvider',
      useClass: MockStayProvider,
    },
    {
      provide: 'IRanker',
      useClass: WeightedLinearRanker,
    },
    {
      provide: 'ISharePublisher',
      useClass: HttpSharePublisher,
    },
  ],
  exports: [StaysService],
})
export class StaysModule {}