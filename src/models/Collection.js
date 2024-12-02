import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  dateCreated: {
    type: Date,
    default: Date.now
  },
  stats: {
    totalTexts: {
      type: Number,
      default: 0
    },
    averageComprehension: {
      type: Number,
      default: 0
    },
    difficultyDistribution: {
      Beginner: { type: Number, default: 0 },
      Elementary: { type: Number, default: 0 },
      Intermediate: { type: Number, default: 0 },
      Advanced: { type: Number, default: 0 },
      Expert: { type: Number, default: 0 }
    }
  }
});

export default mongoose.models.Collection || mongoose.model('Collection', collectionSchema); 