'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Review() {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewMode, setReviewMode] = useState('all'); // all, new, learning

  useEffect(() => {
    const saved = localStorage.getItem('flashcards');
    if (saved) {
      const allCards = JSON.parse(saved);
      const filtered = reviewMode === 'all' 
        ? allCards 
        : allCards.filter(card => card.status === reviewMode);
      setCards(filtered);
    }
  }, [reviewMode]);

  const handleNext = () => {
    setShowAnswer(false);
    setCurrentIndex(i => (i + 1) % cards.length);
  };

  const handleStatusChange = (newStatus) => {
    const updatedCards = JSON.parse(localStorage.getItem('flashcards'));
    const cardIndex = updatedCards.findIndex(c => c.word === cards[currentIndex].word);
    if (cardIndex !== -1) {
      updatedCards[cardIndex].status = newStatus;
      localStorage.setItem('flashcards', JSON.stringify(updatedCards));
      handleNext();
    }
  };

  if (cards.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Review</h1>
        <p>No cards to review. Add some flashcards first!</p>
        <Link href="/flashcards" className="btn btn-primary mt-4">
          Go to Flashcards
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Review</h1>
        <div className="flex gap-2">
          <select 
            className="select select-bordered"
            value={reviewMode}
            onChange={(e) => setReviewMode(e.target.value)}
          >
            <option value="all">All Cards</option>
            <option value="new">New Only</option>
            <option value="learning">Learning Only</option>
          </select>
          <Link href="/flashcards" className="btn btn-ghost">
            Back to Flashcards
          </Link>
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl max-w-2xl mx-auto">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">{cards[currentIndex].word}</h2>
          <p className="text-sm mb-4">Context: {cards[currentIndex].context}</p>
          
          {showAnswer ? (
            <>
              <div className="text-xl mb-4">{cards[currentIndex].translation}</div>
              {cards[currentIndex].notes && (
                <div className="text-sm mb-4">Notes: {cards[currentIndex].notes}</div>
              )}
              <div className="flex gap-2 justify-center">
                <button 
                  className="btn btn-warning"
                  onClick={() => handleStatusChange('new')}
                >
                  Again
                </button>
                <button 
                  className="btn btn-info"
                  onClick={() => handleStatusChange('learning')}
                >
                  Good
                </button>
                <button 
                  className="btn btn-success"
                  onClick={() => handleStatusChange('known')}
                >
                  Easy
                </button>
              </div>
            </>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={() => setShowAnswer(true)}
            >
              Show Answer
            </button>
          )}
          
          <div className="text-center text-sm mt-4">
            Card {currentIndex + 1} of {cards.length}
          </div>
        </div>
      </div>
    </div>
  );
} 