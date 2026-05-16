import mongoose, { Schema, models, Types } from 'mongoose';

export interface IDialog {
  user: Types.ObjectId;
  title: string;
  lastMessage: string;
}

const dialogSchema = new Schema<IDialog>(
  {
    title: {
      type: String,
    },
    lastMessage: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

dialogSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 604800 });

const Dialog = models.Dialog || mongoose.model('Dialog', dialogSchema);
export default Dialog;
