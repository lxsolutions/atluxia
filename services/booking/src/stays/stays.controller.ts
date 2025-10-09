import { Controller, Get, Post, Body, Query, ValidationPipe, UsePipes } from '@nestjs/common';
import { StaySearchQuery, ShareEvent } from '@atluxia/contracts';
import { StaysService } from './application/stays.service';

@Controller('stays')
export class StaysController {
  constructor(private readonly staysService: StaysService) {}

  @Get('search')
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchStays(@Query() query: StaySearchQuery) {
    const { listings, reasons } = await this.staysService.searchStays(query);
    
    // Convert Map to object for JSON serialization
    const reasonsObject = Object.fromEntries(reasons);
    
    return {
      listings,
      reasons: reasonsObject,
      total: listings.length,
    };
  }

  @Post('share')
  async shareStay(@Body() shareEvent: ShareEvent) {
    await this.staysService.shareStay(shareEvent);
    return { success: true, message: 'Stay shared successfully' };
  }
}