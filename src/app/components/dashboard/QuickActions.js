'use client';
import Link from 'next/link';

export default function QuickActions() {
  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <h2 className="card-title">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link 
            href="/texts/upload" 
            className="btn btn-primary"
          >
            Upload Text
          </Link>
          
          <Link 
            href="/review" 
            className="btn btn-secondary"
          >
            Start Review
          </Link>
          
          <Link 
            href="/flashcards" 
            className="btn btn-accent"
          >
            Manage Cards
          </Link>
          
          <Link 
            href="/texts" 
            className="btn btn-info"
          >
            Browse Texts
          </Link>
        </div>
      </div>
    </div>
  );
} 