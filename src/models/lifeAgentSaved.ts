import mongoose, { Schema, models } from 'mongoose';

export interface ILifeAgentSaved {
  user: Schema.Types.ObjectId | string;
  agentId: string;
  content: string;
  title?: string;
}

const lifeAgentSavedSchema = new Schema<ILifeAgentSaved>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

const LifeAgentSaved =
  models.LifeAgentSaved ||
  mongoose.model<ILifeAgentSaved>('LifeAgentSaved', lifeAgentSavedSchema);

export default LifeAgentSaved;
