























import { Test, TestingModule } from '@nestjs/testing';
import { RiskAssessmentService } from './../src/risk-assessment.service';

describe('RiskAssessmentService', () => {
  let service: RiskAssessmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiskAssessmentService],
    }).compile();

    service = module.get<RiskAssessmentService>(RiskAssessmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assessRisk', () => {
    it('should return HIGH risk for young driver with poor MVR and short booking', () => {
      const input = {
        userAge: 20,
        hasMVRSignal: false, // Poor driving history
        bookingDurationDays: 1,
        timeOfDay: 'night',
        vehicleClass: 'luxury'
      };

      const result = service.assessRisk(input);
      expect(result.riskBand).toBe('HIGH');
      expect(result.suggestedDeposit).toBe(600); // High deposit for high risk
    });

    it('should return LOW risk for experienced driver with good history and long booking', () => {
      const input = {
        userAge: 45,
        hasMVRSignal: true, // Good driving history
        bookingDurationDays: 14,
        timeOfDay: 'day',
        vehicleClass: 'compact'
      };

      const result = service.assessRisk(input);
      expect(result.riskBand).toBe('LOW');
      expect(result.suggestedDeposit).toBe(150); // Low deposit for low risk
    });

    it('should return MEDIUM risk for average driver with neutral factors', () => {
      const input = {
        userAge: 35,
        bookingDurationDays: 7,
        timeOfDay: 'day',
        vehicleClass: 'sedan'
      };

      const result = service.assessRisk(input);
      expect(result.riskBand).toBe('MEDIUM');
    });
  });

  describe('getSuggestedDeposit', () => {
    it('should return correct deposit amounts for each risk band', () => {
      expect(service.getSuggestedDeposit('LOW')).toBe(150.00);
      expect(service.getSuggestedDeposit('MEDIUM')).toBe(300.00);
      expect(service.getSuggestedDeposit('HIGH')).toBe(600.00);
    });
  });

  describe('getPriceMultiplier', () => {
    it('should return correct price multipliers for each risk band', () => {
      expect(service.getPriceMultiplier('LOW')).toBeCloseTo(0.95); // 5% discount
      expect(service.getPriceMultiplier('MEDIUM')).toBe(1.00);
      expect(service.getPriceMultiplier('HIGH')).toBeCloseTo(1.20); // 20% surcharge
    });
  });

  describe('simulateLogisticModel', () => {
    it('should return a valid risk assessment output', async () => {
      const input = {
        userAge: 30,
        bookingDurationDays: 5,
        vehicleClass: 'sedan'
      };

      const result = await service.simulateLogisticModel(input);
      expect(result.riskBand).toBeDefined();
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(result.riskBand);
      expect(result.suggestedDeposit).toBeGreaterThan(0);
    });
  });
});



















