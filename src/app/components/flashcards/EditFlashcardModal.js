import { useState, useEffect } from 'react';

export default function EditFlashcardModal({ isOpen, card, onSave, onClose }) {
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [context, setContext] = useState('');
  const [level, setLevel] = useState(0);

  // Update state when card changes
  useEffect(() => {
    if (card) {
      setWord(card.word || '');
      setTranslation(card.translation || '');
      setContext(card.context || '');
      setLevel(card.level || 0);
    }
  }, [card]);

  const getLevelText = (level) => {
    switch(level) {
      case 0: return 'New';
      case 1: return 'Beginning';
      case 2: return 'Learning';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Known';
      default: return 'New';
    }
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 0: return 'badge-error';    // Red - New
      case 1: return 'badge-warning';  // Orange - Beginning
      case 2: return 'badge-info';     // Blue - Learning
      case 3: return 'badge-primary';  // Purple - Intermediate
      case 4: return 'badge-secondary';// Gray - Advanced
      case 5: return 'badge-success';  // Green - Known
      default: return 'badge-error';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Edit Flashcard</h3>
        
        <div className="form-control">
          <label className="label">Word</label>
          <input
            type="text"
            className="input input-bordered"
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label className="label">Translation</label>
          <input
            type="text"
            className="input input-bordered"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label className="label">Context</label>
          <textarea
            className="textarea textarea-bordered"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>

        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Level</span>
            <span className={`badge ${getLevelColor(level)}`}>
              {getLevelText(level)}
            </span>
          </label>
          <div className="btn-group">
            {[0, 1, 2, 3, 4, 5].map((l) => (
              <button
                key={l}
                className={`btn btn-sm ${level === l ? 'btn-active' : ''}`}
                onClick={() => setLevel(l)}
              >
                {getLevelText(l)}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-action">
          <button 
            className="btn btn-primary" 
            onClick={() => onSave({ word, translation, context, level })}
          >
            Save
          </button>
          <button className="btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
} 