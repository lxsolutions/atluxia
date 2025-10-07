



import React from 'react';
import { render, screen } from '@testing-library/react';
import RPGAdventure from '../components/RPGAdventure';

describe('RPGAdventure Component', () => {
  test('renders without crashing', () => {
    render(<RPGAdventure />);
    expect(screen.getByText('RPG Adventure Game')).toBeInTheDocument();
  });

  test('displays game state information', () => {
    render(<RPGAdventure />);
    expect(screen.getByText(/level/i)).toBeInTheDocument();
    expect(screen.getByText(/xp/i)).toBeInTheDocument();
    expect(screen.getByText(/power/i)).toBeInTheDocument();
  });

  test('has a creature that can be petted', () => {
    render(<RPGAdventure />);
    const creatureElement = screen.getByText('🐉');
    expect(creatureElement).toBeInTheDocument();
  });

  test('displays current location', () => {
    render(<RPGAdventure />);
    expect(screen.getByText(/current location/i)).toBeInTheDocument();
  });
});



