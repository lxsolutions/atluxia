'use client';

import { useState } from 'react';

interface ChildFormData {
  name: string;
  age: number;
  gradeLevel: string;
}

interface FamilySetupFormProps {
  onSubmit: (data: {
    children: Array<{ name: string; age: number; gradeLevel?: string }>;
    educationalPreferences: {
      subjects: string[];
      learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
      dailyLearningTime: number;
    };
  }) => void;
}

export function FamilySetupForm({ onSubmit }: FamilySetupFormProps) {
  const [children, setChildren] = useState<ChildFormData[]>([{ name: '', age: 6, gradeLevel: '' }]);
  const [subjects, setSubjects] = useState<string[]>(['math', 'science']);
  const [learningStyle, setLearningStyle] = useState<'visual' | 'auditory' | 'kinesthetic' | 'mixed'>('mixed');
  const [dailyLearningTime, setDailyLearningTime] = useState(60);

  const addChild = () => {
    setChildren([...children, { name: '', age: 6, gradeLevel: '' }]);
  };

  const updateChild = (index: number, field: string, value: string | number) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    setChildren(updated);
  };

  const removeChild = (index: number) => {
    if (children.length > 1) {
      setChildren(children.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (children.some(child => !child.name.trim())) {
      alert('Please enter names for all children');
      return;
    }

    onSubmit({
      children: children.map(child => ({
        name: child.name.trim(),
        age: child.age,
        gradeLevel: child.gradeLevel.trim() || undefined,
      })),
      educationalPreferences: {
        subjects,
        learningStyle,
        dailyLearningTime,
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Setup Family Education Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Children Information</h3>
          {children.map((child, index) => (
            <div key={index} className="border border-gray-200 rounded p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={child.name}
                    onChange={(e) => updateChild(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Child's name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="18"
                    value={child.age}
                    onChange={(e) => updateChild(index, 'age', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade Level (Optional)
                  </label>
                  <input
                    type="text"
                    value={child.gradeLevel}
                    onChange={(e) => updateChild(index, 'gradeLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Kindergarten, 2nd Grade"
                  />
                </div>
              </div>
              {children.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeChild(index)}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm"
                >
                  Remove Child
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addChild}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add Another Child
          </button>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Educational Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Subjects
              </label>
              <div className="flex flex-wrap gap-2">
                {['math', 'science', 'reading', 'art', 'history', 'music'].map(subject => (
                  <label key={subject} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={subjects.includes(subject)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSubjects([...subjects, subject]);
                        } else {
                          setSubjects(subjects.filter(s => s !== subject));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Style
              </label>
              <select
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value as 'visual' | 'auditory' | 'kinesthetic' | 'mixed')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="visual">Visual (Learn by seeing)</option>
                <option value="auditory">Auditory (Learn by hearing)</option>
                <option value="kinesthetic">Kinesthetic (Learn by doing)</option>
                <option value="mixed">Mixed/Combination</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Learning Time (minutes)
              </label>
              <input
                type="number"
                min="15"
                max="240"
                value={dailyLearningTime}
                onChange={(e) => setDailyLearningTime(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Setup Family Education Profile
        </button>
      </form>
    </div>
  );
}