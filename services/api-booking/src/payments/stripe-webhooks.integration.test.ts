import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { StripeWebhooksController } from './stripe-webhooks.controller';
import { StripeService } from './stripe/stripe.service';
import { PaymentRepository } from './payment.repository';

describe('Stripe Webhooks Integration', () => {
  let app: INestApplication;
  let stripeService: StripeService;
  let paymentRepository: PaymentRepository;

  const mockStripeService = {
    constructEvent: jest.fn(),
  };

  const mockPaymentRepository = {
    createWebhookLog: jest.fn(),
    updateWebhookLogStatus: jest.fn(),
    updateStripeConnectAccountStatus: jest.fn(),
    updatePaymentStatus: jest.fn(),
    getBookingByPaymentIntentId: jest.fn(),
    updateBookingStatus: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StripeWebhooksController],
      providers: [
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
        {
          provide: PaymentRepository,
          useValue: mockPaymentRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    stripeService = moduleFixture.get<StripeService>(StripeService);
    paymentRepository = moduleFixture.get<PaymentRepository>(PaymentRepository);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /webhooks/stripe', () => {
    it('should handle account.updated webhook successfully', async () => {
      const accountUpdatedEvent = {
        id: 'evt_test_123',
        type: 'account.updated',
        data: {
          object: {
            id: 'acct_test_123',
            charges_enabled: true,
            payouts_enabled: true,
            requirements: {
              currently_due: [],
              eventually_due: [],
              past_due: [],
              pending_verification: [],
            },
            details_submitted: true,
          },
        },
      };

      mockStripeService.constructEvent.mockReturnValue(accountUpdatedEvent);
      mockPaymentRepository.createWebhookLog.mockResolvedValue({ id: 'log_123' });
      mockPaymentRepository.updateWebhookLogStatus.mockResolvedValue({});
      mockPaymentRepository.updateStripeConnectAccountStatus.mockResolvedValue({});

      const response = await request(app.getHttpServer())
        .post('/webhooks/stripe')
        .set('stripe-signature', 'test_signature')
        .send(accountUpdatedEvent)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({ received: true });
      expect(mockPaymentRepository.updateStripeConnectAccountStatus).toHaveBeenCalledWith(
        'acct_test_123',
        {
          chargesEnabled: true,
          payoutsEnabled: true,
          requirements: accountUpdatedEvent.data.object.requirements,
          detailsSubmitted: true,
          onboardedAt: expect.any(Date),
        }
      );
    });

    it('should handle payment_intent.succeeded webhook successfully', async () => {
      const paymentSucceededEvent = {
        id: 'evt_test_456',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_456',
            amount: 10000,
            amount_received: 10000,
            currency: 'usd',
            payment_method: 'pm_test_123',
            customer: 'cus_test_123',
          },
        },
      };

      const mockBooking = { id: 'booking_123' };

      mockStripeService.constructEvent.mockReturnValue(paymentSucceededEvent);
      mockPaymentRepository.createWebhookLog.mockResolvedValue({ id: 'log_456' });
      mockPaymentRepository.updateWebhookLogStatus.mockResolvedValue({});
      mockPaymentRepository.updatePaymentStatus.mockResolvedValue({});
      mockPaymentRepository.getBookingByPaymentIntentId.mockResolvedValue(mockBooking);
      mockPaymentRepository.updateBookingStatus.mockResolvedValue({});

      const response = await request(app.getHttpServer())
        .post('/webhooks/stripe')
        .set('stripe-signature', 'test_signature')
        .send(paymentSucceededEvent)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({ received: true });
      expect(mockPaymentRepository.updatePaymentStatus).toHaveBeenCalledWith(
        'pi_test_456',
        'succeeded',
        {
          amount_received: 10000,
          currency: 'usd',
          payment_method: 'pm_test_123',
          customer: 'cus_test_123',
        }
      );
      expect(mockPaymentRepository.updateBookingStatus).toHaveBeenCalledWith(
        'booking_123',
        'confirmed'
      );
    });

    it('should handle payment_intent.payment_failed webhook successfully', async () => {
      const paymentFailedEvent = {
        id: 'evt_test_789',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_789',
            last_payment_error: {
              code: 'card_declined',
              message: 'Your card was declined.',
            },
          },
        },
      };

      const mockBooking = { id: 'booking_456' };

      mockStripeService.constructEvent.mockReturnValue(paymentFailedEvent);
      mockPaymentRepository.createWebhookLog.mockResolvedValue({ id: 'log_789' });
      mockPaymentRepository.updateWebhookLogStatus.mockResolvedValue({});
      mockPaymentRepository.updatePaymentStatus.mockResolvedValue({});
      mockPaymentRepository.getBookingByPaymentIntentId.mockResolvedValue(mockBooking);
      mockPaymentRepository.updateBookingStatus.mockResolvedValue({});

      const response = await request(app.getHttpServer())
        .post('/webhooks/stripe')
        .set('stripe-signature', 'test_signature')
        .send(paymentFailedEvent)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({ received: true });
      expect(mockPaymentRepository.updatePaymentStatus).toHaveBeenCalledWith(
        'pi_test_789',
        'failed',
        {
          error: paymentFailedEvent.data.object.last_payment_error,
          failure_code: 'card_declined',
          failure_message: 'Your card was declined.',
        }
      );
      expect(mockPaymentRepository.updateBookingStatus).toHaveBeenCalledWith(
        'booking_456',
        'payment_failed'
      );
    });

    it('should handle unhandled event types gracefully', async () => {
      const unhandledEvent = {
        id: 'evt_test_999',
        type: 'customer.created',
        data: {
          object: {
            id: 'cus_test_999',
          },
        },
      };

      mockStripeService.constructEvent.mockReturnValue(unhandledEvent);
      mockPaymentRepository.createWebhookLog.mockResolvedValue({ id: 'log_999' });
      mockPaymentRepository.updateWebhookLogStatus.mockResolvedValue({});

      const response = await request(app.getHttpServer())
        .post('/webhooks/stripe')
        .set('stripe-signature', 'test_signature')
        .send(unhandledEvent)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({ received: true });
    });

    it('should handle webhook signature verification failure', async () => {
      mockStripeService.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });
      mockPaymentRepository.createWebhookLog.mockResolvedValue({ id: 'log_error' });
      mockPaymentRepository.updateWebhookLogStatus.mockResolvedValue({});

      const response = await request(app.getHttpServer())
        .post('/webhooks/stripe')
        .set('stripe-signature', 'invalid_signature')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.error).toContain('Webhook Error: Invalid signature');
      expect(mockPaymentRepository.updateWebhookLogStatus).toHaveBeenCalledWith(
        'log_error',
        'failed',
        'Invalid signature'
      );
    });

    it('should handle database errors gracefully', async () => {
      const accountUpdatedEvent = {
        id: 'evt_test_error',
        type: 'account.updated',
        data: {
          object: {
            id: 'acct_test_error',
            charges_enabled: true,
            payouts_enabled: true,
            requirements: {},
            details_submitted: true,
          },
        },
      };

      mockStripeService.constructEvent.mockReturnValue(accountUpdatedEvent);
      mockPaymentRepository.createWebhookLog.mockResolvedValue({ id: 'log_error' });
      mockPaymentRepository.updateWebhookLogStatus.mockResolvedValue({});
      mockPaymentRepository.updateStripeConnectAccountStatus.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app.getHttpServer())
        .post('/webhooks/stripe')
        .set('stripe-signature', 'test_signature')
        .send(accountUpdatedEvent)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({ received: true });
    });
  });
});