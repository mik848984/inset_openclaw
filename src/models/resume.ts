import mongoose, { models } from 'mongoose';

export const resumeSchema = new mongoose.Schema({
  systemId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  text: {
    type: String,
    required: true,
  },
  params: mongoose.Schema.Types.Mixed,
  nextUpdate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
    index: { expires: '0s' },
  },
});

export const Resume = models.Resume || mongoose.model('Resume', resumeSchema);
