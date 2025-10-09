import { connect, StringCodec, NatsConnection } from 'nats';
import { TruthGraphDB } from '../db';
import { nanoid } from 'nanoid';

// NATS connection and codec
let natsConnection: NatsConnection | null = null;
const sc = StringCodec();

// Event types
export interface TruthEvent {
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
  // Emit a truth event
  static async emitEvent(event: TruthEvent): Promise<void> {
    if (!natsConnection) {
      throw new Error('NATS connection not initialized');
    }

    try {
      const subject = `truth.${event.objectType}.${event.type}`;
      const eventData = JSON.stringify(event);
      
      await natsConnection.publish(subject, sc.encode(eventData));
      
      // Also store in database for reliability
      await TruthGraphDB.emitEvent({
        id: `${event.objectType}_${event.objectId}_${Date.now()}`,
        event_type: event.type,
        object_type: event.objectType,
        object_id: event.objectId,
        emitted_at: new Date(),
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

  // Emit transparency record for truth operations
  static async emitTransparencyRecord(event: TruthEvent): Promise<void> {
    if (!natsConnection) {
      return;
    }

    try {
      const transparencyRecord = {
        id: `transparency_truth_${event.objectType}_${event.type}_${nanoid()}`,
        type: `truth_${event.objectType}_${event.type}`,
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
      console.log(`Emitted transparency record: truth_${event.objectType}_${event.type}`);
    } catch (error) {
      console.error('Failed to emit transparency record:', error);
    }
  }

  // Emit claim created event
  static async emitClaimCreated(claim: any): Promise<void> {
    await this.emitEvent({
      type: 'created',
      objectType: 'claim',
      objectId: claim.id,
      timestamp: new Date().toISOString(),
      data: claim,
    });
  }

  // Emit claim updated event
  static async emitClaimUpdated(claim: any, previousVersion: any): Promise<void> {
    await this.emitEvent({
      type: 'updated',
      objectType: 'claim',
      objectId: claim.id,
      timestamp: new Date().toISOString(),
      data: {
        current: claim,
        previous: previousVersion,
        changes: this.getObjectChanges(previousVersion, claim),
      },
    });
  }

  // Emit evidence added event
  static async emitEvidenceAdded(evidence: any, claimId: string): Promise<void> {
    await this.emitEvent({
      type: 'added',
      objectType: 'evidence',
      objectId: evidence.id,
      timestamp: new Date().toISOString(),
      data: {
        evidence,
        claimId,
      },
    });
  }

  // Emit counterclaim added event
  static async emitCounterclaimAdded(counterclaim: any): Promise<void> {
    await this.emitEvent({
      type: 'added',
      objectType: 'counterclaim',
      objectId: counterclaim.id,
      timestamp: new Date().toISOString(),
      data: counterclaim,
    });
  }

  // Emit playful signal added event
  static async emitPlayfulSignalAdded(signal: any): Promise<void> {
    await this.emitEvent({
      type: 'added',
      objectType: 'playful_signal',
      objectId: signal.id,
      timestamp: new Date().toISOString(),
      data: signal,
    });
  }

  // Process pending events (for reliability)
  static async processPendingEvents(): Promise<void> {
    if (!natsConnection) {
      return;
    }

    try {
      const pendingEvents = await TruthGraphDB.getPendingEvents(50);
      
      for (const event of pendingEvents) {
        try {
          // Re-emit the event
          const subject = `truth.${event.object_type}.${event.event_type}`;
          
          // For simplicity, we'll just emit a generic event
          // In a real implementation, you'd fetch the actual object data
          const eventData: TruthEvent = {
            type: event.event_type,
            objectType: event.object_type,
            objectId: event.object_id,
            timestamp: event.emitted_at ? event.emitted_at.toISOString() : new Date().toISOString(),
            data: { id: event.object_id },
          };
          
          await natsConnection.publish(subject, sc.encode(JSON.stringify(eventData)));
          await TruthGraphDB.markEventProcessed(event.id);
          
          console.log(`Re-emitted pending event: ${event.id}`);
        } catch (error) {
          console.error(`Failed to process pending event ${event.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to process pending events:', error);
    }
  }

  // Helper to get object changes
  private static getObjectChanges(previous: any, current: any): string[] {
    const changes: string[] = [];
    
    if (!previous) return ['Initial creation'];
    
    for (const key in current) {
      if (JSON.stringify(previous[key]) !== JSON.stringify(current[key])) {
        changes.push(`${key} changed`);
      }
    }
    
    return changes.length > 0 ? changes : ['No detectable changes'];
  }

  // Health check
  static async healthCheck(): Promise<boolean> {
    return natsConnection !== null && !natsConnection.isClosed();
  }
}