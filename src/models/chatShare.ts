import mongoose, { Schema, models } from 'mongoose';

export interface IChatShare {
  user?: Schema.Types.ObjectId | string;
  role: string;
  content: string;
  isImage?: boolean;
}

const chatShareSchema = new Schema<IChatShare>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    role: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isImage: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true },
);

// автоудаление через 7 дней
chatShareSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

const ChatShare =
  models.ChatShare || mongoose.model<IChatShare>('ChatShare', chatShareSchema);

export default ChatShare;
