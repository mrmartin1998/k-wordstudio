'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import FileUpload from '@/components/FileUpload';
import WordModal from '@/components/WordModal';
import Link from 'next/link';

export default function Home() {
  const [text, setText] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchParams = useSearchParams();

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
    const updatedFlashcards = [...flashcards, flashcard];
    setFlashcards(updatedFlashcards);
    // Save to localStorage
    localStorage.setItem('flashcards', JSON.stringify(updatedFlashcards));
    setIsModalOpen(false);
    setSelectedWord(null);
  };

  // Split text into words while preserving punctuation and spaces
  const renderInteractiveText = (text) => {
    // Split by spaces but keep spaces and punctuation
    const words = text.split(/(\s+|[,.!?])/);
    
    return (
      <div className="text-lg leading-relaxed">
        {words.map((word, index) => {
          // Skip empty strings and whitespace
          if (!word.trim()) return word;
          
          // Don't make punctuation clickable
          if (/^[,.!?]$/.test(word)) return word;
          
          return (
            <span
              key={index}
              onClick={() => handleWordClick(word)}
              className="cursor-pointer hover:bg-blue-100 px-0.5 rounded transition-colors"
            >
              {word}
            </span>
          );
        })}
      </div>
    );
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
