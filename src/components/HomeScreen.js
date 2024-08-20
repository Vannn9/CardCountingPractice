import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeScreen.css'

const HomeScreen = () => {
  const [selectedSystem, setSelectedSystem] = useState('Hi-Lo');
  const navigate = useNavigate();

  const startPractice = () => {
    navigate(`/practice?system=${selectedSystem}`);
  };

  return (
    <div className='container'>
      <h1>Select Counting System</h1>
      <select value={selectedSystem} onChange={(e) => setSelectedSystem(e.target.value)}>
        <option value="Hi-Lo">Hi-Lo</option>
        <option value="KO">KO</option>
        <option value="Omega II">Omega II</option>
        {/* Add more counting systems as needed */}
      </select>
      <button onClick={startPractice}>Start Practice</button>
    </div>
  );
};

export default HomeScreen;
