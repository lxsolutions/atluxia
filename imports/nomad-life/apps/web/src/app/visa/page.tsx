
'use client';

import { useState } from 'react';
import { VisaWizard } from '@/components/visa/VisaWizard';
import { VisaChecklist } from '@/components/visa/VisaChecklist';
import { VisaApplications } from '@/components/visa/VisaApplications';

type VisaTab = 'wizard' | 'checklist' | 'applications';

export default function VisaPage() {
  const [activeTab, setActiveTab] = useState<VisaTab>('wizard');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">📋 Visa & Immigration</h1>
        <p className="text-xl text-muted-foreground">
          Get personalized visa guidance and manage your immigration journey
        </p>
      </div>

      <div className="flex flex-col space-y-8">
        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'wizard'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Visa Wizard
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'checklist'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My Checklist
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'applications'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Applications
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'wizard' && <VisaWizard />}
          {activeTab === 'checklist' && <VisaChecklist />}
          {activeTab === 'applications' && <VisaApplications />}
        </div>
      </div>
    </div>
  );
}
