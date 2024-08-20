import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeScreen from './components/HomeScreen';
import PracticeScreen from './components/PracticeScreen';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/practice" element={<PracticeScreen />} />
      </Routes>
    </Router>
  );
};

export default App;
