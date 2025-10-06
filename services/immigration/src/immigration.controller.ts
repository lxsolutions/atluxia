import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ImmigrationService } from './immigration.service';
import { 
  VisaWizardInput, 
  VisaPathOption,
  ChecklistItem,
  VisaApplication
} from '@nomad-life/contracts';

@Controller('immigration')
export class ImmigrationController {
  constructor(private readonly immigrationService: ImmigrationService) {}

  @Post('paths')
  async findVisaPaths(@Body() input: VisaWizardInput): Promise<VisaPathOption[]> {
    return this.immigrationService.findVisaPaths(input);
  }

  @Post('checklist/:pathId')
  async generateChecklist(
    @Param('pathId') pathId: string,
    @Body() input: VisaWizardInput
  ): Promise<ChecklistItem[]> {
    return this.immigrationService.generateChecklist(pathId, input);
  }

  @Post('application/:pathId')
  async createVisaApplication(
    @Param('pathId') pathId: string,
    @Body() input: VisaWizardInput & { userId: string }
  ): Promise<VisaApplication> {
    const { userId, ...wizardInput } = input;
    return this.immigrationService.createVisaApplication(pathId, wizardInput, userId);
  }

  @Get('health')
  healthCheck(): { status: string } {
    return { status: 'ok' };
  }
}
