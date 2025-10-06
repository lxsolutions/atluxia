import { Module } from '@nestjs/common';
import { rulesLoader } from '@nomad-life/rules';

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
