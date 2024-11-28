'use client';
import { useState, useEffect } from 'react';
import { fetchFlashcards, fetchTexts } from '@/lib/utils';
import StatsOverview from '@/app/components/dashboard/StatsOverview';
import RecentActivity from '@/app/components/dashboard/RecentActivity';
import StudyStreak from '@/app/components/dashboard/StudyStreak';
import QuickActions from '@/app/components/dashboard/QuickActions';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Pre-fetch data for child components
        await Promise.all([
          fetchFlashcards(),
          fetchTexts()
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <StatsOverview />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StudyStreak />
        <QuickActions />
      </div>
      
      <RecentActivity />
    </div>
  );
}