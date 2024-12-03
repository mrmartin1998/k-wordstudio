'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchFlashcards, updateFlashcard, getLevelColor, getLevelText } from '@/lib/utils';
import EditFlashcardModal from '@/app/components/flashcards/EditFlashcardModal';
import ReviewSummary from '@/app/components/review/ReviewSummary';
import ProgressBar from '@/app/components/review/ProgressBar';

export default function DeepDiveReview() {
  const router = useRouter();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionConfig, setSessionConfig] = useState({
    duration: 15, // minutes
    focusAreas: [], // specific levels or types
    reviewMethod: 'spaced', // 'spaced' or 'random'
  });
  const [reviewQueue, setReviewQueue] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    startTime: null,
    cardsReviewed: 0,
    correctCount: 0,
    streakCount: 0,
    levelChanges: Array(6).fill(0),
    performance: [] // detailed performance tracking
  });
  const [showAnswer, setShowAnswer] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [performance, setPerformance] = useState(0); // 0-5 rating
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditCard, setCurrentEditCard] = useState(null);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const data = await fetchFlashcards();
      setCards(data);
    } catch (error) {
      console.error('Failed to load flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextReview = (card, performance) => {
    const easeFactor = card.easeFactor || 2.5;
    const interval = card.interval || 1;
    
    // Calculate new interval based on performance (0-5 scale)
    const newInterval = performance >= 4 
      ? Math.round(interval * easeFactor)
      : performance >= 2 ? interval : 1;

    // Adjust ease factor based on performance
    const newEaseFactor = Math.max(1.3, Math.min(2.5, 
      easeFactor + (0.1 - (5 - performance) * (0.08 + (5 - performance) * 0.02))
    ));

    return {
      interval: newInterval,
      easeFactor: newEaseFactor,
      nextReview: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000)
    };
  };

  const formatTimeRemaining = () => {
    if (!sessionStats.startTime) return '--:--';
    
    const elapsed = (new Date() - new Date(sessionStats.startTime)) / 1000 / 60; // minutes
    const remaining = Math.max(0, sessionConfig.duration - elapsed);
    
    const minutes = Math.floor(remaining);
    const seconds = Math.floor((remaining - minutes) * 60);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAnswer = async (correct) => {
    if (!currentCard || !currentCard._id) return;

    try {
      // Calculate spaced repetition updates
      const spacingUpdates = calculateNextReview(currentCard, correct ? 5 : 1);
      
      // Update card with new spacing and performance data
      const updates = {
        ...spacingUpdates,
        reviewCount: (currentCard.reviewCount || 0) + 1,
        correctCount: (currentCard.correctCount || 0) + (correct ? 1 : 0),
        lastReviewed: new Date(),
        level: correct 
          ? Math.min(5, (currentCard.level || 0) + 1)
          : Math.max(0, (currentCard.level || 0) - 1),
        reviewHistory: [
          ...(currentCard.reviewHistory || []),
          {
            date: new Date(),
            performance: correct ? 1 : 0,
            interval: spacingUpdates.interval,
            mode: 'deep'
          }
        ]
      };

      const updated = await updateFlashcard(currentCard._id, updates);
      
      // Update session stats
      setSessionStats(prev => ({
        ...prev,
        cardsReviewed: prev.cardsReviewed + 1,
        correctCount: prev.correctCount + (correct ? 1 : 0),
        streakCount: correct ? prev.streakCount + 1 : 0,
        levelChanges: prev.levelChanges.map((count, i) => 
          i === updates.level ? count + 1 : count
        ),
        performance: [...prev.performance, correct ? 1 : 0]
      }));

      // Move to next card
      const currentIndex = reviewQueue.findIndex(card => card._id === currentCard._id);
      if (currentIndex < reviewQueue.length - 1) {
        setCurrentCard(reviewQueue[currentIndex + 1]);
      } else {
        // Session complete
        setReviewQueue([]);
        setCurrentCard(null);
      }

      // Reset UI state
      setShowAnswer(false);
      setShowContext(false);

    } catch (error) {
      console.error('Failed to update flashcard:', error);
    }
  };

  const handleStartSession = () => {
    let filtered = cards;
    
    // Filter by focus areas if specified
    if (sessionConfig.focusAreas.length > 0) {
      filtered = filtered.filter(card => 
        sessionConfig.focusAreas.includes(card.level)
      );
    }

    // Apply spaced repetition filtering if selected
    if (sessionConfig.reviewMethod === 'spaced') {
      filtered = filtered.filter(card => {
        if (!card.nextReview) return true;
        return new Date(card.nextReview) <= new Date();
      });
      
      // Sort by due date (oldest first)
      filtered.sort((a, b) => {
        const aDate = a.nextReview ? new Date(a.nextReview) : new Date(0);
        const bDate = b.nextReview ? new Date(b.nextReview) : new Date(0);
        return aDate - bDate;
      });
    } else {
      // Random order for non-spaced review
      filtered = filtered.sort(() => Math.random() - 0.5);
    }

    // Check if we have cards to review
    if (filtered.length === 0) {
      alert('No cards available for review with current settings');
      return;
    }

    setReviewQueue(filtered);
    setCurrentCard(filtered[0]);
    setSessionStats({
      startTime: new Date(),
      cardsReviewed: 0,
      correctCount: 0,
      streakCount: 0,
      levelChanges: Array(6).fill(0),
      performance: []
    });
  };

  const handleEditCard = (card) => {
    setCurrentEditCard(card);
    setIsEditModalOpen(true);
  };

  const handleSaveCard = async (updatedCard) => {
    try {
      const updated = await updateFlashcard(currentEditCard._id, {
        ...updatedCard,
        lastModified: new Date()
      });
      
      setReviewQueue(prevQueue => 
        prevQueue.map(card => card._id === currentEditCard._id ? updated : card)
      );
      
      if (currentCard._id === currentEditCard._id) {
        setCurrentCard(updated);
      }
      
      setIsEditModalOpen(false);
      setCurrentEditCard(null);
    } catch (error) {
      console.error('Failed to update flashcard:', error);
    }
  };

  const ReviewInterface = () => {
    if (!currentCard) return null;

    return (
      <div className="card bg-base-200 shadow-xl max-w-2xl mx-auto">
        <div className="card-body">
          <ProgressBar 
            current={sessionStats.cardsReviewed + 1}
            total={reviewQueue.length}
            timeRemaining={formatTimeRemaining()}
          />
          
          <div className="text-center relative">
            <button 
              className="btn btn-ghost btn-circle absolute top-0 right-0"
              onClick={() => handleEditCard(currentCard)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{currentCard.word}</h2>
              
              <button 
                className="btn btn-ghost btn-circle"
                onClick={() => handleSpeak(currentCard.word)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>

              {showContext && (
                <div className="text-sm opacity-70 mt-2">
                  {currentCard.context}
                </div>
              )}

              {showAnswer && (
                <div className="space-y-4 mt-4">
                  <p className="text-xl">{currentCard.translation}</p>
                  <div className="divider">How did you do?</div>
                  <div className="flex gap-2 justify-center mt-4">
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
                </div>
              )}

              {!showAnswer && (
                <div className="space-y-4 mt-4">
                  <button 
                    className="btn btn-ghost"
                    onClick={() => setShowContext(!showContext)}
                  >
                    {showContext ? 'Hide Context' : 'Show Context'}
                  </button>
                  <div className="block">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowAnswer(true)}
                    >
                      Show Answer
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="text-sm text-base-content/50 mt-4">
              Time remaining: {formatTimeRemaining()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Deep Dive Review</h1>
        <Link href="/review" className="btn btn-ghost">
          Back to Review
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      ) : reviewQueue.length > 0 ? (
        <ReviewInterface />
      ) : sessionStats.cardsReviewed > 0 ? (
        <ReviewSummary 
          stats={{
            totalReviewed: sessionStats.cardsReviewed,
            correctCount: sessionStats.correctCount,
            levelChanges: sessionStats.levelChanges
          }}
          onRestart={() => {
            setSessionStats({
              startTime: null,
              cardsReviewed: 0,
              correctCount: 0,
              streakCount: 0,
              levelChanges: Array(6).fill(0),
              performance: []
            });
            setShowAnswer(false);
            setShowContext(false);
          }}
          onClose={() => router.push('/review')}
        />
      ) : (
        <div className="card bg-base-200 p-6 max-w-md mx-auto">
          <h2 className="text-xl mb-4">Configure Deep Dive Session</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Session Duration (minutes)</label>
              <input
                type="number"
                value={sessionConfig.duration}
                onChange={(e) => setSessionConfig({
                  ...sessionConfig,
                  duration: parseInt(e.target.value)
                })}
                className="input input-bordered w-full"
                min="5"
                max="60"
              />
            </div>

            <div>
              <label className="label">Focus Areas</label>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4, 5].map(level => (
                  <label key={level} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={sessionConfig.focusAreas.includes(level)}
                      onChange={(e) => {
                        const areas = e.target.checked
                          ? [...sessionConfig.focusAreas, level]
                          : sessionConfig.focusAreas.filter(l => l !== level);
                        setSessionConfig({...sessionConfig, focusAreas: areas});
                      }}
                      className="checkbox checkbox-sm"
                    />
                    <span className={`badge ${getLevelColor(level)}`}>
                      {getLevelText(level)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Review Method</label>
              <select
                value={sessionConfig.reviewMethod}
                onChange={(e) => setSessionConfig({
                  ...sessionConfig,
                  reviewMethod: e.target.value
                })}
                className="select select-bordered w-full"
              >
                <option value="spaced">Spaced Repetition</option>
                <option value="random">Random Order</option>
              </select>
            </div>

            <button 
              className="btn btn-primary w-full mt-6"
              onClick={handleStartSession}
            >
              Start Deep Dive
            </button>
          </div>
        </div>
      )}

      <EditFlashcardModal
        isOpen={isEditModalOpen}
        card={currentEditCard}
        onSave={handleSaveCard}
        onClose={() => {
          setIsEditModalOpen(false);
          setCurrentEditCard(null);
        }}
      />
    </div>
  );
} 