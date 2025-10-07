




import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PetCareGame from '../components/PetCareGame';
import soundEngine from '../utils/soundEngine';
import animationEngine from '../utils/animationEngine';

// Mock the sound and animation engines
jest.mock('../utils/soundEngine');
jest.mock('../utils/animationEngine');

// Mock fetch for online progress saving
global.fetch = jest.fn(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({})
}));

// Mock IndexedDB for offline support
const mockIndexedDB = {
  get: jest.fn(() => Promise.resolve(null)),
  set: jest.fn(() => Promise.resolve()),
};
jest.mock('idb-keyval', () => mockIndexedDB);

describe('PetCareGame Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders correctly with initial state', () => {
    render(<PetCareGame />);

    expect(screen.getByText('Pet Care Game')).toBeInTheDocument();
    expect(screen.getByText('Happiness: 85')).toBeInTheDocument();
    expect(screen.getByText('Energy: 70')).toBeInTheDocument();
    expect(screen.getByText('Magic: 90')).toBeInTheDocument();
    const creatureEmoji = screen.getByRole('img', { name: 'happy creature emoji' });
    expect(creatureEmoji).toHaveTextContent('🐨');
    expect(screen.getByText('Hello!')).toBeInTheDocument();

    // Check that buttons are rendered
    const feedButton = screen.getByText('Feed');
    const ignoreButton = screen.getByText('Ignore');

    expect(feedButton).toBeInTheDocument();
    expect(ignoreButton).toBeInTheDocument();
  });

  it('plays correct sounds and animations when answer is selected', async () => {
    render(<PetCareGame />);

    // Test correct answer
    const feedButton = screen.getByText('Feed');
    fireEvent.click(feedButton);

    expect(soundEngine.play).toHaveBeenCalledWith('correct');
    expect(animationEngine.createSparkles).toHaveBeenCalled();

    // Test wrong answer
    const ignoreButton = screen.getByText('Ignore');
    fireEvent.click(ignoreButton);

    expect(soundEngine.play).toHaveBeenCalledWith('wrong');
    expect(animationEngine.shakeElement).toHaveBeenCalled();
  });

  it('updates difficulty level based on performance', async () => {
    render(<PetCareGame />);

    // Get initial state
    let happinessText = screen.getByText(/Happiness:/);
    let speechBubble = screen.getByText('Hello!');

    // Click correct answer multiple times to increase difficulty
    const feedButton = screen.getByText('Feed');
    for (let i = 0; i < 6; i++) {
      fireEvent.click(feedButton);

      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    // Check that difficulty increased and creature is happier
    expect(happinessText).toHaveTextContent("Happiness: 100"); // Should be at max happiness
    expect(speechBubble).not.toHaveTextContent('Hello!');
    expect(speechBubble).toHaveTextContent("Good answer!"); // Should have positive feedback

    // Test wrong answer to decrease difficulty
    const ignoreButton = screen.getByText('Ignore');
    fireEvent.click(ignoreButton);

    await new Promise(resolve => setTimeout(resolve, 0));

    // Check that happiness decreased and speech bubble updated
    expect(happinessText).not.toHaveTextContent('Happiness: 100');
    expect(speechBubble).toHaveTextContent("Hmm, that's not right. Try again!"); // Should have encouraging feedback
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<PetCareGame />);

    // Check main role
    expect(screen.getByRole('main')).toBeInTheDocument();

    // Check creature stats aria-label
    const statsDiv = screen.getByLabelText('Creature stats showing happiness, energy, and magic levels');
    expect(statsDiv).toBeInTheDocument();

    // Check creature area region
    const creatureArea = screen.getByRole('region', { name: 'Creature interaction area' });
    expect(creatureArea).toBeInTheDocument();

    // Check room info aria-label
    const roomInfo = screen.getByLabelText('Current room');
    expect(roomInfo).toHaveTextContent('Living Room');

    // Check creature emoji role and aria-label
    const creatureEmoji = screen.getByRole('img', { name: 'happy creature emoji' });
    expect(creatureEmoji).toBeInTheDocument();

    // Check speech bubble live region
    const speechBubble = screen.getByText('Hello!');
    expect(speechBubble.closest('[aria-live="polite"]')).toBeInTheDocument();

    // Check sparkles container is hidden from screen readers
    const sparklesContainer = creatureArea.querySelector('#sparkleContainer');
    expect(sparklesContainer).toHaveAttribute('aria-hidden', 'true');

    // Check answer buttons group and aria-pressed
    const answerButtonsGroup = screen.getByRole('group', { name: 'Answer options for the current question' });
    expect(answerButtonsGroup).toBeInTheDocument();

    const feedButton = screen.getByText('Feed');
    expect(feedButton).toHaveAttribute('tabIndex', '0');

    const ignoreButton = screen.getByText('Ignore');
  });
});




