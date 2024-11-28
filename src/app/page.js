'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchFlashcards, fetchTexts, createFlashcard, updateTextStats, createText } from '@/lib/utils';
import FileUpload from '@/components/FileUpload';
import WordModal from '@/components/WordModal';
import Link from 'next/link';

export default function Home() {
  const [text, setText] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [textStats, setTextStats] = useState({ totalWords: 0, knownWords: 0, comprehension: 0 });
  const searchParams = useSearchParams();

  // Load flashcards and text on mount
  useEffect(() => {
    const loadData = async () => {
      const textId = searchParams.get('textId');
      try {
        const cards = await fetchFlashcards(textId);
        setFlashcards(cards);
        
        if (textId) {
          const texts = await fetchTexts();
          const savedText = texts.find(t => t._id === textId);
          if (savedText) {
            setText(savedText.content);
            setTextStats({
              totalWords: savedText.totalWords || 0,
              knownWords: savedText.knownWords || 0,
              comprehension: savedText.comprehension || 0
            });
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, [searchParams]);

  const handleWordClick = (word) => {
    if (flashcards.some(card => card.word === word)) return;
    
    setSelectedWord({
      word,
      context: getWordContext(word, text)
    });
    setIsModalOpen(true);
  };

  const handleSaveFlashcard = async (flashcard) => {
    const textId = searchParams.get('textId');
    try {
      const newCard = await createFlashcard({
        ...flashcard,
        sourceTextId: textId || null,
        level: 0,
        reviewCount: 0,
        correctCount: 0,
        dateAdded: new Date()
      });
      setFlashcards([...flashcards, newCard]);
      setIsModalOpen(false);
      setSelectedWord(null);
      
      // Update text statistics after adding new flashcard
      if (textId) {
        await updateTextStatistics(textId);
      }
    } catch (error) {
      console.error('Failed to create flashcard:', error);
    }
  };

  const getWordContext = (word, fullText) => {
    const sentences = fullText.split(/[.!?]+/);
    const sentenceWithWord = sentences.find(sentence => sentence.includes(word)) || '';
    return sentenceWithWord.trim();
  };

  const renderInteractiveText = (text) => {
    const words = text.split(/(\s+|[,.!?])/);
    
    return (
      <>
        <div className="text-lg leading-relaxed">
          {words.map((word, index) => {
            if (!word.trim()) return word;
            if (/^[,.!?]$/.test(word)) return word;
            
            const flashcard = flashcards.find(c => c.word === word);
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
          <div>Total Words: {textStats.totalWords}</div>
          <div>Known Words: {textStats.knownWords}</div>
          <div>Comprehension: {textStats.comprehension}%</div>
        </div>
      </>
    );
  };

  const updateTextStatistics = async (textId) => {
    try {
      const words = text.split(/(\s+|[,.!?])/);
      const totalWords = words.filter(w => w.trim() && !/^[,.!?]$/.test(w)).length;
      const knownWords = words.filter(word => {
        const flashcard = flashcards.find(c => c.word === word);
        return flashcard?.level >= 3;
      }).length;

      const stats = {
        totalWords,
        knownWords,
        comprehension: Math.round((knownWords / totalWords) * 100)
      };

      await updateTextStats(textId, stats);
      setTextStats(stats);
    } catch (error) {
      console.error('Failed to update text statistics:', error);
    }
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

  const handleFileContent = async (fileData) => {
    try {
      const newText = await createText({
        title: fileData.title,
        content: fileData.content,
        dateAdded: new Date(),
        totalWords: 0,
        knownWords: 0,
        comprehension: 0
      });
      
      setText(newText.content);
      setTextStats({
        totalWords: 0,
        knownWords: 0,
        comprehension: 0
      });
      
      // Load flashcards for this text
      const cards = await fetchFlashcards(newText._id);
      setFlashcards(cards);
      
    } catch (error) {
      console.error('Failed to create text:', error);
    }
  };

  const handleOpenText = async (textId) => {
    try {
      const texts = await fetchTexts();
      const selectedText = texts.find(t => t._id === textId);
      if (selectedText) {
        setText(selectedText.content);
        setTextStats({
          totalWords: selectedText.totalWords || 0,
          knownWords: selectedText.knownWords || 0,
          comprehension: selectedText.comprehension || 0
        });
        
        // Load flashcards for this text
        const cards = await fetchFlashcards(textId);
        setFlashcards(cards);
      }
    } catch (error) {
      console.error('Failed to open text:', error);
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
                  Added: {new Date(card.dateAdded).toLocaleString()}
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
