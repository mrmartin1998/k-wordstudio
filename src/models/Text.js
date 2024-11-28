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
  }
});

export default mongoose.models.Text || mongoose.model('Text', textSchema); 