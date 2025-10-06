




















import { Injectable } from '@nestjs/common';
import {
  ITelematicsAdapter,
  TelematicsEventType,
  TelematicsEvent
} from './telematics.adapter';

@Injectable()
export class MockTelematicsAdapter implements ITelematicsAdapter {
  private eventHandler: ((event: TelematicsEvent) => void | Promise<void>) | null = null;
  private listening = false;

  async init(options?: Record<string, any>): Promise<void> {
    console.log('MockTelematicsAdapter initialized with options:', options);
    // In a real implementation, this would connect to the telematics provider
  }

  async sendCommand(deviceId: string, command: string, payload?: Record<string, any>): Promise<any> {
    console.log(`Mock command sent: device=${deviceId}, command=${command}`, payload);

    if (command === 'unlock') {
      // Simulate unlock response after a delay
      return new Promise(resolve => setTimeout(() => {
        resolve({
          success: true,
          message: `Vehicle unlocked for device ${deviceId}`,
          timestamp: new Date()
        });
      }, 500));
    } else if (command === 'lock') {
      // Simulate lock response after a delay
      return new Promise(resolve => setTimeout(() => {
        resolve({
          success: true,
          message: `Vehicle locked for device ${deviceId}`,
          timestamp: new Date()
        });
      }, 500));
    } else {
      throw new Error(`Unknown command: ${command}`);
    }
  }

  listen(eventHandler: (event: TelematicsEvent) => void | Promise<void>): void {
    if (!this.listening) {
      this.eventHandler = eventHandler;
      this.listening = true;

      // Simulate periodic location updates
      setInterval(() => {
        const deviceId = 'mock-device-123';
        const vehicleVin = '1HGBH41JXMN004152';

        if (this.eventHandler) {
          this.eventHandler({
            eventType: TelematicsEventType.LOCATION_UPDATE,
            deviceId,
            vehicleVin,
            timestamp: new Date(),
            payload: {
              latitude: 34.0522 + Math.random() * 0.1 - 0.05, // Random movement around LAX
              longitude: -118.2437 + Math.random() * 0.1 - 0.05,
              accuracy: 5,
              speed: (Math.random() * 60).toFixed(1)
            }
          });
        }
      }, 10000); // Every 10 seconds

      console.log('MockTelematicsAdapter started listening for events');
    }
  }

  stopListening(): void {
    if (this.listening) {
      this.eventHandler = null;
      this.listening = false;
      console.log('MockTelematicsAdapter stopped listening for events');
    }
  }
}
















