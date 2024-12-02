import mongoose from 'mongoose';

const textSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  totalWords: {
    type: Number,
    default: 0
  },
  knownWords: {
    type: Number,
    default: 0
  },
  comprehension: {
    type: Number,
    default: 0
  },
  audio: {
    url: String,
    duration: Number,
    fileName: String,
    mimeType: String
  }
});

export default mongoose.models.Text || mongoose.model('Text', textSchema); 