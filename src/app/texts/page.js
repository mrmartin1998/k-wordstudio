'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchTexts, fetchFlashcards, deleteText, updateTextStats, fetchCollections } from '@/lib/utils';

export default function Texts() {
  const [texts, setTexts] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterCollection, setFilterCollection] = useState('');

  useEffect(() => {
    loadData();
    loadCollections();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading texts...');
      const [textsData, cardsData] = await Promise.all([
        fetchTexts(),
        fetchFlashcards()
      ]);
      console.log('Texts loaded:', textsData);
      console.log('Flashcards loaded:', cardsData);
      
      // Calculate stats for each text
      const textsWithStats = textsData.map(text => {
        const words = text.content.split(/\s+/);
        const totalWords = words.length;
        
        // Count known words including those learned from other texts
        const knownWords = new Set(
          words.filter(word => 
            cardsData.some(card => 
              card.word.toLowerCase() === word.toLowerCase() && 
              card.level >= 3
            )
          )
        ).size;

        const comprehension = totalWords > 0 
          ? Math.round((knownWords / totalWords) * 100) 
          : 0;

        return {
          ...text,
          totalWords,
          knownWords,
          comprehension
        };
      });

      console.log('Texts with stats:', textsWithStats);
      setTexts(textsWithStats);
      setFlashcards(cardsData);
    } catch (error) {
      console.error('Failed to load texts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const data = await fetchCollections();
      setCollections(data);
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  const handleDeleteText = async (id) => {
    try {
      await deleteText(id);
      setTexts(texts.filter(text => text._id !== id));
    } catch (error) {
      console.error('Failed to delete text:', error);
    }
  };

  const updateTextStatistics = async () => {
    try {
      const flashcards = await fetchFlashcards();
      
      for (const text of texts) {
        // Get unique words from text
        const textWords = new Set(
          text.content
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.trim())
        );
        
        const totalWords = textWords.size;
        
        // Count known words (including those learned from other texts)
        const knownWords = Array.from(textWords).filter(word =>
          flashcards.some(card => 
            card.word.toLowerCase() === word && 
            card.level >= 3
          )
        ).length;

        const stats = {
          totalWords,
          knownWords,
          comprehension: Math.round((knownWords / totalWords) * 100)
        };

        await updateTextStats(text._id, stats);
      }

      // Reload texts to get updated stats
      loadData();
    } catch (error) {
      console.error('Failed to update text statistics:', error);
    }
  };

  const filteredTexts = texts.filter(text => {
    if (filterDifficulty && text.difficulty !== filterDifficulty) return false;
    if (filterCollection && text.collectionId !== filterCollection) return false;
    return true;
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Saved Texts</h1>
        <Link href="/texts/upload" className="btn btn-primary w-full md:w-auto">
          Add Text
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-base-200 rounded-lg p-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <select 
              className="select select-bordered w-full"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Elementary">Elementary</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <div className="flex-1">
            <select 
              className="select select-bordered w-full"
              value={filterCollection}
              onChange={(e) => setFilterCollection(e.target.value)}
            >
              <option value="">All Collections</option>
              {collections.map(col => (
                <option key={col._id} value={col._id}>{col.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : filteredTexts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTexts.map(text => (
            <div key={text._id} className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">{text.title}</h2>
                <p className="text-sm text-base-content/70">
                  {text.content?.slice(0, 100)}...
                </p>
                
                <div className="stats stats-vertical sm:stats-horizontal bg-base-300 rounded-box">
                  <div className="stat">
                    <div className="stat-title">Total Words</div>
                    <div className="stat-value text-lg">{text.totalWords || 0}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Known Words</div>
                    <div className="stat-value text-lg">{text.knownWords || 0}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Comprehension</div>
                    <div className="stat-value text-lg">{text.comprehension || 0}%</div>
                  </div>
                </div>

                <div className="card-actions justify-end mt-4">
                  <Link href={`/texts/${text._id}`} className="btn btn-primary btn-sm">
                    Open
                  </Link>
                  <button
                    onClick={() => handleDeleteText(text._id)}
                    className="btn btn-error btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg mb-4">No saved texts</p>
          <Link href="/texts/upload" className="btn btn-primary">
            Upload a Text
          </Link>
        </div>
      )}
    </div>
  );
} 