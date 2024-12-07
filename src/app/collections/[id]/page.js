'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CollectionView() {
  const params = useParams();
  const router = useRouter();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollection();
  }, [params.id]);

  const loadCollection = async () => {
    try {
      const response = await fetch(`/api/collections/${params.id}`);
      const data = await response.json();
      setCollection(data);
    } catch (error) {
      console.error('Failed to load collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveText = async (textId) => {
    try {
      const response = await fetch(`/api/texts/${textId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId: null
        }),
      });

      if (!response.ok) throw new Error('Failed to remove text from collection');
      loadCollection();
    } catch (error) {
      console.error('Failed to remove text:', error);
    }
  };

  const handleReviewClick = () => {
    router.push(`/review?collectionId=${params.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center mb-4">
        <h1 className="text-2xl font-bold mb-2">{collection.name}</h1>
        <p className="text-base-content/70 text-center mb-2">{collection.description}</p>
        <div className="flex gap-2">
          <button 
            onClick={handleReviewClick}
            className="btn btn-primary mb-3"
          >
            Review Vocabulary
          </button>
          <Link 
            href="/collections" 
            className="btn btn-ghost mb-3"
          >
            Back to Collections
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        <div className="stats shadow">
          <div className="stat py-2">
            <div className="stat-title text-sm">Total Texts</div>
            <div className="stat-value text-2xl">{collection.stats?.totalTexts || 0}</div>
          </div>
          <div className="stat py-2">
            <div className="stat-title text-sm">Average Comprehension</div>
            <div className="stat-value text-2xl">
              {Math.round(collection.stats?.averageComprehension || 0)}%
            </div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat py-2">
            <div className="stat-title text-sm">Difficulty Distribution</div>
            <div className="stat-desc mt-1">
              {Object.entries(collection.stats?.difficultyDistribution || {}).map(([level, count]) => (
                count > 0 && (
                  <div key={level} className="flex justify-between items-center mb-1">
                    <span>{level}</span>
                    <span className="badge badge-sm">{count}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="divider">Texts in Collection</div>

      {collection?.texts?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collection.texts.map(text => (
            <div key={text._id} className="card bg-base-200 shadow-xl">
              <div className="card-body p-4">
                <h2 className="card-title text-lg">{text.title}</h2>
                <div className="badge badge-outline">{text.difficulty}</div>
                <p className="text-sm mt-2">
                  Comprehension: {text.comprehension || 0}%
                </p>
                {text.audio && (
                  <div className="mt-2">
                    <audio controls className="w-full">
                      <source src={text.audio.url} type={text.audio.mimeType} />
                    </audio>
                  </div>
                )}
                <div className="card-actions justify-end mt-4">
                  <Link 
                    href={`/texts/${text._id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Read Text
                  </Link>
                  <button
                    onClick={() => handleRemoveText(text._id)}
                    className="btn btn-error btn-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-lg mb-4">No texts in this collection</p>
          <Link href="/texts/upload" className="btn btn-primary">
            Add Text
          </Link>
        </div>
      )}
    </div>
  );
} 