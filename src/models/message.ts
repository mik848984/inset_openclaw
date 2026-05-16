import mongoose, { Schema, models, Types } from 'mongoose';

export interface IMessage {
  user: Types.ObjectId;
  dialog: Types.ObjectId;
  role: string;
  content: string;
}

const messageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dialog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dialog',
      required: true,
    },
  },
  { timestamps: true },
);

const Message = models.Message || mongoose.model('Message', messageSchema);
export default Message;
