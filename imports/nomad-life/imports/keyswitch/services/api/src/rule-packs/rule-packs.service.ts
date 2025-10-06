
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { AirportRulePackValidator, ValidationResult } from '@keyswitch/rules';
import * as crypto from 'crypto';

@Injectable()
export class RulePacksService {
  private validator: AirportRulePackValidator;

  constructor(private prisma: PrismaService) {
    this.validator = new AirportRulePackValidator();
  }

  /**
   * Validate a rule pack without storing it
   */
  validateRulePack(rulePackData: any): ValidationResult {
    return this.validator.validateRulePack(rulePackData);
  }

  /**
   * Store a validated rule pack
   */
  async createRulePack(rulePackData: any, createdBy?: string): Promise<any> {
    const validation = this.validateRulePack(rulePackData);
    
    if (!validation.valid) {
      throw new Error(`Invalid rule pack: ${validation.errors?.join(', ')}`);
    }

    const { airport_code, rulepack_version } = validation.data;
    const jsonBlob = JSON.stringify(rulePackData);
    const checksum = crypto.createHash('sha256').update(jsonBlob).digest('hex');

    // Check if this exact rule pack already exists
    const existing = await this.prisma.airportRulePack.findUnique({
      where: { checksum }
    });

    if (existing) {
      return existing;
    }

    return this.prisma.airportRulePack.create({
      data: {
        airport_code,
        version: rulepack_version,
        json_blob: rulePackData,
        checksum,
        active: false,
        created_by: createdBy
      }
    });
  }

  /**
   * Activate a rule pack (deactivates others for the same airport)
   */
  async activateRulePack(id: string): Promise<any> {
    const rulePack = await this.prisma.airportRulePack.findUnique({
      where: { id }
    });

    if (!rulePack) {
      throw new NotFoundException('Rule pack not found');
    }

    // Deactivate all other rule packs for this airport
    await this.prisma.airportRulePack.updateMany({
      where: {
        airport_code: rulePack.airport_code,
        active: true
      },
      data: {
        active: false,
        activated_at: null
      }
    });

    // Activate this rule pack
    return this.prisma.airportRulePack.update({
      where: { id },
      data: {
        active: true,
        activated_at: new Date()
      }
    });
  }

  /**
   * Get rule packs for an airport
   */
  async getRulePacks(airportCode?: string, includeInactive: boolean = false): Promise<any[]> {
    const where: any = {};
    
    if (airportCode) {
      where.airport_code = airportCode.toUpperCase();
    }
    
    if (!includeInactive) {
      where.active = true;
    }

    return this.prisma.airportRulePack.findMany({
      where,
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  /**
   * Get the active rule pack for an airport
   */
  async getActiveRulePack(airportCode: string): Promise<any> {
    return this.prisma.airportRulePack.findFirst({
      where: {
        airport_code: airportCode.toUpperCase(),
        active: true
      }
    });
  }
}
