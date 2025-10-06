

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { PaymentRepository } from '../payment.repository';

describe('StripeService', () => {
  let service: StripeService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('sk_test_placeholder'),
          },
        },
        {
          provide: PaymentRepository,
          useValue: {
            createPayment: jest.fn(),
            updatePaymentStatus: jest.fn(),
            createStripeConnectAccount: jest.fn(),
            updateStripeConnectAccountStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createConnectAccount', () => {
    it('should create a test account when using test key', async () => {
      jest.spyOn(configService, 'get').mockReturnValue('sk_test_123');
      
      const result = await service.createConnectAccount('test@example.com', 'user123');
      
      expect(result).toHaveProperty('id');
      expect(result.id).toContain('acct_test_');
      expect(result.email).toBe('test@example.com');
      expect(result.metadata.userId).toBe('user123');
    });

    it('should throw error when Stripe API fails', async () => {
      jest.spyOn(configService, 'get').mockReturnValue('sk_live_invalid');
      jest.spyOn(service['stripe'].accounts, 'create').mockRejectedValue(new Error('API error'));
      
      await expect(service.createConnectAccount('test@example.com', 'user123'))
        .rejects.toThrow('Failed to create Stripe Connect account: API error');
    });
  });

  describe('createAccountLink', () => {
    it('should create a test account link when using test key', async () => {
      jest.spyOn(configService, 'get').mockReturnValue('sk_test_123');
      
      const result = await service.createAccountLink('acct_test_123', 'http://refresh', 'http://return');
      
      expect(result).toHaveProperty('url');
      expect(result.url).toContain('connect.stripe.com/setup/test/');
    });
  });

  describe('getAccountStatus', () => {
    it('should return test account status when using test key', async () => {
      jest.spyOn(configService, 'get').mockReturnValue('sk_test_123');
      
      const result = await service.getAccountStatus('acct_test_123');
      
      expect(result).toHaveProperty('id', 'acct_test_123');
      expect(result).toHaveProperty('charges_enabled', false);
      expect(result).toHaveProperty('payouts_enabled', false);
    });
  });

  describe('constructEvent', () => {
    it('should construct Stripe event', () => {
      const payload = Buffer.from('test payload');
      const signature = 'test_signature';
      const secret = 'whsec_test';
      
      jest.spyOn(service['stripe'].webhooks, 'constructEvent').mockReturnValue({
        type: 'account.updated',
        data: { 
          object: { 
            id: 'acct_test_123',
            object: 'account',
            charges_enabled: false,
            details_submitted: false,
            email: 'test@example.com',
            country: 'US'
          } 
        }
      } as any);
      
      const result = service.constructEvent(payload, signature, secret);
      
      expect(result.type).toBe('account.updated');
      expect(result.data.object.id).toBe('acct_test_123');
    });

    it('should throw error when event construction fails', () => {
      const payload = Buffer.from('test payload');
      const signature = 'invalid_signature';
      const secret = 'whsec_test';
      
      jest.spyOn(service['stripe'].webhooks, 'constructEvent').mockImplementation(() => {
        throw new Error('Invalid signature');
      });
      
      expect(() => service.constructEvent(payload, signature, secret))
        .toThrow('Failed to construct Stripe event: Invalid signature');
    });
  });
});

