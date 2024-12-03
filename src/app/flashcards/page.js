'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import WordModal from '@/app/components/WordModal';
import { fetchFlashcards, createFlashcard, updateFlashcard, deleteFlashcard } from '@/lib/utils';
import EditFlashcardModal from '@/app/components/flashcards/EditFlashcardModal';
import { getLevelColor, getLevelText } from '@/lib/utils';

export default function Flashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);

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

  const handleEditCard = (card) => {
    setCurrentCard(card);
    setIsEditModalOpen(true);
  };

  const handleSaveCard = async (updatedCard) => {
    try {
      const updated = await updateFlashcard(currentCard._id, {
        ...updatedCard,
        lastModified: new Date(),
        lastReviewed: updatedCard.level !== currentCard.level ? new Date() : currentCard.lastReviewed
      });
      
      setFlashcards(flashcards.map(card => 
        card._id === currentCard._id ? updated : card
      ));
      
      setIsEditModalOpen(false);
      setCurrentCard(null);
    } catch (error) {
      console.error('Failed to update flashcard:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Flashcards</h1>
        <div className="flex gap-4">
          <button className="btn btn-primary">Add Word</button>
          <button className="btn btn-secondary">Review</button>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <button className="btn btn-sm" onClick={handleSelectAll}>
          {selectedCards.size === filteredCards.length ? 'Deselect All' : 'Select All'}
        </button>
        <input
          type="text"
          placeholder="Search flashcards..."
          className="input input-bordered w-full max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="select select-bordered">
          <option>Date Added</option>
          <option>Level</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map((card, index) => (
          <div key={index} className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <h2 className="card-title">{card.word}</h2>
                <span className={`badge ${getLevelColor(card.level)}`}>
                  {getLevelText(card.level)}
                </span>
              </div>
              <p className="text-sm text-base-content/70">{card.translation}</p>
              <p className="text-xs text-base-content/50">Context: {card.context}</p>
              <p className="text-xs text-base-content/50">Added: {new Date(card.dateAdded).toLocaleDateString()}</p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-sm btn-info" onClick={() => handleEditCard(card)}>Edit</button>
                <button className="btn btn-sm btn-error" onClick={() => handleDelete(card._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EditFlashcardModal
        isOpen={isEditModalOpen}
        card={currentCard}
        onSave={handleSaveCard}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
} 