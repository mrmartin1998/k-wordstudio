import mongoose from 'mongoose';

const FlashcardSchema = new mongoose.Schema({
  word: { type: String, required: true },
  translation: String,
  context: String,
  sourceTextId: { type: mongoose.Schema.Types.ObjectId, ref: 'Text' },
  level: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  lastReviewed: Date
});

export default mongoose.models.Flashcard || mongoose.model('Flashcard', FlashcardSchema); 