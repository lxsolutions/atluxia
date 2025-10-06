

'use client';

import { useState } from 'react';
import { VisaWizardInput, VisaPathOption, ChecklistItem } from '@nomad-life/contracts';

export function VisaWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<VisaWizardInput & { selectedPathId?: string }>>({});
  const [paths, setPaths] = useState<VisaPathOption[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [checklistLoading, setChecklistLoading] = useState(false);

  const handleInputChange = (field: keyof VisaWizardInput, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (step === 1) {
      // Validate step 1
      if (!formData.nationality || !formData.destination || !formData.purpose || !formData.stayLengthDays) {
        alert('Please fill in all required fields');
        return;
      }
      
      setLoading(true);
      try {
        // Call API to get visa paths
        const response = await fetch('/api/immigration/paths', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (response.ok) {
          const pathsData = await response.json();
          setPaths(pathsData);
          setStep(2);
        } else {
          throw new Error('Failed to fetch visa paths');
        }
      } catch (error) {
        console.error('Error fetching visa paths:', error);
        alert('Failed to get visa options. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      // Generate checklist for selected path
      if (!formData.selectedPathId) {
        alert('Please select a visa option');
        return;
      }
      
      setChecklistLoading(true);
      try {
        // Call API to get checklist
        const response = await fetch('/api/immigration/checklist/' + formData.selectedPathId, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (response.ok) {
          const checklistData = await response.json();
          setChecklist(checklistData);
          setStep(3);
        } else {
          throw new Error('Failed to fetch checklist');
        }
      } catch (error) {
        console.error('Error fetching checklist:', error);
        alert('Failed to generate checklist. Please try again.');
      } finally {
        setChecklistLoading(false);
      }
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handlePathSelect = (pathId: string) => {
    setFormData(prev => ({ ...prev, selectedPathId: pathId }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Step {step} of 3</span>
          <span className="text-sm text-muted-foreground">
            {step === 1 && 'Basic Information'}
            {step === 2 && 'Visa Options'}
            {step === 3 && 'Checklist'}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Tell us about your trip</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nationality</label>
              <select
                value={formData.nationality || ''}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                className="w-full p-3 border rounded-md"
                required
              >
                <option value="">Select nationality</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="TH">Thailand</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Destination</label>
              <select
                value={formData.destination || ''}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                className="w-full p-3 border rounded-md"
                required
              >
                <option value="">Select destination</option>
                <option value="TH">Thailand</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Purpose of Visit</label>
            <select
              value={formData.purpose || ''}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              className="w-full p-3 border rounded-md"
              required
            >
              <option value="">Select purpose</option>
              <option value="tourism">Tourism</option>
              <option value="business">Business</option>
              <option value="study">Study</option>
              <option value="work">Work</option>
              <option value="remote_work">Remote Work</option>
              <option value="family">Family Visit</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Length of Stay (days)</label>
            <input
              type="number"
              min="1"
              max="365"
              value={formData.stayLengthDays || ''}
              onChange={(e) => handleInputChange('stayLengthDays', parseInt(e.target.value))}
              className="w-full p-3 border rounded-md"
              placeholder="e.g., 30"
              required
            />
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              id="hasDependents"
              checked={formData.hasDependents || false}
              onChange={(e) => handleInputChange('hasDependents', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="hasDependents" className="text-sm">
              Traveling with dependents
            </label>
          </div>

          {formData.hasDependents && (
            <div>
              <label className="block text-sm font-medium mb-2">Number of Dependents</label>
              <input
                type="number"
                min="0"
                value={formData.dependentCount || 0}
                onChange={(e) => handleInputChange('dependentCount', parseInt(e.target.value))}
                className="w-full p-3 border rounded-md"
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={loading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Finding options...' : 'Find Visa Options'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Visa Options */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Available Visa Options</h2>
          
          {paths.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No visa options found for your criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {paths.map((path) => (
                <div
                  key={path.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.selectedPathId === path.id
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-primary'
                  }`}
                  onClick={() => path.id && handlePathSelect(path.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{path.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{path.type?.replace('_', ' ') || 'visa'}</p>
                      
                      <div className="mt-2 space-y-1 text-sm">
                        <p>Stay limit: {path.stayLimitDays} days</p>
                        <p>Processing: {path.estimatedProcessingTimeDays} days</p>
                        <p>Government fees: ${path.governmentFees}</p>
                        {path.serviceFees && <p>Service fees: ${path.serviceFees}</p>}
                        <p className={`inline-block px-2 py-1 rounded-full text-xs ${
                          path.confidence === 'high' ? 'bg-green-100 text-green-800' :
                          path.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Confidence: {path.confidence}
                        </p>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <input
                        type="radio"
                        name="visaPath"
                        value={path.id}
                        checked={formData.selectedPathId === path.id}
                        onChange={() => path.id && handlePathSelect(path.id)}
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="px-6 py-2 border border-muted rounded-md hover:bg-muted"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!formData.selectedPathId}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              Continue to Checklist
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Checklist */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Your Visa Checklist</h2>
          
          {checklistLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Generating your checklist...</p>
            </div>
          ) : checklist.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No checklist items found.
            </div>
          ) : (
            <div className="space-y-3">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start p-4 border rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {
                      // Toggle completion
                      setChecklist(prev => prev.map(i => 
                        i.id === item.id ? { ...i, completed: !i.completed } : i
                      ));
                    }}
                    className="w-5 h-5 mt-1 mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        item.priority === 'high' ? 'bg-red-100 text-red-800' :
                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.priority} priority
                      </span>
                      {item.estimatedTimeMinutes && (
                        <span className="text-muted-foreground">
                          ⏱️ {item.estimatedTimeMinutes} min
                        </span>
                      )}
                      {item.dueDate && (
                        <span className="text-muted-foreground">
                          📅 Due: {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="px-6 py-2 border border-muted rounded-md hover:bg-muted"
            >
              Back
            </button>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  // Save checklist to localStorage
                  const savedChecklists = localStorage.getItem('visaChecklists');
                  const existingChecklists = savedChecklists ? JSON.parse(savedChecklists) : [];
                  const updatedChecklists = [...existingChecklists, ...checklist];
                  localStorage.setItem('visaChecklists', JSON.stringify(updatedChecklists));
                  alert('Checklist saved! You can access it later from the "My Checklist" tab.');
                }}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Save Checklist
              </button>
              <button
                onClick={() => {
                  // Link to drivers/vehicles
                  alert('Redirecting to Drivers/Vehicles for immigration trips...');
                }}
                className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary/10"
              >
                Get Transportation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

