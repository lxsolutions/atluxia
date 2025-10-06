



















import { Controller, Get, Param } from '@nestjs/common';
import { AirportConfigService } from './airport-config.service';

@Controller('api/v1/airports')
export class AirportComplianceController {
  constructor(private readonly airportConfigService: AirportConfigService) {}

  @Get(':code/config')
  getAirportConfig(@Param('code') code: string) {
    const config = this.airportConfigService.getAirportConfig(code.toUpperCase());
    if (!config) {
      return { error: 'Airport not found or not configured' };
    }
    return config;
  }

  @Get(':code/zones')
  getAllowedZones(@Param('code') code: string) {
    const config = this.airportConfigService.getAirportConfig(code.toUpperCase());
    if (!config || !config.zones) {
      return { error: 'No zones configured for this airport' };
    }
    // Return only allowed zones
    return config.zones.filter(zone => zone.allowed);
  }

  @Get('all')
  getAllAirports() {
    const codes = this.airportConfigService.getAllAirportCodes();
    return { airports: codes.map(code => ({ code, configured: true })) };
  }
}















