import mongoose, { models } from 'mongoose';

const resumeHrScoreSchema = new mongoose.Schema(
  {
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    hrSearch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HrSearch',
      required: true,
    },
    score: {
      type: Number,
      default: null,
    },
    reason: {
      type: String,
      default: '',
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const ResumeHrScore =
  models.ResumeHrScore || mongoose.model('ResumeHrScore', resumeHrScoreSchema);
