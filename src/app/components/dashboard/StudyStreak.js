'use client';
import { useState, useEffect } from 'react';
import { fetchFlashcards } from '@/lib/utils';

export default function StudyStreak() {
  const [streak, setStreak] = useState({
    current: 0,
    lastActive: null,
    weeklyActivity: Array(7).fill(0)
  });

  useEffect(() => {
    async function loadStreak() {
      try {
        const flashcards = await fetchFlashcards();
        const today = new Date();
        const lastWeek = new Array(7).fill(0);
        
        // Calculate weekly activity
        flashcards.forEach(card => {
          if (card.lastReviewed) {
            const reviewDate = new Date(card.lastReviewed);
            const dayDiff = Math.floor((today - reviewDate) / (1000 * 60 * 60 * 24));
            if (dayDiff < 7) {
              lastWeek[dayDiff]++;
            }
          }
        });

        // Calculate streak
        let currentStreak = 0;
        let lastActive = null;
        
        for (let i = 0; i < lastWeek.length; i++) {
          if (lastWeek[i] > 0) {
            if (i === 0) currentStreak++;
            lastActive = new Date(today - i * (1000 * 60 * 60 * 24));
          } else if (i === 0) {
            break;
          }
        }

        setStreak({
          current: currentStreak,
          lastActive,
          weeklyActivity: lastWeek.reverse()
        });
      } catch (error) {
        console.error('Failed to load streak data:', error);
      }
    }

    loadStreak();
  }, []);

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <h2 className="card-title">Study Streak</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl font-bold">{streak.current}</div>
          <div className="text-sm opacity-70">
            {streak.lastActive ? (
              <>Last active: {new Date(streak.lastActive).toLocaleDateString()}</>
            ) : (
              'No recent activity'
            )}
          </div>
        </div>
        
        <div className="flex gap-1 justify-between">
          {streak.weeklyActivity.map((count, i) => (
            <div 
              key={i}
              className={`h-16 w-8 rounded-sm ${count > 0 ? 'bg-primary' : 'bg-base-300'}`}
              style={{ opacity: count > 0 ? 0.3 + (count * 0.1) : 0.1 }}
              title={`${count} reviews`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs opacity-70 mt-1">
          <span>7 days ago</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
} 