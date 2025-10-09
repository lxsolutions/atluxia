import { connect, StringCodec, NatsConnection } from 'nats';
import { TruthAgentDB } from '../db';
import { nanoid } from 'nanoid';

// NATS connection and codec
let natsConnection: NatsConnection | null = null;
const sc = StringCodec();

// Event types
export interface TruthAgentEvent {
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
  // Emit a truth agent event
  static async emitEvent(event: TruthAgentEvent): Promise<void> {
    if (!natsConnection) {
      throw new Error('NATS connection not initialized');
    }

    try {
      const subject = `truth_agent.${event.objectType}.${event.type}`;
      const eventData = JSON.stringify(event);
      
      await natsConnection.publish(subject, sc.encode(eventData));
      
      // Also store in database for reliability
      await TruthAgentDB.emitEvent({
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

  // Emit transparency record for truth agent operations
  static async emitTransparencyRecord(event: TruthAgentEvent): Promise<void> {
    if (!natsConnection) {
      return;
    }

    try {
      const transparencyRecord = {
        id: `transparency_truth_agent_${event.objectType}_${event.type}_${nanoid()}`,
        type: `truth_agent_${event.objectType}_${event.type}`,
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
      console.log(`Emitted transparency record: truth_agent_${event.objectType}_${event.type}`);
    } catch (error) {
      console.error('Failed to emit transparency record:', error);
    }
  }

  // Emit agent created event
  static async emitAgentCreated(agent: any): Promise<void> {
    await this.emitEvent({
      type: 'created',
      objectType: 'truth_agent',
      objectId: agent.id,
      timestamp: new Date().toISOString(),
      data: agent,
    });
  }

  // Emit agent run completed event
  static async emitAgentRunCompleted(agentRun: any): Promise<void> {
    await this.emitEvent({
      type: 'completed',
      objectType: 'agent_run',
      objectId: agentRun.id,
      timestamp: new Date().toISOString(),
      data: agentRun,
    });
  }

  // Emit citation extracted event
  static async emitCitationExtracted(citation: any): Promise<void> {
    await this.emitEvent({
      type: 'extracted',
      objectType: 'citation',
      objectId: citation.id,
      timestamp: new Date().toISOString(),
      data: citation,
    });
  }

  // Emit source credibility updated event
  static async emitSourceCredibilityUpdated(source: any): Promise<void> {
    await this.emitEvent({
      type: 'updated',
      objectType: 'source_credibility',
      objectId: source.id,
      timestamp: new Date().toISOString(),
      data: source,
    });
  }

  // Process pending events (for reliability)
  static async processPendingEvents(): Promise<void> {
    if (!natsConnection) {
      return;
    }

    try {
      const pendingEvents = await TruthAgentDB.getPendingEvents(50);
      
      for (const event of pendingEvents) {
        try {
          // Re-emit the event
          const subject = `truth_agent.${event.objectType}.${event.eventType}`;
          
          // For simplicity, we'll just emit a generic event
          // In a real implementation, you'd fetch the actual object data
          const eventData: TruthAgentEvent = {
            type: event.eventType,
            objectType: event.objectType,
            objectId: event.objectId,
            timestamp: event.emittedAt ? event.emittedAt.toISOString() : new Date().toISOString(),
            data: { id: event.objectId },
          };
          
          await natsConnection.publish(subject, sc.encode(JSON.stringify(eventData)));
          await TruthAgentDB.markEventProcessed(event.id);
          
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