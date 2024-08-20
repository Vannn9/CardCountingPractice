import React, { useState } from 'react';

const SettingsPopup = ({ onSave, initialDecks, initialFrequency }) => {
  const [decks, setDecks] = useState(initialDecks);
  const [frequency, setFrequency] = useState(initialFrequency);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(decks, frequency);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Settings</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Number of Decks:</label>
          <input
            type="number"
            value={decks}
            onChange={(e) => setDecks(parseInt(e.target.value))}
            min="1"
          />
        </div>
        <div>
          <label>Check Frequency:</label>
          <input
            type="number"
            value={frequency}
            onChange={(e) => setFrequency(parseInt(e.target.value))}
            min="1"
          />
        </div>
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default SettingsPopup;
