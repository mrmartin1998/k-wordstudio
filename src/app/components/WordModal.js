import { useState, useEffect } from 'react';

export default function WordModal({ 
  word = '', 
  context = '', 
  translation = '', 
  notes = '', 
  onSave, 
  onClose, 
  isOpen,
  isEditing = false 
}) {
  const [manualWord, setManualWord] = useState(word);
  const [currentTranslation, setCurrentTranslation] = useState(translation);
  const [currentNotes, setCurrentNotes] = useState(notes);
  const [manualContext, setManualContext] = useState(context);

  useEffect(() => {
    setCurrentTranslation(translation);
    setCurrentNotes(notes);
  }, [translation, notes]);

  const handleSave = () => {
    onSave({
      word: word || manualWord,
      translation: currentTranslation,
      notes: currentNotes,
      context: context || manualContext,
      dateAdded: new Date()
    });
    setManualWord('');
    setCurrentTranslation('');
    setCurrentNotes('');
    setManualContext('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-base-100 rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">
            {isEditing ? 'Edit Flashcard' : 'Add Word to Flashcards'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="label">Word</label>
            <div className="p-2 bg-base-200 rounded text-lg font-medium">{word}</div>
          </div>

          <div>
            <label className="label">Translation</label>
            <input
              type="text"
              value={currentTranslation}
              onChange={(e) => setCurrentTranslation(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Enter translation..."
            />
          </div>

          <div>
            <label className="label">Context</label>
            <div className="p-2 bg-base-200 rounded">{context}</div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              className="textarea textarea-bordered w-full"
              placeholder="Add any notes..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary">
              {isEditing ? 'Save Changes' : 'Add Word'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 