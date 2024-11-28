'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchFlashcards, fetchTexts } from '@/lib/utils';

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    async function loadActivity() {
      try {
        const [flashcards, texts] = await Promise.all([
          fetchFlashcards(),
          fetchTexts()
        ]);

        // Get recent flashcards
        const recentCards = flashcards
          .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
          .slice(0, 5)
          .map(card => ({
            type: 'flashcard',
            item: card,
            date: new Date(card.dateAdded),
            text: `Added "${card.word}" to flashcards`
          }));

        // Get recent reviews
        const recentReviews = flashcards
          .filter(card => card.lastReviewed)
          .sort((a, b) => new Date(b.lastReviewed) - new Date(a.lastReviewed))
          .slice(0, 5)
          .map(card => ({
            type: 'review',
            item: card,
            date: new Date(card.lastReviewed),
            text: `Reviewed "${card.word}" (Level ${card.level})`
          }));

        // Combine and sort all activities
        const allActivities = [...recentCards, ...recentReviews]
          .sort((a, b) => b.date - a.date)
          .slice(0, 10);

        setActivities(allActivities);
      } catch (error) {
        console.error('Failed to load activity:', error);
      }
    }

    loadActivity();
  }, []);

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <h2 className="card-title">Recent Activity</h2>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={`badge ${activity.type === 'review' ? 'badge-primary' : 'badge-secondary'}`}>
                  {activity.type === 'review' ? '↻' : '+'} 
                </div>
                <div className="flex-1">
                  <p>{activity.text}</p>
                  <p className="text-sm opacity-70">
                    {activity.date.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center opacity-70">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
} 