






















import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  ITelematicsAdapter,
  TelematicsEventType
} from './adapters/telematics.adapter';
import { MockTelematicsAdapter } from './adapters/mock-telematics.adapter';

@Injectable()
export class TelematicsService implements OnModuleInit {
  private adapter: ITelematicsAdapter;
  private eventHandlers: Array<(event: any) => void | Promise<void>> = [];

  constructor() {
    // In production, this would be configured based on environment variables
    this.adapter = new MockTelematicsAdapter();
  }

  async onModuleInit(): Promise<void> {
    await this.adapter.init({});
    this.startListening();
  }

  /**
   * Send a command to the telematics device (e.g., unlock/lock vehicle)
   */
  async sendCommand(deviceId: string, command: string, payload?: Record<string, any>) {
    return this.adapter.sendCommand(deviceId, command, payload);
  }

  /**
   * Unlock a vehicle using keyless entry
   */
  async unlockVehicle(deviceId: string): Promise<any> {
    return this.sendCommand(deviceId, 'unlock');
  }

  /**
   * Lock a vehicle using keyless entry
   */
  async lockVehicle(deviceId: string): Promise<any> {
    return this.sendCommand(deviceId, 'lock');
  }

  /**
   * Register an event handler to receive telematics events
   */
  registerEventHandler(handler: (event: any) => void | Promise<void>) {
    if (!this.eventHandlers.includes(handler)) {
      this.eventHandlers.push(handler);
    }
  }

  /**
   * Unregister an event handler
   */
  unregisterEventHandler(handler: (event: any) => void | Promise<void>) {
    const index = this.eventHandlers.indexOf(handler);
    if (index !== -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Start listening for telematics events
   */
  private startListening() {
    // Forward all incoming events to registered handlers
    this.adapter.listen(async (event: any) => {
      try {
        await Promise.all(this.eventHandlers.map(handler => handler(event)));
      } catch (error) {
        console.error('Error processing telematics event:', error);
      }
    });
  }

  /**
   * Stop listening for events
   */
  stopListening() {
    this.adapter.stopListening();
  }
}


















