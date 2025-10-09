


import React, { useEffect, useRef, useState } from 'react';
import { get, set } from "idb-keyval";
import soundEngine from '../utils/soundEngine';
import animationEngine from '../utils/animationEngine';

const PetCareGame = () => {
  const [critters, setCritters] = useState([]);
  const [activeCritterIndex, setActiveCritterIndex] = useState(0);
  const activeCritter = critters[activeCritterIndex];

  // Load user progress from IndexedDB or backend
  const [currentSpeechBubble, setCurrentSpeechBubble] = useState("Hello!");
  const [answers, setAnswers] = useState([
    { text: "Feed", isCorrect: true },
    { text: "Ignore", isCorrect: false }
  ]);
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [performanceHistory, setPerformanceHistory] = useState([]);

  // Load user progress from IndexedDB or backend
  useEffect(() => {
    const loadUserProgress = async () => {
      try {
        // Try to get user data first
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);

          // Load performance history from backend or IndexedDB
          let progressData;
          try {
            const response = await fetch(`/api/users/${userData.userId}/progress`, {
              headers: { 'Authorization': `Bearer ${userData.token}` }
            });
            if (response.ok) {
              progressData = await response.json();
            } else {
              // Fallback to IndexedDB
              progressData = await get(`performanceHistory_${userData.userId}`);
            }

            if (progressData && progressData.performanceHistory) {
              setPerformanceHistory(progressData.performanceHistory);
              setDifficultyLevel(calculateDifficulty(progressData.performanceHistory));

              // Load creature data from backend
              const critterResponse = await fetch(`/api/users/${userData.userId}/critters`, {
                headers: { 'Authorization': `Bearer ${userData.token}` }
              });
              if (critterResponse.ok) {
                const critters = await critterResponse.json();
                if (critters.length > 0) {
                  // Set all critters and make the first one active
                  setCritters(critters.map(c => ({
                    ...c,
                    emoji: getCritterEmoji(c.type)
                  })));
                  setActiveCritterIndex(0);
                }
              }

              // Load eggs from backend for all critters
              const eggResponse = await fetch(`/api/users/${userData.userId}/eggs`, {
                headers: { 'Authorization': `Bearer ${userData.token}` }
              });
              if (eggResponse.ok) {
                const eggs = await eggResponse.json();
                // Update each critter with their respective eggs
                setCritters(prev => prev.map(critter =>
                  ({
                    ...critter,
                    eggs: eggs.filter(egg => !egg.hatched && (!critter.eggs || !critter.eggs.find(e => e.id === egg.id)))
                  })
                ));
              }

            } else {
              // If no progress data, create a default critter
              const response = await fetch(`/api/users/${userData.userId}/critters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userData.token}` },
                body: JSON.stringify({ name: "Fluffy", type: "fluffy_cat" })
              });
              if (response.ok) {
                const newCritter = await response.json();
                setCritters([{
                  ...newCritter,
                  emoji: getCritterEmoji(newCritter.type),
                  eggs: []
                }]);
                setActiveCritterIndex(0);
              }
            }
          } catch (error) {
            console.error('Error loading performance history:', error);
          }
        }
      } catch (error) {
        console.error('Error loading user progress:', error);
      }

      // Check for any unhatched eggs and hatch them if ready
      checkAndHatchEggs();
    };

    loadUserProgress();

    // Set interval to periodically check for egg hatching
    const hatchInterval = setInterval(checkAndHatchEggs, 60000); // Check every minute

    return () => clearInterval(hatchInterval);
  }, []);

  // Initialize sound and animation engines when component mounts
  useEffect(() => {
    soundEngine.init();
    // Start background music using the sound engine
    if (!soundEngine.isPlaying('background')) {
      soundEngine.playLoop('background');
    }
  }, []);

  // Voice command initialization
  useEffect(() => {
    initVoiceCommands();
  }, []);

  const initVoiceCommands = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        console.log('Voice command detected:', command);

        switch(command) {
          case 'feed':
            handleFeedPet();
            break;
          case 'play':
            handlePlayWithPet();
            break;
          case 'hatch egg':
            hatchEgg(activeCritter);
            break;
          case 'merge critters':
            showMergeModal();
            break;
          default:
            setCurrentSpeechBubble(`I didn't understand "${command}"`);
        }
      };

      recognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
      };

      // Start listening for voice commands
      document.addEventListener('click', () => {
        if (!recognition.aborted && !recognition.started) {
          recognition.start();
        }
      });
    } else {
      console.warn('Speech Recognition API not supported in this browser');
    }
  };

  const handleAnswerSelection = async (isCorrect) => {
    setCurrentSpeechBubble(isCorrect ? "🎉 Correct!" : "❌ Wrong answer");

    // Update active critter stats based on correct/incorrect answers
    if (isCorrect) {
      soundEngine.play('correct');
      animationEngine.createSparkles();

      const xpGain = difficultyLevel * 10;
      setCritters(prev => prev.map((critter, index) =>
        index === activeCritterIndex ? {
          ...critter,
          xp: critter.xp + xpGain,
          happiness: Math.min(100, critter.happiness + 5)
        } : critter
      ));

      // Check if level up for the active critter
      const currentCritter = activeCritter;
      if (currentCritter.level < getNextLevelXP(currentCritter.level) && currentCritter.xp >= getNextLevelXP(currentCritter.level)) {
        setCritters(prev => prev.map((critter, index) =>
          index === activeCritterIndex ? {
            ...critter,
            level: critter.level + 1,
            happiness: Math.min(100, critter.happiness + 10)
          } : critter
        ));
        soundEngine.play('level_up');
      }
    } else {
      soundEngine.play('wrong');
      animationEngine.createSmallSparkles();

      setCritters(prev => prev.map((critter, index) =>
        index === activeCritterIndex ? {
          ...critter,
          happiness: Math.max(0, critter.happiness - 5),
          energy: Math.max(0, critter.energy - 3)
        } : critter
      ));
    }

    // Update performance history
    const newHistory = [...performanceHistory, { isCorrect, timestamp: Date.now() }];
    setPerformanceHistory(newHistory);
    setDifficultyLevel(calculateDifficulty(newHistory));

    // Generate new question based on difficulty level
    generateQuestion(difficultyLevel);

    // Save progress to backend or IndexedDB for the active critter
    const progressData = {
      performanceHistory: [...performanceHistory, { isCorrect, timestamp: Date.now() }],
      difficultyLevel,
      creatureState: activeCritter
    };
    await saveProgress(progressData);
  };

  return (
    <div className="pet-care-game" role="main">
      <h1>Pet Care Game</h1>
      <div className="creature-stats" aria-label="Creature stats showing happiness, energy, and magic levels">
        <p>Happiness: {activeCritter.happiness}</p>
        <p>Energy: {activeCritter.energy}</p>
        <p>Magic: {activeCritter.magic}</p>
      </div>


      {/* Critter selection dropdown */}
      <div className="critter-selection mb-4">
        <label htmlFor="critter-select" className="text-lg font-semibold">Active Critter:</label>
        <select
          id="critter-select"
          value={activeCritterIndex}
          onChange={(e) => setActiveCritterIndex(Number(e.target.value))}
          className="bg-indigo-700 text-white px-3 py-2 rounded-lg hover:bg-indigo-600 transition-all ml-2"
        >
          {critters.map((critter, index) => (
            <option key={index} value={index}>
              {critter.name} ({getCritterEmoji(critter.type)})
            </option>
          ))}
        </select>
      </div>


      <div className="creature-area" role="region" aria-label="Creature interaction area">
        <div className="room-info" aria-label="Current room">Living Room</div>
        <div className="creature" aria-label="Happy creature emoji"><span role="img" aria-label="happy creature emoji">{activeCritter.emoji}</span></div>
        <div className="speech-bubble" aria-live="polite">
          {currentSpeechBubble}
        </div>
        <div className="sparkles-container" id="sparkleContainer" aria-hidden="true"></div>
      </div>
      <div className="answer-buttons" role="group" aria-label="Answer options for the current question">
        {answers.map((answer, index) => (
          <button
            key={index}
            ref={(el) => (answerButtonRefs.current[index] = el)}
            onClick={() => handleAnswerSelection(answer.isCorrect)}
            aria-pressed="false"
            tabIndex="0"
          >
            {answer.text}
          </button>
        ))}
      </div>

      {/* Fluvsies Mechanics Controls */}
      <div className="fluvsies-controls mt-6 p-4 bg-purple-900 rounded-lg shadow-inner">
        <h3 className="text-xl font-bold mb-2 text-yellow-300">Fluvsies Mechanics</h3>

        {/* Egg Management */}
        {activeCritter.eggs.length > 0 ? (
          <div className="egg-section mb-4">
            <p>🥚 You have {activeCritter.eggs.length} unhatched egg{activeCritter.eggs.length !== 1 ? 's' : ''}</p>
            <button
              onClick={() => checkAndHatchEggs()}
              className="bg-indigo-700 text-white px-3 py-2 rounded-lg hover:bg-indigo-600 transition-all"
            >
              Check for Hatching
            </button>
          </div>
        ) : (
          <div className="egg-section mb-4">
            <p>🥚 No unhatched eggs</p>
            <button
              onClick={() => addEgg()}
              className="bg-indigo-700 text-white px-3 py-2 rounded-lg hover:bg-indigo-600 transition-all"
            >
              Find Egg!
            </button>
          </div>
        )}

        {/* Merge Mechanics */}
        <div className="merge-section mb-4">
          <p>🐾 Want to evolve your critter?</p>
          <button
            onClick={() => mergeCritters()}
            className="bg-indigo-700 text-white px-3 py-2 rounded-lg hover:bg-indigo-600 transition-all"
          >
            Merge Critters
          </button>
        </div>

        {/* Skill Tree Button */}
        <div className="skill-tree-section">
          <p>🌳 Unlock new skills!</p>
          <a href="/skill-tree" className="bg-indigo-700 text-white px-3 py-2 rounded-lg hover:bg-indigo-600 transition-all inline-block">
            View Skill Tree
          </a>
        </div>

      </div>
    </div>
  );
};

