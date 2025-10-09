



import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PetCareGame from './components/PetCareGame';
import RPGAdventure from './components/RPGAdventure';
import Login from './components/Login';
import ParentalDashboard from './components/ParentalDashboard';
import SkillTree from './components/SkillTree';

// i18n setup
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-400">
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/pet-care" element={<PetCareGame />} />
            <Route path="/skill-tree" element={<SkillTree critterType="fluffy_cat" />} />
            <Route path="/rpg-adventure" element={<RPGAdventure />} />
            <Route path="/parental-dashboard" element={<ParentalDashboard />} />
          </Routes>
        </Router>
      </div>
    </I18nextProvider>
  );
};

export default App;



