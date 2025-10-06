


import React, { useState, useEffect } from 'react';
import { get, set } from "idb-keyval";
import soundEngine from '../utils/soundEngine';
import animationEngine from '../utils/animationEngine';
import * as WebSocketService from '../services/websocket';

const RPGAdventure = () => {
  // Initialize sound and animation engines when component mounts
  useEffect(() => {
    soundEngine.init();

    // Connect to WebSocket for co-op mode if enabled
    const userData = JSON.parse(localStorage.getItem('user'));
    if (coopEnabled && roomId && userData?.id) {
      WebSocketService.connectWebSocket(userData.id, roomId);
    }


      // Set up message handler for progress updates
      WebSocketService.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Co-op update received:', data);

        if (data.type === 'PROGRESS_UPDATE' && data.progress) {
          setGameState(prevState => ({
            ...prevState,
            xp: Math.max(prevState.xp, data.progress.xp),
            level: Math.max(prevState.level, data.progress.level)
          }));
        }
      };



  }, [coopEnabled, roomId]);

  // Save quest progress with offline support
  const saveQuest = async (data) => {
    try {
      if (!navigator.onLine) {
        // Store quest data in IndexedDB for offline sync
        await set("pendingMetrics", data);
      } else {
        // Send to server
        await fetch('/api/quests/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      }
    } catch (error) {
      console.error('Error saving quest progress:', error);
      // Fallback to IndexedDB if online save fails
      await set("pendingMetrics", data);
    }
  };

  useEffect(() => {
    // Sync any pending quest data when back online
    const handleOnline = async () => {
      const pending = await get("pendingMetrics");
      if (pending) {
        try {
          await fetch('/api/quests/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(pending)
          });
          // Clear pending quest data after successful sync
          await del("pendingMetrics");
        } catch (error) {
          console.error('Error syncing pending quests:', error);
        }
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const [gameState, setGameState] = useState({
    level: 5,
    xp: 1300,
    xpToNext: 2000,
    power: 1247,
    currentLocation: 'forest',
    creatureType: 'dragon'
  });


  // Co-op mode state
  const [coopEnabled, setCoopEnabled] = useState(false);
  const [roomId, setRoomId] = useState(null);



  const [currentQuest, setCurrentQuest] = useState(null);
  const [questsCompleted, setQuestsCompleted] = useState(0);

  // Gain XP and level up if needed
  const gainXP = (xpAmount) => {
    setGameState(prevState => {
      const newXP = prevState.xp + xpAmount;
      let newLevel = prevState.level;

      if (newXP >= prevState.xpToNext) {
        // Level up!
        newLevel = prevState.level + 1;
        return {
          ...prevState,
          level: newLevel,
          xp: newXP - prevState.xpToNext,
          xpToNext: Math.floor(prevState.xpToNext * 1.5),
          power: prevState.power + (newLevel * 100)
        };
      }

      return {
        ...prevState,
        xp: newXP
      };
    });

    alert(`+${xpAmount} XP!`);
  };

  // Pet the creature
  const petCreature = () => {
    gainXP(5);
    animationEngine.createFloatingHearts('heartContainer', 3);

    alert("Sparkle loves your pets! +25 XP"); // Temporary - will replace with proper UI
  };

  // Select an answer for the current quest
  const selectAnswer = async (answerIndex) => {
    if (!currentQuest) return;

    const isCorrect = answerIndex === currentQuest.correct;
    let message = `You selected: ${currentQuest.answers[answerIndex]}\n`;

    if (isCorrect) {
      message += "✅ Correct! You've completed the quest!";
      // Play correct sound and create sparkles animation
      soundEngine.play('correctAnswer');
      animationEngine.createSparkles('sparkleContainer');

      // Award rewards
      gainXP(200);
    } else {
      message += "❌ Incorrect. Try again!";
      // Play wrong sound and shake the button
      soundEngine.play('wrongAnswer');
    }

    alert(message); // Temporary - will replace with proper UI

    // Save quest progress
    const questData = {
      questId: currentQuest.id,
      userId: 1, // Hardcoded for demo
      completed: isCorrect,
      score: isCorrect ? 200 : 0
    };
    await saveQuest(questData);

    // Reset current quest
    setCurrentQuest(null);
  };

  return (
    <div className="rpg-adventure mx-auto my-8 p-4 bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-700 rounded-lg shadow-xl max-w-md">
      <h2 className="text-3xl font-bold text-center mb-6 text-white">RPG Adventure Game</h2>

      {/* HUD - Header */}
      <div className="rpg-hud p-4 bg-black bg-opacity-80 rounded-lg shadow-inner mb-4">
        <div className="flex justify-between items-center">
          <div className="text-yellow-300 font-bold">Level {gameState.level}</div>
          <div className="xp-bar flex items-center text-xs">
            <span className="mr-1 text-pink-300">XP:</span>
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden mx-1">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-red-500"
                style={{ width: `${(gameState.xp / gameState.xpToNext) * 100}%` }}
              ></div>
            </div>
            <span className="ml-1 text-pink-300">{gameState.xp}/{gameState.xpToNext}</span>
          </div>
        </div>

        {/* Power Level */}
        <div className="power-level text-center mt-2">
          Power: {gameState.power.toLocaleString()}
        </div>
      </div>

      {/* Creature Area */}
      <div className="creature-area text-center mb-6 relative">
        <div
          className="creature text-8xl cursor-pointer mx-auto text-yellow-300"
          onClick={petCreature}
          onTouchStart={petCreature} // Add touch support for tablets
        >
          🐉
        </div>

        {/* Heart Container for pet animations */}
        <div className="hearts-container absolute inset-0 pointer-events-none z-10" id="heartContainer"></div>
      </div>

      {/* Location and Quest Area */}
      <div className="location-quest-area">
        {/* Current Location */}
        <div className="current-location bg-purple-900 p-4 rounded-lg mb-6 shadow-inner">
          <h3 className="text-xl font-bold mb-2 text-yellow-300">Current Location</h3>
          <p className="text-center">{getLocationName(gameState.currentLocation)}</p>
        </div>

        {/* Current Quest */}
        {currentQuest && (
          <div className="current-quest bg-purple-900 p-4 rounded-lg mt-6 shadow-inner">
            <h3 className="text-xl font-bold mb-2 text-yellow-300">Current Quest</h3>
            <p className="mb-4">{currentQuest.content}</p>

            <div className="grid grid-cols-2 gap-2">
              {currentQuest.answers.map((answer, index) => (
                <button
                  key={index}
                  className="answer-button bg-indigo-700 text-white px-3 py-2 rounded-lg hover:bg-indigo-600 transition-all"
                  onClick={() => selectAnswer(index)}
                  onTouchStart={() => selectAnswer(index)} // Add touch support for tablets
                >
                  {answer}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sparkle Container for correct answers */}
        <div className="sparkles-container absolute inset-0 pointer-events-none z-10" id="sparkleContainer"></div>

      </div>
    </div>
  );
};

const getLocationName = (location) => {
  switch(location) {
    case 'dungeon': return "🏰 The Enchanted Dungeon";
    case 'forest': return "🌲 Whispering Woods";
    case 'volcano': return "🌋 Dragon's Peak";
    default: return location.charAt(0).toUpperCase() + location.slice(1);
  }
};

export default RPGAdventure;

