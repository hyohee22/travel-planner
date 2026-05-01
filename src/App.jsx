import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Planner from './pages/Planner';
import MapPage from './pages/MapPage';
import Checklist from './pages/Checklist';
import Budget from './pages/Budget';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState('planner');

  return (
    <div className="app-shell">
      <div className="app-container">
        <div className="content-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%' }}
            >
              {activeTab === 'planner' && <Planner />}
              {activeTab === 'map' && <MapPage />}
              {activeTab === 'checklist' && <Checklist />}
              {activeTab === 'budget' && <Budget />}
            </motion.div>
          </AnimatePresence>
        </div>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}

export default App;
