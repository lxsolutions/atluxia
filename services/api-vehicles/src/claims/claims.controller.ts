






















import { Controller, Post, Body } from '@nestjs/common';
import { ClaimsService } from './claims.service';

@Controller('api/v1/claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post('create')
  async createClaim(@Body() body: any) {
    try {
      const claim = await this.claimsService.createClaim(body);
      return { success: true, data: claim };
    } catch (error) {
      console.error('Error creating claim:', error);
      return { error: 'Failed to create claim' };
    }
  }

  @Post('generate-pack')
  async generateClaimPack(@Body() body: any) {
    try {
      const pdfBuffer = await this.claimsService.generateClaimPack(body.claimId);

      // In production, we'd return a file stream or download link
      // For demo purposes, convert to base64 string for API response
      const base64Pdf = Buffer.from(pdfBuffer).toString('base64');

      return {
        success: true,
        message: 'Claim pack generated successfully',
        pdfBase64: base64Pdf,
        sizeBytes: pdfBuffer.length
      };
    } catch (error) {
      console.error('Error generating claim pack:', error);
      return { error: 'Failed to generate claim pack' };
    }
  }

  @Post('demo')
  async demoClaimPack() {
    try {
      // Create a sample claim for demonstration
      const demoClaim = await this.claimsService.createClaim({
        bookingId: 'demo-booking-123',
        description: 'Simulated bumper scratch detected during check-out',
        status: 'PENDING_REVIEW',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const pdfBuffer = await this.claimsService.generateClaimPack(demoClaim.id);

      return {
        success: true,
        message: 'Demo claim pack generated successfully',
        claimId: demoClaim.id
      };
    } catch (error) {
      console.error('Error in demo claim generation:', error);
      return { error: 'Demo failed' };
    }
  }
}






