// Calculate difficulty level based on performance history
const calculateDifficulty = (history, currentLevel) => {
  if (history.length === 0) return 1;

  // Count consecutive correct answers
  let consecutiveCorrect = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].isCorrect) {
      consecutiveCorrect++;
    } else {
      break;
    }
  }

  // Adjust difficulty based on performance
  if (consecutiveCorrect >= 5) return Math.min(3, currentLevel + 1); // Increase difficulty up to level 3
  if (history.filter(h => h.isCorrect).length / history.length < 0.4) return Math.max(1, currentLevel - 1); // Decrease for poor performance

  return currentLevel;
};

// Helper function to get critter emoji based on type
const getCritterEmoji = (type) => {
  switch(type) {
    case 'fluffy_cat': return '🐱✨';
    case 'unicorn_panda': return '🦄🐼';
    case 'dragon_bunny': return '🐇🔥';
    case 'rainbow_squirrel': return '🐿️🌈';
    case 'mermaid_fox': return '🦊🧜‍♀️';
    default: return '🐨'; // Default emoji
  }
};

// Fluvsies mechanics functions

// Check for unhatched eggs and hatch them if ready
const checkAndHatchEggs = async () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return;

  try {
    const userData = JSON.parse(storedUser);
    const eggResponse = await fetch(`/api/users/${userData.userId}/eggs`, {
      headers: { 'Authorization': `Bearer ${userData.token}` }
    });

    if (eggResponse.ok) {
      const eggs = await eggResponse.json();
      const unhatchedEggs = eggs.filter(egg => !egg.hatched);

      // Check each egg to see if it's ready to hatch
      for (const egg of unhatchedEggs) {
        const now = new Date().getTime();
        const hatchTime = new Date(egg.hatch_timestamp).getTime();

        if (now >= hatchTime) {
          // Egg is ready to hatch!
          await hatchEgg(userData.userId, userData.token, egg.id);
        }
      }

      setCritters(prev => prev.map(critter =>
        ({
          ...critter,
          eggs: unhatchedEggs.filter(egg => new Date().getTime() < new Date(egg.hatch_timestamp).getTime())
        })
      ));
    }
  } catch (error) {
    console.error('Error checking eggs:', error);
  }
};

