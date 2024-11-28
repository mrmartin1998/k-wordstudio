'use client';
import { useState, useEffect } from 'react';
import { createFlashcard, createText, fetchFlashcards } from '@/lib/utils';
import FileUpload from '@/app/components/FileUpload';
import WordModal from '@/app/components/WordModal';

export default function TextProcessor() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [textStats, setTextStats] = useState({
    totalWords: 0,
    knownWords: 0,
    comprehension: 0
  });

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      const cards = await fetchFlashcards();
      setFlashcards(cards);
    } catch (error) {
      console.error('Failed to load flashcards:', error);
    }
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 0: return 'text-error';
      case 1: return 'text-warning';
      case 2: return 'text-info';
      case 3: return 'text-primary';
      case 4: return 'text-secondary';
      case 5: return 'text-success';
      default: return '';
    }
  };

  const handleFileContent = async (fileData) => {
    setIsLoading(true);
    try {
      const content = fileData.content;
      const words = content.split(/\s+/);
      
      const newText = await createText({
        title: title || fileData.title,
        content: content,
        dateAdded: new Date(),
        totalWords: words.length,
        knownWords: 0,
        comprehension: 0
      });
      
      setText(content);
      setTextStats({
        totalWords: words.length,
        knownWords: 0,
        comprehension: 0
      });
    } catch (error) {
      console.error('Failed to create text:', error);
      setError('Failed to upload text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordClick = (word) => {
    setSelectedWord({ word, context: text });
    setIsModalOpen(true);
  };

  const handleSaveFlashcard = async (flashcard) => {
    try {
      const newCard = await createFlashcard({
        ...flashcard,
        level: 0,
        reviewCount: 0,
        lastReviewed: new Date(),
        dateAdded: new Date()
      });
      setFlashcards([...flashcards, newCard]);
      setIsModalOpen(false);
      setSelectedWord(null);
    } catch (error) {
      console.error('Failed to save flashcard:', error);
      setError('Failed to save flashcard. Please try again.');
    }
  };

  const renderInteractiveText = (text) => {
    const words = text.split(/(\s+|[,.!?])/);
    return words.map((word, index) => {
      if (!word.trim() || /^[,.!?]$/.test(word)) {
        return word;
      }

      const flashcard = flashcards.find(c => c.word === word.trim());
      const levelColor = flashcard ? getLevelColor(flashcard.level) : '';

      return (
        <span
          key={index}
          className={`cursor-pointer hover:bg-base-300 px-1 rounded ${levelColor}`}
          onClick={() => handleWordClick(word.trim())}
        >
          {word}
        </span>
      );
    });
  };

  return (
    <div className="space-y-8">
      <div className="form-control w-full max-w-md">
        <label className="label">
          <span className="label-text">Title</span>
        </label>
        <input 
          type="text"
          placeholder="Enter text title"
          className="input input-bordered w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <FileUpload onFileContent={handleFileContent} />

      {isLoading && (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {text && !isLoading && (
        <>
          <div className="mb-8">
            <h2 className="text-xl mb-4">Text Content</h2>
            <div className="p-4 bg-base-200 rounded-lg whitespace-pre-wrap">
              {renderInteractiveText(text)}
            </div>
          </div>

          <div className="stats bg-base-200 shadow">
            <div className="stat">
              <div className="stat-title">Total Words</div>
              <div className="stat-value">{textStats.totalWords}</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Known Words</div>
              <div className="stat-value">{textStats.knownWords}</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Comprehension</div>
              <div className="stat-value">{textStats.comprehension}%</div>
            </div>
          </div>
        </>
      )}

      <WordModal
        isOpen={isModalOpen}
        word={selectedWord?.word || ''}
        context={selectedWord?.context || ''}
        onSave={handleSaveFlashcard}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWord(null);
        }}
      />
    </div>
  );
} 