
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { Polygon } from 'geojson';

// Import the JSON schema
import airportRulePackSchema from './airportRulePack.schema.json';

export interface AirportRulePack {
  airport_code: string;
  airport_name: string;
  effective_from: string;
  pickup_zone: Polygon;
  return_zone: Polygon;
  allowed_hours: Array<{
    day: string;
    start_time: string;
    end_time: string;
  }>;
  dropoff_grace_minutes: number;
  fees: {
    airport_access_per_trip: number;
    parking_rate_per_hour: number;
    curbside_violation_fee?: number;
    permit_fee?: number;
  };
  permits_required: string[];
  notes?: string;
  rulepack_version: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  data?: AirportRulePack;
}

export class AirportRulePackValidator {
  private ajv: Ajv;
  private validate: ValidateFunction;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      strict: false,
      coerceTypes: true
    });
    addFormats(this.ajv);
    
    this.validate = this.ajv.compile(airportRulePackSchema);
  }

  /**
   * Validate a rule pack object against the schema
   */
  validateRulePack(rulePack: any): ValidationResult {
    const valid = this.validate(rulePack);
    
    if (!valid) {
      const errors = this.validate.errors?.map(error => 
        `${error.instancePath} ${error.message}`
      ) || ['Unknown validation error'];
      
      return {
        valid: false,
        errors
      };
    }

    return {
      valid: true,
      data: rulePack as AirportRulePack
    };
  }

  /**
   * Parse and validate a YAML file containing rule pack data
   */
  parseAndValidateYaml(yamlContent: string): ValidationResult {
    try {
      const parsedData = yaml.load(yamlContent);
      return this.validateRulePack(parsedData);
    } catch (error: any) {
      return {
        valid: false,
        errors: [`YAML parsing error: ${error.message}`]
      };
    }
  }

  /**
   * Load and validate a rule pack from a YAML file
   */
  loadFromFile(filePath: string): ValidationResult {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return this.parseAndValidateYaml(content);
    } catch (error: any) {
      return {
        valid: false,
        errors: [`File reading error: ${error.message}`]
      };
    }
  }
}

// Export TypeScript types
// The interfaces are already exported above, no need to re-export
