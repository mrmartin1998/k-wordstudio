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
      <div className="modal-box w-[85%] md:w-[400px] max-w-sm mx-auto p-3 md:p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-base md:text-lg">Edit Flashcard</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        
        <div className="form-control mb-2">
          <label className="label py-1">Word</label>
          <input
            type="text"
            className="input input-bordered w-full text-sm md:text-base"
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
        </div>

        <div className="form-control mb-2">
          <label className="label py-1">Translation</label>
          <input
            type="text"
            className="input input-bordered w-full text-sm md:text-base"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
          />
        </div>

        <div className="form-control mb-2">
          <label className="label py-1">Context</label>
          <textarea
            className="textarea textarea-bordered w-full min-h-[60px] md:min-h-[100px] text-sm md:text-base"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>

        <div className="form-control mt-2">
          <label className="label py-1 justify-between">
            <span className="label-text text-sm md:text-base">Level</span>
            <span className={`badge ${getLevelColor(level)}`}>
              {getLevelText(level)}
            </span>
          </label>
          <div className="grid grid-cols-3 gap-1 w-full">
            {[0, 1, 2, 3, 4, 5].map((l) => (
              <button
                key={l}
                className={`btn btn-xs md:btn-sm ${level === l ? 'btn-active' : ''}`}
                onClick={() => setLevel(l)}
              >
                {getLevelText(l)}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-action mt-4 gap-2">
          <button 
            className="btn btn-sm md:btn-md btn-primary flex-1" 
            onClick={() => onSave({ word, translation, context, level })}
          >
            Save
          </button>
          <button className="btn btn-sm md:btn-md flex-1" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
} 