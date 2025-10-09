import { connect, StringCodec, NatsConnection } from 'nats';
import { ReputationLensesDB } from '../db';
import { nanoid } from 'nanoid';

// NATS connection and codec
let natsConnection: NatsConnection | null = null;
const sc = StringCodec();

// Event types
export interface ReputationEvent {
  type: string;
  objectType: string;
  objectId: string;
  timestamp: string;
  data: any;
}

// Initialize NATS connection
export async function initializeNATS(): Promise<void> {
  try {
    const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';
    natsConnection = await connect({ servers: natsUrl });
    console.log('Connected to NATS server');
  } catch (error) {
    console.error('Failed to connect to NATS:', error);
    throw error;
  }
}

// Close NATS connection
export async function closeNATS(): Promise<void> {
  if (natsConnection) {
    await natsConnection.close();
    natsConnection = null;
  }
}

// Event emission service
export class EventService {
  // Emit a reputation event
  static async emitEvent(event: ReputationEvent): Promise<void> {
    if (!natsConnection) {
      throw new Error('NATS connection not initialized');
    }

    try {
      const subject = `reputation.${event.objectType}.${event.type}`;
      const eventData = JSON.stringify(event);
      
      await natsConnection.publish(subject, sc.encode(eventData));
      
      // Also store in database for reliability
      await ReputationLensesDB.emitEvent({
        id: `${event.objectType}_${event.objectId}_${Date.now()}`,
        eventType: event.type,
        objectType: event.objectType,
        objectId: event.objectId,
        emittedAt: new Date(),
        processed: false,
      });

      // Emit transparency record
      await this.emitTransparencyRecord(event);

      console.log(`Event emitted: ${subject}`);
    } catch (error) {
      console.error('Failed to emit event:', error);
      throw error;
    }
  }

  // Emit transparency record for reputation operations
  static async emitTransparencyRecord(event: ReputationEvent): Promise<void> {
    if (!natsConnection) {
      return;
    }

    try {
      const transparencyRecord = {
        id: `transparency_reputation_${event.objectType}_${event.type}_${nanoid()}`,
        type: `reputation_${event.objectType}_${event.type}`,
        timestamp: new Date().toISOString(),
        data: {
          objectType: event.objectType,
          objectId: event.objectId,
          eventType: event.type,
          timestamp: event.timestamp,
          metadata: event.data
        },
        signature: `signature_${nanoid()}` // In production, this would be a proper cryptographic signature
      };

      await natsConnection.publish('transparency.records', sc.encode(JSON.stringify(transparencyRecord)));
      console.log(`Emitted transparency record: reputation_${event.objectType}_${event.type}`);
    } catch (error) {
      console.error('Failed to emit transparency record:', error);
    }
  }

  // Emit lens created event
  static async emitLensCreated(lens: any): Promise<void> {
    await this.emitEvent({
      type: 'created',
      objectType: 'lens',
      objectId: lens.id,
      timestamp: new Date().toISOString(),
      data: lens,
    });
  }

  // Emit lens run completed event
  static async emitLensRunCompleted(lensRun: any): Promise<void> {
    await this.emitEvent({
      type: 'completed',
      objectType: 'lens_run',
      objectId: lensRun.id,
      timestamp: new Date().toISOString(),
      data: lensRun,
    });
  }

  // Emit reputation updated event
  static async emitReputationUpdated(reputation: any): Promise<void> {
    await this.emitEvent({
      type: 'updated',
      objectType: 'reputation',
      objectId: reputation.id,
      timestamp: new Date().toISOString(),
      data: reputation,
    });
  }

  // Emit merit transaction event
  static async emitMeritTransaction(transaction: any): Promise<void> {
    await this.emitEvent({
      type: 'created',
      objectType: 'merit_transaction',
      objectId: transaction.id,
      timestamp: new Date().toISOString(),
      data: transaction,
    });
  }

  // Emit lens calibration event
  static async emitLensCalibration(calibration: any): Promise<void> {
    await this.emitEvent({
      type: 'completed',
      objectType: 'lens_calibration',
      objectId: calibration.id,
      timestamp: new Date().toISOString(),
      data: calibration,
    });
  }

  // Process pending events (for reliability)
  static async processPendingEvents(): Promise<void> {
    if (!natsConnection) {
      return;
    }

    try {
      const pendingEvents = await ReputationLensesDB.getPendingEvents(50);
      
      for (const event of pendingEvents) {
        try {
          // Re-emit the event
          const subject = `reputation.${event.objectType}.${event.eventType}`;
          
          // For simplicity, we'll just emit a generic event
          // In a real implementation, you'd fetch the actual object data
          const eventData: ReputationEvent = {
            type: event.eventType,
            objectType: event.objectType,
            objectId: event.objectId,
            timestamp: event.emittedAt ? event.emittedAt.toISOString() : new Date().toISOString(),
            data: { id: event.objectId },
          };
          
          await natsConnection.publish(subject, sc.encode(JSON.stringify(eventData)));
          await ReputationLensesDB.markEventProcessed(event.id);
          
          console.log(`Re-emitted pending event: ${event.id}`);
        } catch (error) {
          console.error(`Failed to process pending event ${event.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to process pending events:', error);
    }
  }

  // Health check
  static async healthCheck(): Promise<boolean> {
    return natsConnection !== null && !natsConnection.isClosed();
  }
}