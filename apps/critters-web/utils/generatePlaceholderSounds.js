


// This script generates simple placeholder sounds for development
const fs = require('fs');
const path = require('path');

// Create a simple sound file with HTML5 audio API
function createSoundFile(filename, frequency, duration) {
  const bufferSize = 44100 * duration; // 44.1kHz sample rate
  const buffer = new Float32Array(bufferSize);

  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = Math.sin(i * frequency * 0.02 * Math.PI);
  }

  return buffer;
}

// Generate placeholder sounds
const sounds = [
  { name: 'pet', freq: 440, duration: 1 }, // A4 note for pet sound
  { name: 'correct', freq: 880, duration: 0.5 }, // High C for correct answer
  { name: 'wrong', freq: 220, duration: 0.3 }, // Low A for wrong answer
];

// Generate sounds and save to public directory
sounds.forEach(sound => {
  const buffer = createSoundFile(sound.name, sound.freq, sound.duration);
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const bufferSource = audioContext.createBufferSource();
  const audioBuffer = audioContext.createBuffer(1, buffer.length, audioContext.sampleRate);

  audioBuffer.getChannelData(0).set(buffer);

  // Save as WAV file
  const wavHeader = generateWavHeader(audioBuffer.length);
  const intArray = new Int16Array(buffer.length * 2); // Convert to 16-bit PCM

  for (let i = 0; i < buffer.length; i++) {
    intArray[i] = Math.min(32767, Math.max(-32768, buffer[i] * 32767));
  }

  const dataView = new DataView(intArray.buffer);
  const fileBuffer = new Uint8Array(wavHeader.length + dataView.byteLength);

  fileBuffer.set(new Uint8Array(wavHeader), 0);
  for (let i = 0; i < dataView.byteLength; i++) {
    fileBuffer.set([dataView.getUint8(i)], wavHeader.length + i);
  }

  fs.writeFileSync(path.join(__dirname, '../../public/assets/sounds', `${sound.name}.wav`), fileBuffer);
});

function generateWavHeader(sampleCount) {
  const sampleRate = 44100;
  const byteRate = sampleRate * 2; // 16-bit mono
  const blockAlign = 2;

  return new Uint8Array([
    // RIFF header
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    0x00, 0x00, 0x00, 0x00, // File size (placeholder)
    0x57, 0x41, 0x56, 0x45, // "WAVE"

    // fmt subchunk
    0x66, 0x6d, 0x74, 0x20, // "fmt "
    0x10, 0x00, 0x00, 0x00, // Subchunk size (16)
    0x01, 0x00, // Audio format (PCM)
    0x01, 0x00, // Number of channels (mono)
    0x44, 0xAC, 0x00, 0x00, // Sample rate (44100)
    0x88, 0x58, 0x01, 0x00, // Byte rate
    0x02, 0x00, // Block align
    0x10, 0x00, // Bits per sample (16)

    // data subchunk header
    0x64, 0x61, 0x74, 0x61, // "data"
    0x00, 0x00, 0x00, 0x00, // Subchunk size (placeholder)
  ]);
}

console.log('Generated placeholder sounds');

