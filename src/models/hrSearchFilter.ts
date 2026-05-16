import mongoose, { models, Schema, Types } from 'mongoose';

export interface IHrSearch {
  id: string;
  hrSearch: Types.ObjectId;
  user: Types.ObjectId;
  filterQuery: string;
  nextUpdate: Date;
}

const hrSearchFilterSchema = new Schema<IHrSearch>(
  {
    filterQuery: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hrSearch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HrSearch',
      required: true,
    },
    nextUpdate: {
      type: Date,
      default: new Date(Date.now()),
    },
  },
  { timestamps: true },
);

const HrSearchFilter =
  models.HrSearchFilter ||
  mongoose.model('HrSearchFilter', hrSearchFilterSchema);
export default HrSearchFilter;
