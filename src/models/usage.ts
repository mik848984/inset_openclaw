import mongoose, { models, Schema } from 'mongoose';
import { ObjectId } from 'bson';
import { ISubscription } from '@/models/subscription';

export interface IUsage {
  user: ObjectId;
  subscription: ISubscription;
  tokens: number;
  images: number;
}

const usageSchema = new Schema<IUsage>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tokens: {
      type: Number,
      required: true,
    },
    images: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const Usage = models.Usage || mongoose.model('Usage', usageSchema);
export default Usage;
