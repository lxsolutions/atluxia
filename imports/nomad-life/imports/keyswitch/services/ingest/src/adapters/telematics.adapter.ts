



















import { Injectable } from '@nestjs/common';

export enum TelematicsEventType {
  VEHICLE_UNLOCK = 'vehicle_unlock',
  VEHICLE_LOCK = 'vehicle_lock',
  LOCATION_UPDATE = 'location_update',
  IGNITION_STATUS = 'ignition_status',
  FUEL_LEVEL = 'fuel_level',
  BATTERY_STATUS = 'battery_status', // For EVs
}

export interface TelematicsEvent {
  eventType: TelematicsEventType;
  deviceId: string; // Unique identifier for the telematics device
  vehicleVin?: string; // Vehicle identification number (optional)
  timestamp: Date;
  payload: Record<string, any>; // Event-specific data
}

export interface ITelematicsAdapter {
  /**
   * Initialize the adapter with configuration options
   */
  init(options: Record<string, any>): Promise<void>;

  /**
   * Send a command to the telematics device (e.g., unlock/lock vehicle)
   */
  sendCommand(deviceId: string, command: string, payload?: Record<string, any>): Promise<any>;

  /**
   * Listen for incoming events from the telematics provider
   */
  listen(eventHandler: (event: TelematicsEvent) => void | Promise<void>): void;

  /**
   * Stop listening for events
   */
  stopListening(): void;
}















