'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { fetchFlashcards, fetchTexts, updateFlashcard } from '@/lib/utils';

export default function ReviewContent() {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewSize, setReviewSize] = useState(20);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [reviewQueue, setReviewQueue] = useState([]);
  const [selectedText, setSelectedText] = useState('all');
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [cardsData, textsData] = await Promise.all([
        fetchFlashcards(),
        fetchTexts()
      ]);
      setCards(cardsData);
      setTexts(textsData);
      
      const textId = searchParams.get('textId');
      if (textId) {
        setSelectedText(textId);
        const filtered = cardsData.filter(card => card.sourceTextId === textId);
        if (filtered.length > 0) {
          const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, reviewSize);
          const firstHalf = [...shuffled];
          const secondHalf = [...shuffled];
          secondHalf.sort(() => Math.random() - 0.5);
          setReviewQueue([...firstHalf, ...secondHalf]);
          setCurrentIndex(0);
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleAnswer = async (correct) => {
    const currentCard = reviewQueue[currentIndex];
    if (!currentCard || !currentCard._id) {
      console.error('No valid card found at current index');
      return;
    }

    try {
      const updates = {
        reviewCount: (currentCard.reviewCount || 0) + 1,
        correctCount: (currentCard.correctCount || 0) + (correct ? 1 : 0),
        lastReviewed: new Date(),
        level: correct && currentCard.correctCount % 2 === 0
          ? Math.min(5, (currentCard.level || 0) + 1)
          : Math.max(0, (currentCard.level || 0) - 1)
      };

      const updated = await updateFlashcard(currentCard._id, updates);
      
      setCards(prevCards => 
        prevCards.map(card => card._id === currentCard._id ? updated : card)
      );
      
      handleNext();
    } catch (error) {
      console.error('Failed to update flashcard:', error);
    }
  };

  const handleNext = () => {
    setShowAnswer(false);
    if (currentIndex < reviewQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Review session complete
      setCurrentIndex(0);
      setReviewQueue([]);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Review</h1>
        <Link href="/flashcards" className="btn btn-ghost">
          Back to Flashcards
        </Link>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg">No cards to review. Add some flashcards first!</p>
          <Link href="/flashcards" className="btn btn-primary mt-4">
            Go to Flashcards
          </Link>
        </div>
      ) : reviewQueue.length > 0 ? (
        <div className="card bg-base-200 shadow-xl max-w-2xl mx-auto">
          <div className="card-body">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">{reviewQueue[currentIndex].word}</h2>
              {showAnswer ? (
                <>
                  <p className="text-xl mb-4">{reviewQueue[currentIndex].translation}</p>
                  {reviewQueue[currentIndex].context && (
                    <p className="text-sm text-base-content/70 mb-4">
                      Context: {reviewQueue[currentIndex].context}
                    </p>
                  )}
                  <div className="flex gap-2 justify-center">
                    <button 
                      className="btn btn-error"
                      onClick={() => handleAnswer(false)}
                    >
                      ✗ Wrong
                    </button>
                    <button 
                      className="btn btn-success"
                      onClick={() => handleAnswer(true)}
                    >
                      ✓ Correct
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
              <div className="text-sm text-base-content/50 mt-4">
                Card {currentIndex + 1} of {reviewQueue.length}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card bg-base-200 p-6 max-w-md mx-auto">
          <h2 className="text-xl mb-4">Start Review Session</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Number of cards</label>
              <input
                type="number"
                value={reviewSize}
                onChange={(e) => setReviewSize(parseInt(e.target.value))}
                className="input input-bordered w-full"
                min="1"
                max="100"
              />
            </div>
            <div>
              <label className="label">Level to review</label>
              <select
                className="select select-bordered w-full"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="0">Level 0 (New)</option>
                <option value="1">Level 1 (Beginning)</option>
                <option value="2">Level 2 (Learning)</option>
                <option value="3">Level 3 (Intermediate)</option>
                <option value="4">Level 4 (Advanced)</option>
                <option value="5">Level 5 (Known)</option>
              </select>
            </div>
            <div>
              <label className="label">Text to review</label>
              <select
                className="select select-bordered w-full"
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value)}
              >
                <option value="all">All Texts</option>
                {texts.map(text => (
                  <option key={text.id} value={text.id}>{text.title}</option>
                ))}
              </select>
            </div>
            <button 
              className="btn btn-primary w-full"
              onClick={() => {
                let filtered = selectedLevel === 'all'
                  ? cards
                  : cards.filter(card => card.level === parseInt(selectedLevel));
                
                if (selectedText !== 'all') {
                  filtered = filtered.filter(card => card.sourceTextId === selectedText);
                }
                
                const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, reviewSize);
                const firstHalf = [...shuffled];
                const secondHalf = [...shuffled];
                secondHalf.sort(() => Math.random() - 0.5);
                setReviewQueue([...firstHalf, ...secondHalf]);
                setCurrentIndex(0);
                setShowAnswer(false);
              }}
            >
              Start Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 