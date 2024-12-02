'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchCollections, createCollection, deleteCollection } from '@/lib/utils';

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Text Collections</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Collection
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(collection => (
            <div key={collection._id} className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">{collection.name}</h2>
                <p className="text-sm text-base-content/70">
                  {collection.description}
                </p>
                
                <div className="stats bg-base-300 rounded-box">
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

                <div className="card-actions justify-end mt-4">
                  <Link 
                    href={`/collections/${collection._id}`} 
                    className="btn btn-primary btn-sm"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDeleteCollection(collection._id)}
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
          <p className="text-lg mb-4">No collections created yet</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create Your First Collection
          </button>
        </div>
      )}

      {/* Create Collection Modal */}
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