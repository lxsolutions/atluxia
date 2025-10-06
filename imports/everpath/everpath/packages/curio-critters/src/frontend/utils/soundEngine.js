


const soundEngine = {
  sounds: {},

  // Initialize sounds
  init() {
    // Create audio elements for sounds
    this.sounds.petSound = new Audio('/assets/sounds/pet.wav');
    this.sounds.correctAnswer = new Audio('/assets/sounds/correct.wav');
    this.sounds.wrongAnswer = new Audio('/assets/sounds/wrong.wav');

    // Set up background music
    this.sounds.backgroundMusic = new Audio('/assets/sounds/background.mp3');
    this.sounds.backgroundMusic.loop = true;
    this.sounds.backgroundMusic.volume = 0.3;

    // Create placeholder sounds if they don't exist
    this.createPlaceholderSounds();
  },

  // Create placeholder sounds for development
  createPlaceholderSounds() {
    if (typeof window === 'undefined' || !window.AudioContext && !window.webkitAudioContext) {
      // Skip in test environment or when AudioContext is not available
      return;
    }

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    function createOscillator(frequency, duration) {
      return new Promise(resolve => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
          oscillator.disconnect();
          resolve();
        }, duration * 1000);
      });
    }

    // Play placeholder sounds to create audio elements
    Promise.all([
      createOscillator(440, 0.5), // A4 for pet sound
      createOscillator(880, 0.3), // High C for correct answer
      createOscillator(220, 0.3)  // Low A for wrong answer
    ]);
  },

  // Play a sound by name
  play(soundName) {
    if (!this.sounds[soundName]) return;

    try {
      this.sounds[soundName].currentTime = 0;
      // Only attempt to play in browser environment
      if (typeof window !== 'undefined' && window.HTMLAudioElement.prototype.play) {
        this.sounds[soundName].play().catch(e => console.log(`Could not play ${soundName}:`, e));
      }
    } catch (e) {
      console.log(`Could not play ${soundName}:`, e);
    }
  },

  // Stop background music
  stopBackground() {
    if (this.sounds.backgroundMusic) {
      try {
        this.sounds.backgroundMusic.pause();
      } catch (e) {
        console.log('Could not stop background music:', e);
      }
    }
  },

  // Toggle background music
  toggleBackground() {
    if (this.sounds.backgroundMusic) {
      try {
        if (this.sounds.backgroundMusic.paused) {
          this.sounds.backgroundMusic.play();
        } else {
          this.sounds.backgroundMusic.pause();
        }
      } catch (e) {
        console.log('Could not toggle background music:', e);
      }
    }
  }
};

export default soundEngine;

