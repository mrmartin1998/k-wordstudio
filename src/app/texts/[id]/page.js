'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchText, fetchFlashcards, createFlashcard, updateFlashcard, updateTextStats } from '@/lib/utils';
import WordModal from '@/app/components/WordModal';
import AudioPlayer from '@/app/components/AudioPlayer';
import CollectionSelector from '@/app/components/text/CollectionSelector';
import FormattingControls from '@/app/components/text/FormattingControls';

export default function TextView() {
  const params = useParams();
  const [text, setText] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCollectionSelector, setShowCollectionSelector] = useState(false);
  const [collection, setCollection] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speechRate, setSpeechRate] = useState(1.0);
  const speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const speedOptions = [0.5, 0.8, 1, 1.25, 1.5, 2];
  const [currentWord, setCurrentWord] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const resumeTimeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const monitorIntervalRef = useRef(null);
  const sentencesRef = useRef([]);
  const offsetsRef = useRef([]);
  const [fontSize, setFontSize] = useState('medium'); // small, medium, large
  const [lineHeight, setLineHeight] = useState('normal'); // compact, normal, relaxed
  const [paragraphSpacing, setParagraphSpacing] = useState('normal'); // tight, normal, loose
  const [readingMode, setReadingMode] = useState(false); // false = normal, true = reading mode
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.id]);

  useEffect(() => {
    if (text?.collectionId) {
      fetchCollection(text.collectionId);
    }
  }, [text?.collectionId]);

  // Load available voices
  useEffect(() => {
    if (!speechSynthesis) return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      // Filter for Korean voices
      const koreanVoices = availableVoices.filter(voice => 
        voice.lang.includes('ko') || voice.lang.includes('KR')
      );
      setVoices(koreanVoices);
      // Set default voice if available
      if (koreanVoices.length > 0) {
        setSelectedVoice(koreanVoices[0]);
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

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

  const fetchCollection = async (collectionId) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}`);
      if (!response.ok) throw new Error('Failed to fetch collection');
      const data = await response.json();
      setCollection(data);
    } catch (error) {
      console.error('Failed to fetch collection:', error);
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

  const splitIntoSentences = (text) => {
    // Split by common Korean sentence endings
    const sentences = text.split(/([.!?。]+\s*)/g)
      .filter(Boolean)  // Remove empty strings
      .reduce((acc, current, i, arr) => {
        if (i % 2 === 0) {
          // Combine sentence with its ending punctuation
          acc.push(current + (arr[i + 1] || ''));
        }
        return acc;
      }, []);

    return sentences;
  };

  const handleSpeak = async () => {
    if (!text?.content || !speechSynthesis) {
      console.log('Missing requirements:', { 
        hasText: !!text?.content, 
        hasSpeechSynthesis: !!speechSynthesis 
      });
      return;
    }

    try {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      
      const sentences = splitIntoSentences(text.content);
      sentencesRef.current = sentences;
      
      console.log('Starting speech with:', {
        sentences,
        speechRate,
        selectedVoice: selectedVoice?.name
      });

      // Speak each sentence sequentially
      for (let i = 0; i < sentences.length; i++) {
        if (!isSpeakingRef.current) {
          console.log('Speech stopped by user');
          break;
        }
        console.log(`Speaking sentence ${i + 1}/${sentences.length}:`, sentences[i]);
        setCurrentSentenceIndex(i);
        
        await speakSentence(sentences[i], i);
        
        // Small pause between sentences
        if (isSpeakingRef.current) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      cleanup();
    }
  };

  const speakSentence = (sentence, index) => {
    return new Promise((resolve, reject) => {
      if (!speechSynthesis) {
        console.error('Speech synthesis not available');
        reject('No speech synthesis available');
        return;
      }

      console.log(`Speaking sentence ${index + 1}:`, sentence); // Debug log
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.rate = speechRate;
      utterance.pitch = 1.0;
      utterance.lang = 'ko-KR';
      
      if (selectedVoice) {
        console.log('Using voice:', selectedVoice.name);
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        console.log('Sentence started:', sentence);
        setCurrentSentenceIndex(index);
      };

      utterance.onend = () => {
        console.log('Sentence ended:', sentence);
        resolve();
      };

      utterance.onerror = (error) => {
        console.error('Utterance error:', error);
        reject(error);
      };

      speechSynthesis.speak(utterance);
    });
  };

  const cleanup = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setCurrentPosition(0);
    setCurrentSentenceIndex(0);
    speechSynthesis?.cancel();
  };

  const stopSpeaking = () => {
    isSpeakingRef.current = false;
    cleanup();
  };

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  const renderInteractiveText = (content) => {
    if (!content) return null;

    const sentences = splitIntoSentences(content);
    
    return sentences.map((sentence, sentenceIndex) => {
      // Split each sentence into words
      const words = sentence.split(/(\s+|[,.!?]|(?<=[\u3131-\u318E\uAC00-\uD7A3])(?![\u3131-\u318E\uAC00-\uD7A3])|(?<![\u3131-\u318E\uAC00-\uD7A3])(?=[\u3131-\u318E\uAC00-\uD7A3]))/g)
        .filter(Boolean);

      return (
        <span 
          key={sentenceIndex}
          className={`${sentenceIndex === currentSentenceIndex && isSpeaking ? 'bg-red-500 text-white' : ''}`}
        >
          {words.map((word, wordIndex) => {
            const existingCard = flashcards.find(c => c.word === word.trim());
            const levelColor = existingCard ? getLevelColor(existingCard.level) : '';

            // If it's a space or punctuation, render it without extra spacing
            if (/^[\s,.!?]+$/.test(word)) {
              return <span key={`${sentenceIndex}-${wordIndex}`}>{word}</span>;
            }

            return (
              <span
                key={`${sentenceIndex}-${wordIndex}`}
                className={`cursor-pointer hover:bg-base-300 ${levelColor}`}
                onClick={() => handleWordClick(word.trim())}
              >
                {word}
              </span>
            );
          })}
        </span>
      );
    });
  };

  const calculateStats = () => {
    if (!text || !flashcards) return { totalWords: 0, knownWords: 0, comprehension: 0 };

    const words = text.content.split(/\s+/);
    const totalWords = words.length;
    
    // Only count words with flashcards that have been reviewed and learned (level > 0)
    const knownWords = new Set(
      flashcards
        .filter(card => card.sourceTextId === params.id && card.level > 3)
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

  const getVoiceName = (voice) => {
    // Customize voice names for better readability
    return voice.name
      .replace('Microsoft', 'MS')
      .replace('Korean', '한국어')
      .split(' ')
      .slice(0, 3)
      .join(' ');
  };

  const handleSpeakButtonClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      handleSpeak();
    }
  };

  const getFormattingClasses = () => {
    const classes = ['prose', 'max-w-none'];
    
    // Font size classes
    if (fontSize === 'small') classes.push('text-sm');
    if (fontSize === 'large') classes.push('text-lg');
    
    // Line height classes
    if (lineHeight === 'compact') classes.push('leading-snug');
    if (lineHeight === 'relaxed') classes.push('leading-relaxed');
    
    // Paragraph spacing classes
    if (paragraphSpacing === 'tight') classes.push('space-y-1');
    if (paragraphSpacing === 'loose') classes.push('space-y-6');
    
    // Reading mode classes
    if (readingMode) {
      classes.push('max-w-2xl mx-auto bg-base-100 p-8 shadow-lg');
    }
    
    return classes.join(' ');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        {collection ? (
          <Link href={`/collections/${collection._id}`} className="btn btn-primary">
            {collection.name}
          </Link>
        ) : (
          <button className="btn btn-primary" onClick={() => setShowCollectionSelector(true)}>
            Add to Collection
          </button>
        )}
        <Link href="/texts" className="btn btn-ghost mb-1">
          Back to Texts
        </Link>
      </div>
      <div className="mb-4">
        <button
          className="btn btn-primary w-full sm:w-auto mb-1"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        >
          {isSettingsOpen ? 'Hide Settings' : 'Text Settings'}
        </button>
        {isSettingsOpen && (
          <div className="card bg-base-200 shadow-xl mt-2">
            <div className="card-body p-2 sm:p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Font Size */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">Font Size</label>
                  <div className="flex flex-wrap gap-1">
                    <button 
                      onClick={() => setFontSize('small')} 
                      className={`btn btn-xs ${fontSize === 'small' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      Small
                    </button>
                    <button 
                      onClick={() => setFontSize('medium')} 
                      className={`btn btn-xs ${fontSize === 'medium' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      Medium
                    </button>
                    <button 
                      onClick={() => setFontSize('large')} 
                      className={`btn btn-xs ${fontSize === 'large' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      Large
                    </button>
                  </div>
                </div>

                {/* Line Height */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">Line Height</label>
                  <div className="flex flex-wrap gap-1">
                    <button 
                      onClick={() => setLineHeight('compact')} 
                      className={`btn btn-xs ${lineHeight === 'compact' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      Compact
                    </button>
                    <button 
                      onClick={() => setLineHeight('normal')} 
                      className={`btn btn-xs ${lineHeight === 'normal' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      Normal
                    </button>
                    <button 
                      onClick={() => setLineHeight('relaxed')} 
                      className={`btn btn-xs ${lineHeight === 'relaxed' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      Relaxed
                    </button>
                  </div>
                </div>

                {/* Paragraph */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">Paragraph</label>
                  <div className="flex flex-wrap gap-1">
                    <button 
                      onClick={() => setParagraphSpacing('tight')} 
                      className={`btn btn-xs ${paragraphSpacing === 'tight' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      Tight
                    </button>
                    <button 
                      onClick={() => setParagraphSpacing('normal')} 
                      className={`btn btn-xs ${paragraphSpacing === 'normal' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      Normal
                    </button>
                    <button 
                      onClick={() => setParagraphSpacing('loose')} 
                      className={`btn btn-xs ${paragraphSpacing === 'loose' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      Loose
                    </button>
                  </div>
                </div>

                {/* Reading Mode */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">Reading Mode</label>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="toggle toggle-sm" 
                        checked={readingMode}
                        onChange={(e) => setReadingMode(e.target.checked)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">{text?.title || 'Loading...'}</h1>

      <div className="mb-6">
        <div className={getFormattingClasses()}>
          {renderInteractiveText(text?.content)}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs sm:text-sm">Speed:</span>
          {speedOptions.map((speed) => (
            <button
              key={speed}
              onClick={() => setSpeechRate(speed)}
              className={`btn btn-xs sm:btn-sm ${speechRate === speed ? 'btn-primary' : 'btn-ghost'}`}
            >
              {speed}x
            </button>
          ))}
        </div>

        <button 
          className={`btn btn-primary w-full sm:w-auto ${isSpeaking ? 'btn-error' : ''}`} 
          onClick={handleSpeakButtonClick}
        >
          {isSpeaking ? 'Stop' : 'Read Text'}
        </button>
      </div>

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

      <CollectionSelector
        isOpen={showCollectionSelector}
        onClose={() => setShowCollectionSelector(false)}
        onSelect={handleCollectionSelect}
        currentCollectionId={text?.collectionId}
      />
    </div>
  );
} 