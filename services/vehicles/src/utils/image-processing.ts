























import sharp from 'sharp';

/**
 * Calculate Structural Similarity Index (SSIM) between two images
 */
export async function calculateSSIM(image1Buffer: Buffer, image2Buffer: Buffer): Promise<number> {
  try {
    // Convert images to grayscale for comparison
    const img1 = await sharp(image1Buffer).grayscale().toBuffer();
    const img2 = await sharp(image2Buffer).grayscale().toBuffer();

    // Calculate SSIM using a simple approach (this would be more sophisticated in production)
    // In a real implementation, we'd use a dedicated library like ssim.js or OpenCV
    // For this demo, we'll simulate an SSIM score between 0 and 1

    const similarity = Math.random() * 0.3 + 0.4; // Simulate scores between 0.4 and 0.7 for demo

    return similarity;
  } catch (error) {
    console.error('Error calculating SSIM:', error);
    throw new Error('Failed to calculate image similarity');
  }
}

/**
 * Generate a difference visualization between two images
 */
export async function generateDifferenceImage(image1Buffer: Buffer, image2Buffer: Buffer): Promise<Buffer> {
  try {
    // In production, this would create an actual visual diff using libraries like sharp or OpenCV

    // For demo purposes, we'll simulate by creating a placeholder with text
    const width = 800;
    const height = 600;

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
          <rect width="100%" height="100%" fill="#f8f9fa"/>
          <text x="50%" y="40%" font-family="Arial" font-size="48" text-anchor="middle" fill="#333">
            Damage Comparison
          </text>
          <rect width="70%" height="2px" x="15%" y="60%" fill="#ddd"/>
        </svg>`),
        top: 0,
        left: 0,
      }
    ])
    .toBuffer();
  } catch (error) {
    console.error('Error generating difference image:', error);
    throw new Error('Failed to generate difference visualization');
  }
}



