// Hatch an egg and create a new critter
const hatchEgg = async (userId, token, eggId) => {
  try {
    const response = await fetch(`/api/eggs/${eggId}/hatch`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const result = await response.json();
      soundEngine.play('hatch');
      animationEngine.createBigSparkles();

      // Update creature state with the new critter
      setCreature(prev => ({
        ...prev,
        id: result.critter.id,
        name: result.critter.name,
        type: result.critter.type,
        happiness: result.critter.happiness,
        energy: result.critter.energy,
        magic: result.critter.magic,
        level: result.critter.level,
        xp: result.critter.xp,
        gear: result.critter.gear || {},
        skills: result.critter.skills || [],
        emoji: getCritterEmoji(result.critter.type)
      }));

      setCurrentSpeechBubble(`🎉 A ${result.critter.name} has hatched! 🎉`);
    }
  } catch (error) {
    console.error('Error hatching egg:', error);
  }
};

// Add a new egg to the user's collection
const addEgg = async () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return;

  try {
    const userData = JSON.parse(storedUser);

    // Get available critter types from data file
    const response = await fetch('/data/critters.json');
    const critters = await response.json();

    // Randomly select a critter type based on rarity
    let selectedCritter;
    const rarities = ['common', 'rare', 'epic', 'legendary', 'mythic'];
    const randomRarityIndex = Math.floor(Math.random() * 5); // More common eggs

    for (const critter of critters) {
      if (critter.rarity === rarities[randomRarityIndex]) {
        selectedCritter = critter;
        break;
      }
    }

    if (!selectedCritter) return;

    const eggResponse = await fetch(`/api/users/${userData.userId}/eggs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userData.token}` },
      body: JSON.stringify({
        type: selectedCritter.id,
        hatchTime: new Date(Date.now() + (5 * 60 * 1000)) // 5 minutes from now
      })
    });

    if (eggResponse.ok) {
      const egg = await eggResponse.json();
      soundEngine.play('new_egg');
      animationEngine.createSparkles();

      setCreature(prev => ({
        ...prev,
        eggs: [...prev.eggs, { id: egg.id, type: selectedCritter.id }]
      }));

      setCurrentSpeechBubble(`🥚 You found a ${selectedCritter.name} egg! 🥚`);
    }
  } catch (error) {
    console.error('Error adding egg:', error);
  }
};

