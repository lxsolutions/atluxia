

import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { RulePacksService } from './rule-packs.service';

@Controller('rulepacks')
export class RulePacksController {
  constructor(private readonly rulePacksService: RulePacksService) {}

  @Post('validate')
  async validateRulePack(@Body() rulePackData: any) {
    const result = this.rulePacksService.validateRulePack(rulePackData);
    return result;
  }

  @Post()
  async createRulePack(@Body() rulePackData: any) {
    // In a real implementation, you'd get the user ID from the auth context
    const createdBy = 'system'; // Placeholder for user ID
    return this.rulePacksService.createRulePack(rulePackData, createdBy);
  }

  @Post(':id/activate')
  async activateRulePack(@Param('id') id: string) {
    return this.rulePacksService.activateRulePack(id);
  }

  @Get()
  async getRulePacks(
    @Query('airport') airportCode?: string,
    @Query('includeInactive') includeInactive?: string
  ) {
    const includeInactiveBool = includeInactive === 'true';
    return this.rulePacksService.getRulePacks(airportCode, includeInactiveBool);
  }

  @Get(':airportCode/active')
  async getActiveRulePack(@Param('airportCode') airportCode: string) {
    return this.rulePacksService.getActiveRulePack(airportCode);
  }
}

