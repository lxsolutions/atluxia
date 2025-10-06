import { Injectable, Inject } from '@nestjs/common';
import { 
  VisaWizardInput, 
  VisaPathOption,
  ChecklistItem,
  VisaApplication
} from '@atluxia/contracts';
import { rulesLoader } from '@atluxia/rules';

@Injectable()
export class ImmigrationService {
  constructor(
    @Inject('RULES_LOADER') private readonly rules: typeof rulesLoader
  ) {}

  async findVisaPaths(input: VisaWizardInput): Promise<VisaPathOption[]> {
    const { nationality, destination, purpose, stayLengthDays } = input;
    console.log('Finding visa paths for:', { nationality, destination, purpose, stayLengthDays });
    
    const paths = await this.rules.findVisaPaths(
      nationality,
      destination,
      purpose,
      stayLengthDays
    );

    console.log('Found paths:', paths);
    
    return paths.map(path => ({
      id: path.id,
      name: path.name,
      type: path.type,
      confidence: path.confidence,
      stayLimitDays: path.stayLimit.value,
      extensionsPossible: !!path.extensions && path.extensions.length > 0,
      extensionLimitDays: path.extensions?.[0]?.limit?.value,
      estimatedApprovalRate: 95, // Default high confidence for demo
      requirements: path.requirements,
      documentsRequired: path.documents.map(doc => doc.description),
      estimatedProcessingTimeDays: path.processingTime.max,
      governmentFees: path.fees.government,
      serviceFees: path.fees.service,
      notes: path.notes
    }));
  }

  async generateChecklist(pathId: string, input: VisaWizardInput): Promise<ChecklistItem[]> {
    const paths = await this.findVisaPaths(input);
    const selectedPath = paths.find(p => p.id === pathId);
    
    if (!selectedPath) {
      throw new Error(`Visa path ${pathId} not found`);
    }

    console.log('Selected path for checklist:', JSON.stringify(selectedPath, null, 2));
    
    const checklist: ChecklistItem[] = [];

    // Add document requirements from requirements array
    selectedPath.requirements?.forEach((req, index) => {
      checklist.push({
        id: `req-${index}`,
        title: `Prepare ${req}`,
        description: `Requirement: ${req}`,
        dueDate: undefined,
        completed: false,
        priority: 'high',
        estimatedTimeMinutes: 60
      });
    });

    // Add application steps
    checklist.push({
      id: 'apply',
      title: 'Submit visa application',
      description: 'Complete and submit the visa application form',
      dueDate: undefined,
      completed: false,
      priority: 'high',
      estimatedTimeMinutes: 120
    });

    // Add post-arrival tasks
    checklist.push({
      id: 'arrival-report',
      title: 'Complete arrival reporting (TM30)',
      description: 'Complete arrival reporting within 24 hours of arrival',
      completed: false,
      priority: 'medium',
      estimatedTimeMinutes: 30,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    });

    return checklist;
  }

  async createVisaApplication(
    pathId: string, 
    input: VisaWizardInput,
    userId: string
  ): Promise<VisaApplication> {
    const checklist = await this.generateChecklist(pathId, input);
    
    return {
      id: `visa-${Date.now()}`,
      userId,
      visaPathId: pathId,
      status: 'draft',
      checklist,
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
