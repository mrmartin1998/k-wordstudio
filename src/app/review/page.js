'use client';
import { Suspense } from 'react';
import ReviewContent from './ReviewContent';

export default function Review() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    }>
      <ReviewContent />
    </Suspense>
  );
} 