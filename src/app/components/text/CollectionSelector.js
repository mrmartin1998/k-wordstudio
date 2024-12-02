'use client';
import { useState, useEffect } from 'react';
import { fetchCollections } from '@/lib/utils';

export default function CollectionSelector({ isOpen, onClose, onSelect, currentCollectionId }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Add to Collection</h3>
        {loading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="grid gap-2">
            {collections.map(collection => (
              <button
                key={collection._id}
                className={`btn btn-outline w-full justify-start ${
                  collection._id === currentCollectionId ? 'btn-primary' : ''
                }`}
                onClick={() => {
                  onSelect(collection._id);
                  onClose();
                }}
              >
                {collection.name}
              </button>
            ))}
          </div>
        )}
        <div className="modal-action">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
} 