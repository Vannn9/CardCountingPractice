import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SettingsPopup from './SettingsPopup';
import CountCheckPopup from './CountCheckPopup';
import Popup from 'reactjs-popup';
// import 'reactjs-popup/dist/index.css';
import './PracticeScreen.css';
import './CountCheckPopup.css';
const generateDeck = (numDecks) => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = [
    '2', '3', '4', '5', '6', '7', '8', '9', '10',
    'J', 'Q', 'K', 'A'
  ];

  let deck = [];
  for (let i = 0; i < numDecks; i++) {
    for (let suit of suits) {
      for (let value of values) {
        deck.push({ suit, value });
      }
    }
  }

  return deck.sort(() => Math.random() - 0.5); // shuffle the deck
};

const cardValue = (card, system) => {
  switch (system) {
    case 'Hi-Lo':
      if (['2', '3', '4', '5', '6'].includes(card.value)) return 1;
      if (['10', 'J', 'Q', 'K', 'A'].includes(card.value)) return -1;
      return 0;
    // Add logic for other systems here
    default:
      return 0;
  }
};

const getCardImage = (card) => {
  return `/cards/${card.value}_of_${card.suit}.svg`;
};

const calculateHandValue = (hand) => {
  let value = 0;
  let aces = 0;

  hand.forEach(card => {
    if (['J', 'Q', 'K'].includes(card.value)) {
      value += 10;
    } else if (card.value === 'A') {
      aces += 1;
      value += 11;
    } else {
      value += parseInt(card.value);
    }
  });

  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }

  return value;
};

const PracticeScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const system = params.get('system');
  const [decks, setDecks] = useState(1);
  const [frequency, setFrequency] = useState(3);
  const [deck, setDeck] = useState([]);
  const [runningCount, setRunningCount] = useState(0);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameOver, setGameOver] = useState(true);
  const [handCount, setHandCount] = useState(0);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [showCountCheckPopup, setShowCountCheckPopup] = useState(false);
  const [countCheckResult, setCountCheckResult] = useState('');
  const [pendingNewHand, setPendingNewHand] = useState(false);

  useEffect(() => {
    setDeck(generateDeck(decks));
  }, [decks]);

  const dealNewHand = () => {
    if (showCountCheckPopup) return; // Prevent dealing a new hand if the count check popup is open

    // Ensure the deck has enough cards to deal a new hand
    if (deck.length < 4) {
      alert('Not enough cards left in the deck. Resetting the deck.');
      setDeck(generateDeck(decks));
      setRunningCount(0);
      setPlayerHand([]);
      setDealerHand([]);
      setHandCount(0);
      setGameOver(true);
      return;
    }

    // Deal new cards
    const newPlayerHand = [deck[0], deck[2]];
    const newDealerHand = [deck[1], deck[3]];

    // Remove dealt cards from the deck
    let newDeck = deck.slice(4);

    // Calculate initial running count
    let newRunningCount =
      runningCount +
      cardValue(newPlayerHand[0], system) +
      cardValue(newPlayerHand[1], system) +
      cardValue(newDealerHand[0], system) +
      cardValue(newDealerHand[1], system); // Include dealer's hole card in the initial count

    // Update state
    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setDeck(newDeck);
    setRunningCount(newRunningCount);
    setGameOver(false);
    setPlayerTurn(true);

    // Check for blackjack
    if (calculateHandValue(newPlayerHand) === 21 || calculateHandValue(newDealerHand) === 21) {
      setGameOver(true);
      setHandCount(prevCount => prevCount + 1);
      setPlayerTurn(false);
      return;
    }

    // Start playing out the hand
    playOutHand(newPlayerHand, newDealerHand, newRunningCount, newDeck);
  };

  const playOutHand = async (newPlayerHand, newDealerHand, newRunningCount, newDeck) => {
    let playerValue = calculateHandValue(newPlayerHand);
    let dealerValue = calculateHandValue(newDealerHand);

    // Player's turn
    while (playerValue < 17) {
      const newCard = newDeck[0];
      newPlayerHand.push(newCard);
      newRunningCount += cardValue(newCard, system);
      playerValue = calculateHandValue(newPlayerHand);
      newDeck = newDeck.slice(1);
      setPlayerHand([...newPlayerHand]);
      setDeck(newDeck);
      setRunningCount(newRunningCount);
      await new Promise(resolve => setTimeout(resolve, 500)); // Faster dealing
      if (playerValue > 21 || playerValue === 21) break; // Bust or blackjack, end turn
    }

    // Dealer's turn
    if (playerValue <= 21) {
      setPlayerTurn(false); // Player's turn is over, reveal dealer's second card
      while (dealerValue < 17) {
        const newCard = newDeck[0];
        newDealerHand.push(newCard);
        newRunningCount += cardValue(newCard, system);
        dealerValue = calculateHandValue(newDealerHand);
        newDeck = newDeck.slice(1);
        setDealerHand([...newDealerHand]);
        setDeck(newDeck);
        setRunningCount(newRunningCount);
        await new Promise(resolve => setTimeout(resolve, 500)); // Faster dealing
      }
    } else {
      // Player busts, reveal dealer's hole card
      setPlayerTurn(false);
      newRunningCount += cardValue(newDealerHand[1], system);
      setDealerHand([...newDealerHand]);
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay for card flipping
    }

    // Set game over and increment hand count after each completed hand
    setGameOver(true);
    setHandCount(prevCount => prevCount + 1);
  };

  const handleSettingsSave = (newDecks, newFrequency) => {
    setDecks(newDecks);
    setFrequency(newFrequency);
    setDeck(generateDeck(newDecks));
    setRunningCount(0);
    setPlayerHand([]);
    setDealerHand([]);
    setHandCount(0);
    setGameOver(true);
    setShowSettingsPopup(false);
  };

  const handleCountCheck = (userCount) => {
    if (parseInt(userCount) === runningCount) {
      setCountCheckResult(`Correct! The actual count is ${runningCount}.`);
    } else {
      setCountCheckResult(`Incorrect. The actual count is ${runningCount}.`);
    }
  };

  const closeCountCheckPopup = () => {
    setShowCountCheckPopup(false);
    setCountCheckResult('');
    setPendingNewHand(false);
    setHandCount(0); // Reset hand count after checking
    dealNewHand(); // Deal the next hand after closing the count check popup
  };

  const handleDealButton = () => {
    if (pendingNewHand) {
      closeCountCheckPopup();
    } else if (handCount > 0 && handCount % frequency === 0) {
      setPlayerHand([]);
      setDealerHand([]);
      setPendingNewHand(true);
      setShowCountCheckPopup(true);
    } else {
      dealNewHand();
    }
  };

  return (
    <div className='container'>
      <h1>Practice with {system} System</h1>
      <div className='buttonGroup'>
        <button onClick={() => navigate('/')} className='button'>Go Back</button>
        <button onClick={() => setShowSettingsPopup(true)} className='button'>Options</button>
      </div>
      <div className='dealButtonContainer'>
        <button onClick={handleDealButton} disabled={!gameOver} className='button'>Deal New Hand</button>
      </div>
      {/* <p>count: {runningCount}</p>
      <p>decks: {decks}</p> */}
      {dealerHand.length > 0 && (
        <div className='handContainer'>
          <h2>Dealer Hand</h2>
          <div className='handCardContainer'>
          {dealerHand.map((card, index) => (
            <img
              key={index}
              src={index === 1 && playerTurn ? '/cards/card_back.svg' : getCardImage(card)}
              alt={index === 1 && playerTurn ? 'card back' : `${card.value} of ${card.suit}`}
              className='card'
            />
          ))}
          </div>
        </div>
      )}
      {playerHand.length > 0 && (
        <div className='handContainer'>
          <h2>Player Hand</h2>
          <div className='handCardContainer'>
          {playerHand.map((card, index) => (
            <img 
              key={index}
              src={getCardImage(card)}
              alt={`${card.value} of ${card.suit}`}
              className='card'
            />
          ))}
          </div>
        </div>
      )}
      <Popup open={showSettingsPopup} onClose={() => setShowSettingsPopup(false)} modal>
        <SettingsPopup
          onSave={handleSettingsSave}
          initialDecks={decks}
          initialFrequency={frequency}
        />
      </Popup>
      <Popup
        open={showCountCheckPopup}
        onClose={closeCountCheckPopup}
        closeOnDocumentClick={false}
        closeOnEscape={false}
        overlayStyle={{ background: 'rgba(0, 0, 0, 0.5)' }}
        modal
      >
        <CountCheckPopup
          onCheck={handleCountCheck}
          result={countCheckResult}
          onClose={closeCountCheckPopup}
        />
      </Popup>
    </div>
  );
};

export default PracticeScreen;
