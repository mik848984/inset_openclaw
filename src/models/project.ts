import mongoose, { Schema, models, Types } from 'mongoose';

export type ProjectMemoryType =
  | 'decision'
  | 'fact'
  | 'task'
  | 'risk'
  | 'note';

export interface IProjectMemoryItem {
  type: ProjectMemoryType;
  text: string;
  createdAt: Date;
}

export interface IProject {
  user: Types.ObjectId;
  title: string;
  goal: string;
  description: string;
  instructions: string;
  nextStep: string;
  suggestedActions: string[];
  memoryItems: IProjectMemoryItem[];
}

const memoryItemSchema = new Schema<IProjectMemoryItem>(
  {
    type: {
      type: String,
      enum: ['decision', 'fact', 'task', 'risk', 'note'],
      default: 'note',
    },
    text: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    goal: { type: String, default: '' },
    description: { type: String, default: '' },
    instructions: { type: String, default: '' },
    nextStep: { type: String, default: '' },
    suggestedActions: { type: [String], default: [] },
    memoryItems: { type: [memoryItemSchema], default: [] },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

projectSchema.index({ user: 1, updatedAt: -1 });

const Project = models.Project || mongoose.model('Project', projectSchema);
export default Project;
