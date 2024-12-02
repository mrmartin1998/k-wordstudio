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
      
      // Refresh collection data
      loadCollection();
    } catch (error) {
      console.error('Failed to remove text:', error);
    }
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/collections" className="btn btn-ghost mb-2">
            ← Back to Collections
          </Link>
          <h1 className="text-2xl font-bold">{collection.name}</h1>
          <p className="text-base-content/70">{collection.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Texts</div>
            <div className="stat-value">{collection.stats?.totalTexts || 0}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Average Comprehension</div>
            <div className="stat-value">
              {Math.round(collection.stats?.averageComprehension || 0)}%
            </div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Difficulty Distribution</div>
            <div className="stat-desc mt-2">
              {Object.entries(collection.stats?.difficultyDistribution || {}).map(([level, count]) => (
                count > 0 && (
                  <div key={level} className="flex justify-between items-center mb-1">
                    <span>{level}</span>
                    <span className="badge">{count}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="divider">Texts in Collection</div>

      {collection?.texts?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collection.texts.map(text => (
            <div key={text._id} className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">{text.title}</h2>
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