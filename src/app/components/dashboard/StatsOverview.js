'use client';
import { useState, useEffect } from 'react';
import { fetchFlashcards, fetchTexts } from '@/lib/utils';
import { getLevelColor } from '@/lib/utils';

export default function StatsOverview() {
  const [stats, setStats] = useState({
    totalTexts: 0,
    activeFlashcards: 0,
    levelDistribution: Array(6).fill(0),
    weeklyReviews: 0
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [flashcards, texts] = await Promise.all([
          fetchFlashcards(),
          fetchTexts()
        ]);

        const distribution = flashcards.reduce((acc, card) => {
          acc[card.level] = (acc[card.level] || 0) + 1;
          return acc;
        }, Array(6).fill(0));

        setStats({
          totalTexts: texts.length,
          activeFlashcards: flashcards.length,
          levelDistribution: distribution,
          weeklyReviews: 0 // We'll implement this later with the review system
        });
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="stat bg-base-200 rounded-box">
        <div className="stat-title">Total Texts</div>
        <div className="stat-value">{stats.totalTexts}</div>
      </div>
      
      <div className="stat bg-base-200 rounded-box">
        <div className="stat-title">Active Flashcards</div>
        <div className="stat-value">{stats.activeFlashcards}</div>
      </div>
      
      <div className="stat bg-base-200 rounded-box">
        <div className="stat-title">Level Distribution</div>
        <div className="stat-value text-sm">
          {stats.levelDistribution.map((count, level) => (
            <span key={level} className={`badge ${getLevelColor(level)} mr-1`}>
              {count}
            </span>
          ))}
        </div>
      </div>
      
      <div className="stat bg-base-200 rounded-box">
        <div className="stat-title">Weekly Reviews</div>
        <div className="stat-value">{stats.weeklyReviews}</div>
      </div>
    </div>
  );
} 