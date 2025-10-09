




















import { Controller, Get } from '@nestjs/common';
import { TelematicsService } from './telematics.service';

@Controller('demo')
export class DemoController {
  constructor(private readonly telematicsService: TelematicsService) {}

  @Get('unlock/:deviceId')
  async unlockVehicle(@Param() params): Promise<any> {
    try {
      const result = await this.telematicsService.unlockVehicle(params.deviceId);
      return { success: true, message: 'Vehicle unlocked', result };
    } catch (error) {
      return { error: `Failed to unlock vehicle: ${error.message}` };
    }
  }

  @Get('lock/:deviceId')
  async lockVehicle(@Param() params): Promise<any> {
    try {
      const result = await this.telematicsService.lockVehicle(params.deviceId);
      return { success: true, message: 'Vehicle locked', result };
    } catch (error) {
      return { error: `Failed to lock vehicle: ${error.message}` };
    }
  }

  @Get('status')
  getStatus(): any {
    return {
      status: 'Telematics demo service running',
      adapter: 'MockTelematicsAdapter'
    };
  }
}


















