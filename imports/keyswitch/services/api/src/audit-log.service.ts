


















import { Injectable } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log an airport-related event (pickup/dropoff)
   */
  async logAirportEvent({
    eventType,
    userId,
    vehicleId,
    listingId,
    bookingId,
    airportCode,
    location,
    metadata = {}
  }: {
    eventType: string;
    userId?: string;
    vehicleId?: string;
    listingId?: string;
    bookingId?: string;
    airportCode: string;
    location: { latitude: number; longitude: number };
    metadata?: Record<string, any>;
  }) {
    return this.prisma.auditLog.create({
      data: {
        eventType,
        userId,
        vehicleId,
        listingId,
        bookingId,
        airportCode,
        location: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        },
        metadata
      }
    });
  }

  /**
   * Get all audit logs for an airport
   */
  async getAirportAuditLogs(airportCode: string) {
    return this.prisma.auditLog.findMany({
      where: { airportCode },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get audit logs by booking ID for compliance verification
   */
  async getBookingAuditLogs(bookingId: string) {
    return this.prisma.auditLog.findMany({
      where: { bookingId },
      include: {
        user: true,
        vehicle: true,
        listing: true,
        booking: true
      }
    });
  }

  /**
   * Verify that a pickup/dropoff event complies with airport rules
   */
  async verifyAirportCompliance(bookingId: string): Promise<boolean> {
    const logs = await this.getBookingAuditLogs(bookingId);

    // Basic compliance check - ensure both pickup and dropoff are logged
    if (logs.length < 2) return false;

    const pickupLog = logs.find(log => log.eventType === 'airport_pickup');
    const dropoffLog = logs.find(log => log.eventType === 'airport_dropoff');

    // Check that both events exist and have valid locations
    if (!pickupLog || !dropoffLog) return false;
    if (!pickupLog.location || !dropoffLog.location) return false;

    return true; // Basic compliance check passed
  }
}