// Merge two critters to create an evolution
const mergeCritters = async () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return;

  try {
    const userData = JSON.parse(storedUser);

    // Get all user's critters
    const response = await fetch(`/api/users/${userData.userId}/critters`, {
      headers: { 'Authorization': `Bearer ${userData.token}` }
    });

    if (response.ok) {
      const critters = await response.json();

      // Find duplicates of the current creature type
      const duplicates = critters.filter(c => c.type === activeCritter.type && !c.merged);

      if (duplicates.length >= 2) {
        // Merge two duplicates to evolve the creature
        const [critter1, critter2] = duplicates.slice(0, 2);

        const mergeResponse = await fetch(`/api/critters/merge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userData.token}` },
          body: JSON.stringify({
            critter1Id: critter1.id,
            critter2Id: critter2.id
          })
        });

        if (mergeResponse.ok) {
          const evolvedCritter = await mergeResponse.json();
          soundEngine.play('evolve');
          animationEngine.createBigSparkles();

          setCreature(prev => ({
            ...prev,
            id: evolvedCritter.id,
            name: evolvedCritter.name,
            type: evolvedCritter.type,
            happiness: evolvedCritter.happiness,
            energy: evolvedCritter.energy,
            magic: evolvedCritter.magic,
            level: evolvedCritter.level,
            xp: evolvedCritter.xp,
            gear: evolvedCritter.gear || {},
            skills: evolvedCritter.skills || [],
            emoji: getCritterEmoji(evolvedCritter.type)
          }));

          setCurrentSpeechBubble(`🌟 Your ${evolvedCritter.name} has evolved! 🌟`);
        }
      } else {
        setCurrentSpeechBubble("You need at least 2 of the same critters to merge!");
      }
    }
  } catch (error) {
    console.error('Error merging critters:', error);
  }
};

export default PetCareGame;


