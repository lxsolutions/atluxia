import { Module } from '@nestjs/common';
import { rulesLoader } from '@atluxia/rules';

@Module({
  providers: [
    {
      provide: 'RULES_LOADER',
      useValue: rulesLoader,
    },
  ],
  exports: ['RULES_LOADER'],
})
export class RulesModule {}
