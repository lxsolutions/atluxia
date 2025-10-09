






















import { Controller, Post, Body } from '@nestjs/common';
import { TelematicsService } from './telematics.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly telematicsService: TelematicsService) {}

  @Post('keyless-entry')
  async handleKeylessEntryRequest(@Body() body: any) {
    const { deviceId, action } = body;

    if (!deviceId || !action) {
      return { error: 'Missing required parameters (deviceId and action)' };
    }

    try {
      let result;
      switch(action.toLowerCase()) {
        case 'unlock':
          result = await this.telematicsService.unlockVehicle(deviceId);
          break;
        case 'lock':
          result = await this.telematicsService.lockVehicle(deviceId);
          break;
        default:
          return { error: `Unknown action: ${action}` };
      }

      return {
        success: true,
        message: `${action.charAt(0).toUpperCase() + action.slice(1)} successful`,
        result
      };

    } catch (error) {
      console.error('Error processing keyless entry request:', error);
      return { error: 'Failed to process keyless entry request' };
    }
  }
}


















