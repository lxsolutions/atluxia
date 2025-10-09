






import React, { useState, useEffect } from 'react';
import { getUserDataFromLocalStorage } from '../utils/auth';

const SkillTree = ({ critterType }) => {
  const [userData, setUserData] = useState(null);
  const [critterSkills, setCritterSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);

  // Sample skill tree data for different critter types
  const skillTreeData = {
    fluffy_cat: [
      { id: 'skill-1', name: 'Purr Power', description: 'Increases happiness when petted', levelRequired: 1, xpCost: 50 },
      { id: 'skill-2', name: 'Stealthy Steps', description: 'Improves stealth in adventures', levelRequired: 3, xpCost: 75 },
      { id: 'skill-3', name: 'Magic Whiskers', description: 'Unlocks minor magic abilities', levelRequired: 5, xpCost: 100 },
    ],
    unicorn_panda: [
      { id: 'skill-4', name: 'Rainbow Dash', description: 'Creates colorful trails that boost mood', levelRequired: 2, xpCost: 60 },
      { id: 'skill-5', name: 'Bamboo Mastery', description: 'Gains extra energy from bamboo', levelRequired: 4, xpCost: 80 },
    ],
    dragon_turtle: [
      { id: 'skill-6', name: 'Fire Breath', description: 'Unlocks fire attacks in battles', levelRequired: 3, xpCost: 90 },
      { id: 'skill-7', name: 'Shell Shield', description: 'Increases defense when hiding', levelRequired: 5, xpCost: 120 },
    ]
  };

  useEffect(() => {
    // Load user data
    const loadUserData = async () => {
      const storedUser = getUserDataFromLocalStorage();
      if (storedUser) {
        setUserData(storedUser);

        // In a real implementation, we would fetch the critter's current skills from the backend
        // For now, we'll use sample data based on critter type
        const availableSkills = skillTreeData[critterType] || [];
        setCritterSkills(availableSkills);
      }
    };

    loadUserData();
  }, [critterType]);

  const handleSkillSelect = (skill) => {
    if (!userData) return;

    // In a real implementation, we would:
    // 1. Check if the user has enough XP
    // 2. Call an API to unlock the skill
    // 3. Update the critter's skills in state

    setSelectedSkill(skill);
    alert(`You've selected: ${skill.name}! This is where you'd spend XP and unlock the skill.`);

    // For demo purposes, let's simulate a successful skill unlock
    const updatedSkills = [...critterSkills];
    if (!updatedSkills.includes(skill)) {
      setCritterSkills([...updatedSkills, skill]);
    }
  };

  if (!userData) {
    return (
      <div className="loading-container flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
      </div>
    );
  }

  return (
    <div className="skill-tree-container p-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 min-h-screen">
      {/* Skill Tree Header */}
      <div className="skill-header mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">Skill Tree for {critterType.replace('_', ' ')}</h1>
        <p className="text-lg text-indigo-200 mt-2">{userData.username}'s Skill Progression</p>
      </div>

      {/* Critter Info Card */}
      <div className="bg-white p-6 rounded-lg shadow-xl mb-8 transform hover:scale-105 transition-all duration-300">
        <h2 className="text-xl font-semibold text-indigo-700 mb-4">Critter Information</h2>
        <p><strong>Type:</strong> {critterType.replace('_', ' ')}</p>
        {/* In a real implementation, we would show actual critter stats here */}
      </div>

      {/* Skill Tree Grid */}
      <div className="skill-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {critterSkills.map((skill) => (
          <div
            key={skill.id}
            onClick={() => handleSkillSelect(skill)}
            className={`skill-card bg-white p-4 rounded-lg shadow-xl cursor-pointer transform transition-all duration-200 hover:scale-105 ${
              selectedSkill?.id === skill.id ? 'border-4 border-yellow-500' : ''
            }`}
          >
            <h3 className="text-lg font-semibold text-indigo-700 mb-2">{skill.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{skill.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Level Required: {skill.levelRequired}</span>
              <span className="text-xs text-indigo-700 font-semibold">XP Cost: {skill.xpCost}</span>
            </div>

            {/* Show unlock status */}
            {critterSkills.includes(skill) ? (
              <div className="mt-3">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Unlocked</span>
              </div>
            ) : (
              <div className="mt-3">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Locked</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Available XP Display */}
      <div className="xp-display mt-8 p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold text-indigo-700 mb-4">Available Experience Points</h2>
        <p className="text-3xl font-bold text-center text-purple-600">150 XP</p>
      </div>

    </div>
  );
};

export default SkillTree;








