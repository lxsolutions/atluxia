






















import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../utils/prisma.service';
import {
  calculateSSIM,
  generateDifferenceImage
} from '../utils/image-processing';

@Injectable()
export class ClaimsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new claim record
   */
  async createClaim(data: any) {
    return this.prisma.claim.create({
      data,
    });
  }

  /**
   * Get all claims for a vehicle or user
   */
  async getClaims(filter?: any) {
    return this.prisma.claim.findMany({ where: filter });
  }

  /**
   * Generate a claim pack (PDF with photos, odometer readings, and damage analysis)
   */
  async generateClaimPack(claimId: string): Promise<Buffer> {
    try {
      const claim = await this.prisma.claim.findUnique({
        where: { id: claimId },
        include: {
          booking: {
            include: {
              vehicle: true,
              guest: { select: { name: true, email: true } },
              host: { select: { name: true, email: true } }
            }
          },
          checkpoints: {
            orderBy: { timestamp: 'asc' },
            take: 10 // Limit to recent checkpoints
          }
        }
      });

      if (!claim) {
        throw new Error('Claim not found');
      }

      // Get before and after photos for comparison (if available)
      const beforePhotos = claim.checkpoints.filter(cp => cp.type === 'CHECK_IN')
        .map(cp => cp.photos);
      const afterPhotos = claim.checkpoints.filter(cp => cp.type === 'CHECK_OUT')
        .map(cp => cp.photos);

      // Generate comparison images and SSIM analysis
      let comparisonResults = [];
      if (beforePhotos.length > 0 && afterPhotos.length > 0) {
        for (let i = 0; i < Math.min(beforePhotos[0].length, afterPhotos[0].length); i++) {
          const beforePhoto = await this.getPhotoBuffer(beforePhotos[0][i]);
          const afterPhoto = await this.getPhotoBuffer(afterPhotos[0][i]);

          if (beforePhoto && afterPhoto) {
            const similarity = await calculateSSIM(beforePhoto, afterPhoto);
            const diffImage = await generateDifferenceImage(beforePhoto, afterPhoto);

            comparisonResults.push({
              position: beforePhotos[0][i].position,
              similarity,
              diffImage
            });
          }
        }
      }

      // Generate PDF content (simplified for demo)
      return this.generatePDF(claim, comparisonResults);
    } catch (error) {
      console.error('Error generating claim pack:', error);
      throw new Error('Failed to generate claim pack');
    }
  }

  /**
   * Get photo buffer from S3 or local storage
   */
  private async getPhotoBuffer(photoId: string): Promise<Buffer | null> {
    // In production, this would fetch the image from S3 or other storage

    // For demo purposes, return a simulated buffer with placeholder content
    if (Math.random() > 0.1) { // Simulate some failures for variety
      const width = 800;
      const height = 600;

      return await sharp({
        create: {
          width,
          height,
          channels: 3,
          background: '#ccc',
        }
      })
      .composite([
        {
          input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
            <rect width="100%" height="100%" fill="#f8f9fa"/>
            <text x="50%" y="40%" font-family="Arial" font-size="48" text-anchor="middle" fill="#333">
              ${photoId.slice(0, 6)}...
            </text>
          </svg>`),
          top: 0,
          left: 0,
        }
      ])
      .toBuffer();
    } else {
      return null;
    }
  }

  /**
   * Generate PDF document for claim pack
   */
  private async generatePDF(claim, comparisonResults): Promise<Buffer> {
    // In production, this would use a proper PDF generation library like Puppeteer or pdf-lib

    const content = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2, h3 { color: #333; }
    .section { margin-bottom: 40px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .damage-analysis img { max-width: 300px; height: auto; margin-bottom: 5px; }
  </style>
</head>
<body>

<h1>Claim Pack - ${claim.id}</h1>

<div class="section">
  <h2>Booking Details</h2>
  <table>
    <tr><th>Vehicle:</th><td>${claim.booking.vehicle.make} ${claim.booking.vehicle.model} (${claim.booking.vehicle.year})</td></tr>
    <tr><th>Guest:</th><td>${claim.booking.guest.name}</td></tr>
    <tr><th>Host:</th><td>${claim.booking.host.name}</td></tr>
    <tr><th>Booking Dates:</th><td>${new Date(claim.booking.startDate).toLocaleDateString()} - ${new Date(claim.booking.endDate).toLocaleDateString()}</td></tr>
  </table>
</div>

<div class="section">
  <h2>Claim Details</h2>
  <p><strong>Reported:</strong> ${new Date(claim.createdAt).toLocaleString()}</p>
  <p><strong>Status:</strong> ${claim.status}</p>
  <p><strong>Description:</strong> ${claim.description || 'No description provided'}</p>
</div>

<div class="section">
  <h2>Damage Analysis</h2>
  ${
    comparisonResults.length > 0 ?
      comparisonResults.map((result, index) => `
        <div class="damage-analysis">
          <h3>Position: ${result.position || 'Unknown'}</h3>
          <p><strong>Similarity Score:</strong> ${(result.similarity * 100).toFixed(2)}%</p>
          ${
            result.diffImage ?
              `<img src="data:image/png;base64,${Buffer.from(result.diffImage).toString('base64')}" alt="Damage comparison for ${result.position}">` :
              '<p>No comparison image available</p>'
          }
        </div>
      `).join('') : `
    <p>No damage analysis available. Please check the photos in the booking records.</p>
  `}

</div>

<div class="section">
  <h2>Odometer & Fuel Readings</h2>
  ${
    claim.checkpoints.length > 0 ?
      `<table>
        <tr><th>Checkpoint Type</th><th>Date/Time</th><th>Odometer (mi)</th><th>Fuel Level (%)</th></tr>
        ${claim.checkpoints.map(cp => `
          <tr>
            <td>${cp.type}</td>
            <td>${new Date(cp.timestamp).toLocaleString()}</td>
            <td>${cp.odometerReading || 'N/A'}</td>
            <td>${cp.fuelLevel || 'N/A'}</td>
          </tr>
        `).join('')}
      </table>` : `
    <p>No checkpoint data available.</p>
  `}
</div>

<div class="section">
  <h2>Photos from Checkpoints</h2>
  ${
    claim.checkpoints.length > 0 ?
      `<table>
        ${claim.checkpoints.map(cp => `
          <tr><th colspan="3">${cp.type} - ${new Date(cp.timestamp).toLocaleString()}</th></tr>
          <tr>
            ${cp.photos.slice(0, 4).map(photo => `
              <td style="padding: 5px;">
                <img src="data:image/png;base64,${Buffer.from('placeholder').toString('base64')}" width="150" alt="${photo.position || 'Photo'}">
                <div style="text-align: center;">${photo.position || 'Unknown'}</div>
              </td>
            `).join('')}
          </tr>
        `).join('')}
      </table>` : `
    <p>No photos available.</p>
  `}
</div>

<footer>
  <hr/>
  <p>Generated by Keyswitch Claims System - ${new Date().toLocaleString()}</p>
</footer>

</body>
</html>
`;

    // Convert HTML to PDF using Puppeteer (simplified for demo)
    return this.htmlToPdf(content);
  }

  /**
   * Convert HTML content to PDF
   */
  private async htmlToPdf(htmlContent: string): Promise<Buffer> {
    // In production, we'd use a proper library like puppeteer or pdf-lib

    // For demo purposes, let's simulate by creating a placeholder with text
    const width = 800;
    const height = 1200;

    return await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      }
    })
    .composite([
      {
        input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <rect width="100%" height="100%" fill="#fff"/>
          <text x="50%" y="40%" font-family="Arial" font-size="64" text-anchor="middle" fill="#333">
            Claim Pack
          </text>
          <text x="50%" y="80%" font-family="Arial" font-size="24" text-anchor="middle" fill="#666">
            ${htmlContent.slice(10, 100)}...
          </text>
        </svg>`),
        top: 0,
        left: 0,
      }
    ])
    .toBuffer();
  }
}


















