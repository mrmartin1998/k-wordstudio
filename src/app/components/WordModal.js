import { useState } from 'react';

export default function WordModal({ word = '', context = '', onSave, onClose, isOpen }) {
  const [manualWord, setManualWord] = useState(word);
  const [translation, setTranslation] = useState('');
  const [notes, setNotes] = useState('');
  const [manualContext, setManualContext] = useState(context);

  const handleSave = () => {
    onSave({
      word: word || manualWord,
      translation,
      notes,
      context: context || manualContext,
      dateAdded: new Date()
    });
    setManualWord('');
    setTranslation('');
    setNotes('');
    setManualContext('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-base-100 rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Add Word to Flashcards</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="label">Word</label>
            {word ? (
              <div className="p-2 bg-base-200 rounded text-lg font-medium">{word}</div>
            ) : (
              <input
                type="text"
                value={manualWord}
                onChange={(e) => setManualWord(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Enter word..."
                autoFocus
              />
            )}
          </div>

          <div>
            <label className="label">Context (optional)</label>
            {context ? (
              <div className="p-2 bg-base-200 rounded text-sm">{context}</div>
            ) : (
              <textarea
                value={manualContext}
                onChange={(e) => setManualContext(e.target.value)}
                className="textarea textarea-bordered w-full"
                placeholder="Add context..."
                rows={2}
              />
            )}
          </div>

          <div>
            <label className="label">Translation</label>
            <input
              type="text"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Enter translation..."
            />
          </div>

          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="textarea textarea-bordered w-full"
              placeholder="Add any notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="btn btn-primary"
              disabled={!(word || manualWord) || !translation}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 