import mongoose, { Schema, models, Types } from 'mongoose';

export interface ISubscription {
  grade: string;
  paymentMethodId: string;
  user: Types.ObjectId;
  status: 'active' | 'cancel';
  startDate: any;
}

const subscriptionSchema = new Schema<ISubscription>({
  grade: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'active',
    required: true,
  },
  paymentMethodId: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const Subscription =
  models.Subscription || mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
