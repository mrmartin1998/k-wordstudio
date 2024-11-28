'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import FileUpload from '@/components/FileUpload';
import WordModal from '@/components/WordModal';
import Link from 'next/link';

export default function Home() {
  const [text, setText] = useState('');
  const [flashcards, setFlashcards] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flashcards');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [selectedWord, setSelectedWord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchParams = useSearchParams();

  // Load existing flashcards when component mounts
  useEffect(() => {
    const saved = localStorage.getItem('flashcards');
    if (saved) {
      setFlashcards(JSON.parse(saved));
    }
  }, []);

  // Load text if textId is provided
  useEffect(() => {
    const textId = searchParams.get('textId');
    if (textId) {
      const texts = JSON.parse(localStorage.getItem('texts') || '[]');
      const savedText = texts.find(t => t.id === textId);
      if (savedText) {
        setText(savedText.content);
      }
    }
  }, [searchParams]);

  const handleFileContent = (textData) => {
    setText(textData.content);
    const texts = JSON.parse(localStorage.getItem('texts') || '[]');
    const updatedTexts = [...texts, textData];
    localStorage.setItem('texts', JSON.stringify(updatedTexts));
  };

  const getWordContext = (word, fullText) => {
    // Get surrounding sentence or context
    const sentences = fullText.split(/[.!?]+/);
    const sentenceWithWord = sentences.find(sentence => sentence.includes(word)) || '';
    return sentenceWithWord.trim();
  };

  const handleWordClick = (word) => {
    if (flashcards.some(card => card.word === word)) return;
    
    setSelectedWord({
      word,
      context: getWordContext(word, text)
    });
    setIsModalOpen(true);
  };

  const handleSaveFlashcard = (flashcard) => {
    const newCard = {
      ...flashcard,
      id: crypto.randomUUID(),
      dateAdded: new Date(),
      level: 0,
      reviewCount: 0,
      correctCount: 0
    };
    
    // Load latest flashcards from localStorage to prevent overwriting
    const existingCards = JSON.parse(localStorage.getItem('flashcards') || '[]');
    const updatedFlashcards = [...existingCards, newCard];
    
    setFlashcards(updatedFlashcards);
    localStorage.setItem('flashcards', JSON.stringify(updatedFlashcards));
    setIsModalOpen(false);
    setSelectedWord(null);
  };

  // Split text into words while preserving punctuation and spaces
  const renderInteractiveText = (text) => {
    const words = text.split(/(\s+|[,.!?])/);
    const savedCards = JSON.parse(localStorage.getItem('flashcards') || '[]');
    
    // Calculate text stats
    const totalWords = words.filter(w => w.trim() && !/^[,.!?]$/.test(w)).length;
    let knownWords = 0;
    
    return (
      <>
        <div className="text-lg leading-relaxed">
          {words.map((word, index) => {
            if (!word.trim()) return word;
            if (/^[,.!?]$/.test(word)) return word;
            
            const flashcard = savedCards.find(c => c.word === word);
            if (flashcard?.level >= 3) knownWords++;
            
            const levelColor = flashcard ? getLevelColor(flashcard.level || 0) : '';
            
            return (
              <span
                key={index}
                onClick={() => handleWordClick(word)}
                className={`cursor-pointer px-0.5 rounded transition-colors hover:bg-base-200 ${levelColor}`}
              >
                {word}
              </span>
            );
          })}
        </div>
        <div className="mt-4 flex gap-4 text-sm">
          <div>Total Words: {totalWords}</div>
          <div>Known Words: {knownWords}</div>
          <div>Comprehension: {Math.round((knownWords / totalWords) * 100)}%</div>
        </div>
      </>
    );
  };

  // Add the getLevelColor helper function
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">K-WordStudio</h1>
        <div className="flex gap-2">
          <Link href="/texts" className="btn btn-ghost">
            Saved Texts
          </Link>
          <Link href="/flashcards" className="btn btn-primary">
            View Flashcards
          </Link>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl mb-4">Upload Text</h2>
        <FileUpload onFileContent={handleFileContent} />
      </div>

      {text && (
        <div className="mb-8">
          <h2 className="text-xl mb-4">Text (click words to add to flashcards)</h2>
          <div className="p-4 bg-base-200 rounded-lg">
            {renderInteractiveText(text)}
          </div>
        </div>
      )}

      {flashcards.length > 0 && (
        <div>
          <h2 className="text-xl mb-4">Flashcards ({flashcards.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.map((card, index) => (
              <div key={index} className="p-4 bg-base-200 rounded-lg">
                <div className="text-xl font-bold mb-2">{card.word}</div>
                <textarea
                  placeholder="Add notes..."
                  className="w-full p-2 rounded"
                  value={card.notes}
                  onChange={(e) => {
                    const updatedCards = [...flashcards];
                    updatedCards[index].notes = e.target.value;
                    setFlashcards(updatedCards);
                  }}
                />
                <div className="text-sm text-gray-500 mt-2">
                  Added: {card.dateAdded.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedWord && (
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
      )}
    </div>
  );
}
