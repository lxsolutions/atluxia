import { Injectable, Logger } from '@nestjs/common';
import { ShareEvent } from '@atluxia/contracts';
import { ISharePublisher } from '../ports/ishare-publisher.port';

@Injectable()
export class HttpSharePublisher implements ISharePublisher {
  private readonly logger = new Logger(HttpSharePublisher.name);
  private readonly relayUrl = process.env.RELAY_URL || 'http://localhost:8080';

  async publish(shareEvent: ShareEvent): Promise<void> {
    try {
      const response = await fetch(`${this.relayUrl}/events/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareEvent),
      });

      if (!response.ok) {
        throw new Error(`Failed to publish share event: ${response.statusText}`);
      }

      this.logger.log(`Successfully published share event for item ${shareEvent.itemId}`);
    } catch (error) {
      this.logger.error(`Failed to publish share event: ${error.message}`);
      // In a real implementation, we might want to retry or use a fallback
      throw error;
    }
  }
}