'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchCollections, createCollection, deleteCollection } from '@/lib/utils';

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const data = await fetchCollections();
      setCollections(data);
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    try {
      const newCollection = await createCollection({
        name: newCollectionName,
        description: newCollectionDesc
      });
      setCollections([...collections, newCollection]);
      setNewCollectionName('');
      setNewCollectionDesc('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const handleDeleteCollection = async (id) => {
    try {
      await deleteCollection(id);
      setCollections(collections.filter(col => col._id !== id));
    } catch (error) {
      console.error('Failed to delete collection:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-1">Text Collections</h1>
      <button 
        className="btn btn-primary w-full mb-4"
        onClick={() => setShowCreateModal(true)}
      >
        Create Collection
      </button>

      {loading ? (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      ) : collections.length > 0 ? (
        <div className="flex flex-col gap-2">
          {collections.map(collection => (
            <div key={collection._id} className="card bg-base-200 shadow-sm">
              <div className="card-body p-3">
                <h2 className="text-lg font-medium mb-2">{collection.name}</h2>
                
                <div className="stats stats-vertical bg-base-300 rounded-box p-2 mb-2">
                  <div className="stat">
                    <div className="stat-title">Total Texts</div>
                    <div className="stat-value text-lg">
                      {collection.stats?.totalTexts || 0}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Avg. Comprehension</div>
                    <div className="stat-value text-lg">
                      {Math.round(collection.stats?.averageComprehension || 0)}%
                    </div>
                  </div>
                </div>

                <div className="card-actions justify-end">
                  <Link 
                    href={`/collections/${collection._id}`} 
                    className="btn btn-primary"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDeleteCollection(collection._id)}
                    className="btn btn-error"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-base mb-2">No collections created yet</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create Your First Collection
          </button>
        </div>
      )}

      {/* Modal remains unchanged */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create New Collection</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Collection Name</span>
              </label>
              <input
                type="text"
                placeholder="Enter collection name"
                className="input input-bordered w-full"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                placeholder="Enter collection description"
                value={newCollectionDesc}
                onChange={(e) => setNewCollectionDesc(e.target.value)}
              />
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-primary"
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim()}
              >
                Create
              </button>
              <button 
                className="btn"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 