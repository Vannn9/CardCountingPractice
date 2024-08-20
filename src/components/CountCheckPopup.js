import React, { useState } from 'react';


const CountCheckPopup = ({ onCheck, result, onClose }) => {
  const [userCount, setUserCount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCheck(userCount);
  };

  return (
    <div class="count-check-popup">
      {result ? (
        <div>
          <h2>{result}</h2>
          <button onClick={onClose}>Close</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2>Check Your Count</h2>
          <input
            type="number"
            value={userCount}
            onChange={(e) => setUserCount(e.target.value)}
            required
          />
          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
};

export default CountCheckPopup;
