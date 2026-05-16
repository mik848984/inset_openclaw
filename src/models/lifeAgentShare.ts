import mongoose, { Schema, models } from 'mongoose';

export interface ILifeAgentShare {
  user?: Schema.Types.ObjectId | string;
  agentId: string;
  content: string;
  title?: string;
}

const lifeAgentShareSchema = new Schema<ILifeAgentShare>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    agentId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

// auto-delete after 7 days
lifeAgentShareSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

const LifeAgentShare =
  models.LifeAgentShare ||
  mongoose.model<ILifeAgentShare>('LifeAgentShare', lifeAgentShareSchema);

export default LifeAgentShare;
