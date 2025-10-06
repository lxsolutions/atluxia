

'use client';

import { useState, useEffect } from 'react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  estimatedTimeMinutes?: number;
  dueDate?: string;
}

export function VisaChecklist() {
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch saved checklists from the backend
    const savedChecklists = localStorage.getItem('visaChecklists');
    if (savedChecklists) {
      setChecklists(JSON.parse(savedChecklists));
    }
    setLoading(false);
  }, []);

  const toggleCompletion = (id: string) => {
    const updatedChecklists = checklists.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklists(updatedChecklists);
    localStorage.setItem('visaChecklists', JSON.stringify(updatedChecklists));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">My Visa Checklist</h2>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading checklists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">My Visa Checklist</h2>
      
      {checklists.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-4">No saved checklists yet</p>
          <p>Complete a visa wizard to generate your first checklist!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {checklists.map((item) => (
            <div
              key={item.id}
              className="flex items-start p-4 border rounded-lg"
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleCompletion(item.id)}
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
    </div>
  );
}

