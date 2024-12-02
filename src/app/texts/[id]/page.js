'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchText, fetchFlashcards, createFlashcard, updateFlashcard, updateTextStats } from '@/lib/utils';
import WordModal from '@/app/components/WordModal';
import AudioPlayer from '@/app/components/AudioPlayer';
import CollectionSelector from '@/app/components/text/CollectionSelector';

export default function TextView() {
  const params = useParams();
  const [text, setText] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCollectionSelector, setShowCollectionSelector] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const [textData, cardsData] = await Promise.all([
        fetchText(params.id),
        fetchFlashcards()
      ]);
      console.log('Loaded text data:', textData);
      console.log('Audio data:', textData?.audio);
      setText(textData);
      setFlashcards(cardsData);
    } catch (error) {
      console.error('Failed to load text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordClick = (word) => {
    const existingCard = flashcards.find(c => c.word === word.trim());
    const context = getWordContext(word, text.content);
    
    setSelectedWord({ 
      word,
      context,
      translation: existingCard?.translation || '',
      notes: existingCard?.notes || '',
      id: existingCard?._id
    });
    setIsModalOpen(true);
  };

  const handleSaveFlashcard = async (flashcard) => {
    try {
      let newCard;
      if (selectedWord.id) {
        newCard = await updateFlashcard(selectedWord.id, {
          ...flashcard,
          lastModified: new Date()
        });
        setFlashcards(flashcards.map(card => 
          card._id === selectedWord.id ? newCard : card
        ));
      } else {
        newCard = await createFlashcard({
          ...flashcard,
          sourceTextId: params.id,
          level: 0,
          reviewCount: 0,
          lastReviewed: new Date(),
          dateAdded: new Date()
        });
        setFlashcards([...flashcards, newCard]);
      }
      
      const stats = calculateStats();
      await updateTextStats(params.id, stats);
      
      setIsModalOpen(false);
      setSelectedWord(null);
    } catch (error) {
      console.error('Failed to save flashcard:', error);
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

  const getWordContext = (word, content) => {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    const sentenceWithWord = sentences.find(sentence => 
      sentence.toLowerCase().includes(word.toLowerCase())
    );
    return sentenceWithWord?.trim() || '';
  };

  const renderInteractiveText = (content) => {
    if (!content) return null;

    const words = content.split(/(\s+|[,.!?])/);
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

  const calculateStats = () => {
    if (!text || !flashcards) return { totalWords: 0, knownWords: 0, comprehension: 0 };

    const words = text.content.split(/\s+/);
    const totalWords = words.length;
    
    // Count unique words that have flashcards for this text
    const knownWords = new Set(
      flashcards
        .filter(card => card.sourceTextId === params.id)
        .map(card => card.word.toLowerCase())
    ).size;

    const comprehension = totalWords > 0 
      ? Math.round((knownWords / totalWords) * 100) 
      : 0;

    return {
      totalWords,
      knownWords,
      comprehension
    };
  };

  const handleCollectionSelect = async (collectionId) => {
    try {
      const response = await fetch(`/api/texts/${text._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...text,
          collectionId
        }),
      });

      if (!response.ok) throw new Error('Failed to update text');
      
      const updatedText = await response.json();
      setText(updatedText);
    } catch (error) {
      console.error('Failed to update text collection:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{text?.title || 'Loading...'}</h1>
        <Link href="/texts" className="btn btn-ghost">
          Back to Texts
        </Link>
      </div>

      {text?.audio?.url && (
        <div className="mb-8">
          <AudioPlayer audioUrl={text.audio.url} />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="stats bg-base-200 shadow">
            <div className="stat">
              <div className="stat-title">Total Words</div>
              <div className="stat-value">{calculateStats().totalWords}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Known Words</div>
              <div className="stat-value">{calculateStats().knownWords}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Comprehension</div>
              <div className="stat-value">{calculateStats().comprehension}%</div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="prose max-w-none">
                {renderInteractiveText(text?.content)}
              </div>
            </div>
          </div>
        </div>
      )}

      <WordModal
        isOpen={isModalOpen}
        word={selectedWord?.word || ''}
        context={selectedWord?.context || ''}
        translation={selectedWord?.translation || ''}
        notes={selectedWord?.notes || ''}
        isEditing={!!selectedWord?.id}
        onSave={handleSaveFlashcard}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWord(null);
        }}
      />

      <div className="flex justify-end mb-4">
        <button 
          className="btn btn-primary"
          onClick={() => setShowCollectionSelector(true)}
        >
          Add to Collection
        </button>
      </div>

      <CollectionSelector
        isOpen={showCollectionSelector}
        onClose={() => setShowCollectionSelector(false)}
        onSelect={handleCollectionSelect}
        currentCollectionId={text?.collectionId}
      />
    </div>
  );
} 