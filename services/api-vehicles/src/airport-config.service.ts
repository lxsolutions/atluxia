


















import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

@Injectable()
export class AirportConfigService {
  private airportConfigs: Record<string, any> = {};

  constructor() {
    this.loadAirportConfigs();
  }

  /**
   * Load all airport configurations from the config directory
   */
  private loadAirportConfigs(): void {
    const configDir = path.join(__dirname, '..', '..', 'config', 'airports');

    if (!fs.existsSync(configDir)) {
      console.warn('Airport configuration directory not found');
      return;
    }

    fs.readdirSync(configDir).forEach(file => {
      if (file.endsWith('.yml') || file.endsWith('.yaml')) {
        const airportCode = path.basename(file, '.yml').toUpperCase();
        try {
          const configPath = path.join(configDir, file);
          this.airportConfigs[airportCode] = yaml.load(fs.readFileSync(configPath, 'utf8'));
        } catch (error) {
          console.error(`Error loading airport config ${file}:`, error.message);
        }
      }
    });
  }

  /**
   * Get configuration for a specific airport
   */
  getAirportConfig(airportCode: string): any | undefined {
    return this.airportConfigs[airportCode.toUpperCase()];
  }

  /**
   * Check if an airport is configured in the system
   */
  hasAirportConfig(airportCode: string): boolean {
    return !!this.airportConfigs[airportCode.toUpperCase()];
  }

  /**
   * Get all available airport codes
   */
  getAllAirportCodes(): string[] {
    return Object.keys(this.airportConfigs);
  }
}














