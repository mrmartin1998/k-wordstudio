'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchFlashcards, getLevelColor, getLevelText } from '@/lib/utils';

export default function DeepReviewAnalytics() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageAccuracy: 0,
    streakRecord: 0,
    levelDistribution: Array(6).fill(0),
    dueCards: 0,
    reviewsByDay: {},
    progressByLevel: Array(6).fill(0).map(() => ({
      total: 0,
      correct: 0
    }))
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchFlashcards();
      setCards(data);
      calculateStats(data);
    } catch (error) {
      console.error('Failed to load flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (cards) => {
    const now = new Date();
    const stats = {
      totalReviews: 0,
      correctReviews: 0,
      streakRecord: 0,
      levelDistribution: Array(6).fill(0),
      dueCards: 0,
      reviewsByDay: {},
      progressByLevel: Array(6).fill(0).map(() => ({
        total: 0,
        correct: 0
      }))
    };

    let currentStreak = 0;
    
    cards.forEach(card => {
      // Count cards by level
      stats.levelDistribution[card.level || 0]++;

      // Count due cards
      if (card.nextReview && new Date(card.nextReview) <= now) {
        stats.dueCards++;
      }

      // Process review history
      if (card.reviewHistory) {
        // Group reviews by session to properly track level changes
        const deepReviews = card.reviewHistory
          .filter(review => review.mode === 'deep')
          .reduce((acc, review) => {
            const sessionId = review.sessionId;
            if (!acc[sessionId]) {
              acc[sessionId] = [];
            }
            acc[sessionId].push(review);
            return acc;
          }, {});

        Object.values(deepReviews).forEach(sessionReviews => {
          // Only count final review of each session for level changes
          const finalReview = sessionReviews[sessionReviews.length - 1];
          
          stats.totalReviews++;
          if (finalReview.performance === 1) {
            stats.correctReviews++;
            currentStreak++;
          } else {
            stats.streakRecord = Math.max(stats.streakRecord, currentStreak);
            currentStreak = 0;
          }

          // Track reviews by day
          const day = new Date(finalReview.date).toLocaleDateString();
          stats.reviewsByDay[day] = (stats.reviewsByDay[day] || 0) + 1;

          // Track progress by level
          const level = finalReview.level;
          stats.progressByLevel[level].total++;
          if (finalReview.performance === 1) {
            stats.progressByLevel[level].correct++;
          }
        });
      }
    });

    // Final streak check
    stats.streakRecord = Math.max(stats.streakRecord, currentStreak);

    // Calculate averages and percentages
    stats.averageAccuracy = Math.round((stats.correctReviews / stats.totalReviews) * 100) || 0;

    setStats(stats);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Deep Review Analytics</h1>
        <Link href="/review/deep" className="btn btn-ghost">
          Back to Deep Review
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Overview Stats */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Overview</h2>
              <div className="stats stats-vertical shadow">
                <div className="stat">
                  <div className="stat-title">Total Deep Reviews</div>
                  <div className="stat-value">{stats.totalReviews}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Average Accuracy</div>
                  <div className="stat-value">{stats.averageAccuracy}%</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Cards Due for Review</div>
                  <div className="stat-value text-primary">{stats.dueCards}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Level Distribution */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Level Distribution</h2>
              <div className="flex flex-wrap gap-2">
                {stats.levelDistribution.map((count, level) => (
                  <div key={level} className={`badge ${getLevelColor(level)} badge-lg`}>
                    {getLevelText(level)}: {count}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress by Level */}
          <div className="card bg-base-200 shadow-xl col-span-2">
            <div className="card-body">
              <h2 className="card-title">Progress by Level</h2>
              <div className="space-y-2">
                {stats.progressByLevel.map((level, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className={`badge ${getLevelColor(index)} badge-sm`}>
                      {getLevelText(index)}
                    </span>
                    <progress 
                      className="progress progress-primary w-full"
                      value={level.correct}
                      max={level.total}
                    />
                    <span className="text-sm">
                      {Math.round((level.correct / level.total) * 100) || 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 