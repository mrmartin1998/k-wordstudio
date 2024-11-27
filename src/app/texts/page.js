'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Texts() {
  const [texts, setTexts] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('texts');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const handleDeleteText = (id) => {
    const newTexts = texts.filter(text => text.id !== id);
    setTexts(newTexts);
    localStorage.setItem('texts', JSON.stringify(newTexts));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Saved Texts</h1>
        <Link href="/" className="btn btn-primary">
          Add New Text
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {texts.map((text) => (
          <div key={text.id} className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{text.title}</h2>
              <p className="text-sm text-base-content/70">
                {text.content.slice(0, 100)}...
              </p>
              <div className="text-xs text-base-content/50">
                Added: {new Date(text.dateAdded).toLocaleString()}
              </div>
              <div className="card-actions justify-end mt-4">
                <Link 
                  href={`/?textId=${text.id}`} 
                  className="btn btn-sm btn-primary"
                >
                  Open
                </Link>
                <button 
                  className="btn btn-sm btn-ghost btn-error"
                  onClick={() => handleDeleteText(text.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {texts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg">No saved texts</p>
          <Link href="/" className="btn btn-primary mt-4">
            Upload a Text
          </Link>
        </div>
      )}
    </div>
  );
} 