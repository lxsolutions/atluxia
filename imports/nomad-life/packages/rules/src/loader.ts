


import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { ImmigrationRuleSchema, ImmigrationRule } from './types/immigration';
import { AirportConfigSchema, AirportConfig } from './types/airport';
import { LeaseClauseSchema, LeaseTemplateSchema } from './types/lease';

export class RulesLoader {
  private rulesDir: string;

  constructor(rulesDir: string = path.join(__dirname, '..', 'rules')) {
    this.rulesDir = rulesDir;
  }

  async loadImmigrationRules(): Promise<ImmigrationRule[]> {
    const rulesPath = path.join(this.rulesDir, 'immigration');
    const files = await this.getYamlFiles(rulesPath);
    
    const rules: ImmigrationRule[] = [];
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const data = yaml.load(content);
        const rule = ImmigrationRuleSchema.parse(data);
        rules.push(rule);
      } catch (error) {
        console.warn(`Failed to load immigration rule from ${file}:`, error);
      }
    }
    
    return rules;
  }

  async loadAirportConfigs(): Promise<AirportConfig[]> {
    const configsPath = path.join(this.rulesDir, 'airports');
    const files = await this.getYamlFiles(configsPath);
    
    const configs: AirportConfig[] = [];
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const data = yaml.load(content);
        const config = AirportConfigSchema.parse(data);
        configs.push(config);
      } catch (error) {
        console.warn(`Failed to load airport config from ${file}:`, error);
      }
    }
    
    return configs;
  }

  async loadLeaseClauses(): Promise<any[]> {
    const clausesPath = path.join(this.rulesDir, 'lease', 'clauses');
    const files = await this.getYamlFiles(clausesPath);
    
    const clauses: any[] = [];
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const data = yaml.load(content);
        const clause = LeaseClauseSchema.parse(data);
        clauses.push(clause);
      } catch (error) {
        console.warn(`Failed to load lease clause from ${file}:`, error);
      }
    }
    
    return clauses;
  }

  async loadLeaseTemplates(): Promise<any[]> {
    const templatesPath = path.join(this.rulesDir, 'lease', 'templates');
    const files = await this.getYamlFiles(templatesPath);
    
    const templates: any[] = [];
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const data = yaml.load(content);
        const template = LeaseTemplateSchema.parse(data);
        templates.push(template);
      } catch (error) {
        console.warn(`Failed to load lease template from ${file}:`, error);
      }
    }
    
    return templates;
  }

  private async getYamlFiles(dirPath: string): Promise<string[]> {
    try {
      await fs.access(dirPath);
      const files = await fs.readdir(dirPath);
      return files
        .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
        .map(file => path.join(dirPath, file));
    } catch (error) {
      // Directory doesn't exist yet, return empty array
      return [];
    }
  }

  // Helper method to find rules by criteria
  async findVisaPaths(
    nationality: string,
    destination: string,
    purpose: string,
    stayLengthDays: number
  ): Promise<any[]> {
    const rules = await this.loadImmigrationRules();
    const results: any[] = [];

    for (const rule of rules) {
      const countryRules = rule.countries[nationality];
      if (countryRules) {
        for (const countryRule of countryRules) {
          if (countryRule.destination === destination && 
              countryRule.purpose === purpose &&
              stayLengthDays >= countryRule.stayLength.min &&
              stayLengthDays <= countryRule.stayLength.max) {
            results.push(...countryRule.visaPaths);
          }
        }
      }
    }

    return results;
  }
}

// Default instance
export const rulesLoader = new RulesLoader();


