'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import WordModal from '@/components/WordModal';
import { fetchFlashcards, createFlashcard, updateFlashcard, deleteFlashcard } from '@/lib/utils';

export default function Flashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      const data = await fetchFlashcards();
      setFlashcards(data);
    } catch (error) {
      console.error('Failed to load flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFlashcard(id);
      setFlashcards(flashcards.filter(card => card._id !== id));
    } catch (error) {
      console.error('Failed to delete flashcard:', error);
    }
  };

  const handleEdit = async (id, updates) => {
    try {
      const updated = await updateFlashcard(id, updates);
      setFlashcards(flashcards.map(card => 
        card._id === id ? updated : card
      ));
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update flashcard:', error);
    }
  };

  const handleLevelChange = async (id) => {
    const card = flashcards.find(c => c._id === id);
    if (!card) return;

    const currentLevel = card.level || 0;
    const nextLevel = (currentLevel + 1) % 6;

    try {
      const updated = await updateFlashcard(id, {
        level: nextLevel,
        lastReviewed: new Date()
      });
      
      setFlashcards(flashcards.map(card => 
        card._id === id ? updated : card
      ));
    } catch (error) {
      console.error('Failed to update flashcard level:', error);
    }
  };

  const getSortedCards = (cards) => {
    return [...cards].sort((a, b) => {
      switch (sortBy) {
        case 'word':
          return sortOrder === 'asc' 
            ? a.word.localeCompare(b.word)
            : b.word.localeCompare(a.word);
        case 'status':
          return sortOrder === 'asc'
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
        case 'dateAdded':
          return sortOrder === 'asc'
            ? new Date(a.dateAdded) - new Date(b.dateAdded)
            : new Date(b.dateAdded) - new Date(a.dateAdded);
        default:
          return 0;
      }
    });
  };

  const sortingControls = (
    <div className="flex gap-4 mb-6">
      <select 
        className="select select-bordered"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="dateAdded">Date Added</option>
        <option value="word">Word</option>
        <option value="status">Status</option>
      </select>
      
      <button 
        className="btn btn-ghost"
        onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
      >
        {sortOrder === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  );

  const filteredCards = getSortedCards(
    flashcards.filter(card => 
      card.word.toLowerCase().includes(filter.toLowerCase()) ||
      card.translation?.toLowerCase().includes(filter.toLowerCase()) ||
      card.notes?.toLowerCase().includes(filter.toLowerCase())
    )
  );

  const getLevelColor = (level) => {
    switch(level) {
      case 0: return 'badge-error';    // Red - New
      case 1: return 'badge-warning';  // Orange - Beginning
      case 2: return 'badge-info';     // Blue - Learning
      case 3: return 'badge-primary';  // Purple - Intermediate
      case 4: return 'badge-secondary';// Gray - Advanced
      case 5: return 'badge-success';  // Green - Known
      default: return 'badge-error';
    }
  };

  const getLevelText = (level) => {
    switch(level) {
      case 0: return 'New';
      case 1: return 'Beginning';
      case 2: return 'Learning';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Known';
      default: return 'New';
    }
  };

  const handleSelectAll = () => {
    if (selectedCards.size === filteredCards.length) {
      setSelectedCards(new Set());
    } else {
      setSelectedCards(new Set(filteredCards.map((_, index) => index)));
    }
  };

  const handleBulkDelete = () => {
    const newCards = flashcards.filter((_, index) => !selectedCards.has(index));
    setFlashcards(newCards);
    setSelectedCards(new Set());
  };

  const handleBulkStatusChange = (newStatus) => {
    const newCards = [...flashcards];
    selectedCards.forEach(index => {
      newCards[index] = { ...newCards[index], status: newStatus };
    });
    setFlashcards(newCards);
    setSelectedCards(new Set());
  };

  const bulkActionControls = (
    <div className="flex gap-2 mb-6">
      <button
        className="btn btn-sm"
        onClick={handleSelectAll}
      >
        {selectedCards.size === filteredCards.length ? 'Deselect All' : 'Select All'}
      </button>
      
      {selectedCards.size > 0 && (
        <>
          <div className="dropdown dropdown-hover">
            <label tabIndex={0} className="btn btn-sm">
              Change Status
            </label>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><button onClick={() => handleBulkStatusChange('new')}>New</button></li>
              <li><button onClick={() => handleBulkStatusChange('learning')}>Learning</button></li>
              <li><button onClick={() => handleBulkStatusChange('known')}>Known</button></li>
            </ul>
          </div>
          
          <button
            className="btn btn-sm btn-error"
            onClick={handleBulkDelete}
          >
            Delete Selected
          </button>
          
          <span className="text-sm self-center">
            {selectedCards.size} selected
          </span>
        </>
      )}
    </div>
  );

  const handleSaveFlashcard = (flashcard) => {
    const newCards = [...flashcards, flashcard];
    setFlashcards(newCards);
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Flashcards</h1>
        <div className="flex gap-2">
          <button 
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            Add Word
          </button>
          <Link href="/review" className="btn btn-secondary">
            Review
          </Link>
          <Link href="/" className="btn btn-ghost">
            Back to Reader
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {bulkActionControls}
        
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search flashcards..."
            className="input input-bordered w-full md:w-96"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {sortingControls}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map((card, index) => (
          <div key={index} className={`card bg-base-200 shadow-xl ${
            selectedCards.has(index) ? 'ring-2 ring-primary' : ''
          }`}>
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectedCards.has(index)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedCards);
                      if (e.target.checked) {
                        newSelected.add(index);
                      } else {
                        newSelected.delete(index);
                      }
                      setSelectedCards(newSelected);
                    }}
                  />
                  <h2 className="card-title">{card.word}</h2>
                </div>
                <div className="flex gap-2">
                  <button 
                    className={`badge ${getLevelColor(card.level)} cursor-pointer`}
                    onClick={() => handleLevelChange(card._id)}
                  >
                    {getLevelText(card.level)}
                  </button>
                  <button 
                    className="btn btn-ghost btn-xs"
                    onClick={() => setEditingId(index)}
                  >
                    ✎
                  </button>
                  <button 
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => handleDelete(card._id)}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {editingId === index ? (
                <div className="space-y-2 mt-2">
                  <div>
                    <label className="label">Translation</label>
                    <input
                      type="text"
                      value={card.translation || ''}
                      onChange={(e) => handleEdit(card._id, { translation: e.target.value })}
                      className="input input-bordered w-full"
                      placeholder="Translation"
                    />
                  </div>
                  <div>
                    <label className="label">Notes</label>
                    <textarea
                      value={card.notes || ''}
                      onChange={(e) => handleEdit(card._id, { notes: e.target.value })}
                      className="textarea textarea-bordered w-full"
                      placeholder="Notes"
                    />
                  </div>
                  <button 
                    className="btn btn-sm"
                    onClick={() => setEditingId(null)}
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <>
                  {card.translation && <p className="text-lg">{card.translation}</p>}
                  {card.context && (
                    <p className="text-sm text-base-content/70 mt-2">
                      Context: {card.context}
                    </p>
                  )}
                  {card.notes && <p className="text-sm mt-2">Notes: {card.notes}</p>}
                </>
              )}
              
              <div className="text-xs text-base-content/50 mt-2 space-y-1">
                <div>Added: {new Date(card.dateAdded).toLocaleString()}</div>
                {card.lastReviewed && (
                  <div>Last reviewed: {new Date(card.lastReviewed).toLocaleString()}</div>
                )}
                {card.reviewCount > 0 && (
                  <div>Reviews: {card.reviewCount} (Correct: {card.correctCount})</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg">No flashcards found</p>
        </div>
      )}

      <WordModal
        isOpen={isModalOpen}
        onSave={handleSaveFlashcard}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
} 