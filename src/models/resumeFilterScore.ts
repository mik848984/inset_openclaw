import mongoose, { models } from 'mongoose';

const resumeFilterScoreSchema = new mongoose.Schema(
  {
    resumeScore: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResumeHrScore',
      required: true,
    },
    hrSearchFilter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HrSearchFilter',
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

export const ResumeFilterScore =
  models.ResumeFilterScore ||
  mongoose.model('ResumeFilterScore', resumeFilterScoreSchema);
