import mongoose, { models, Schema, Types } from 'mongoose';

export enum HrSearchStatus {
  Created,
  Fetching,
  Calculation,
  Idle,
  Stopped,
}

export interface IHrSearch {
  id: string;
  user: Types.ObjectId;
  initialQuery: string;
  query: string[];
  requestData: any;
  isActive: boolean;
  nextUpdate: Date;
  status: HrSearchStatus;
}

const hrSearchSchema = new Schema<IHrSearch>(
  {
    initialQuery: {
      type: String,
      required: true,
    },
    query: {
      type: [String],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestData: mongoose.Schema.Types.Mixed,
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    status: {
      type: Number,
      default: HrSearchStatus.Created,
      required: true,
    },
    nextUpdate: {
      type: Date,
      default: new Date(Date.now()),
    },
  },
  { timestamps: true },
);

const HrSearch = models.HrSearch || mongoose.model('HrSearch', hrSearchSchema);
export default HrSearch;
