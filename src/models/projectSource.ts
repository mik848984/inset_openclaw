import mongoose, { Schema, models, Types } from 'mongoose';

export type ProjectSourceType = 'file' | 'link' | 'note' | 'web';
export type ProjectSourceStatus =
  | 'uploaded'
  | 'processing'
  | 'ready'
  | 'error'
  | 'unsupported';

export interface IProjectSource {
  project: Types.ObjectId;
  user: Types.ObjectId;
  userEmail: string;
  type: ProjectSourceType;
  title: string;
  originalName?: string;
  url?: string;
  storagePath?: string;
  mimeType?: string;
  size?: number;
  status: ProjectSourceStatus;
  errorMessage?: string;
  textPreview?: string;
  summary?: string;
  keyFacts: string[];
  chunksCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const projectSourceSchema = new Schema<IProjectSource>(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Дублируем email для безопасной проверки владельца без второго join.
    userEmail: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['file', 'link', 'note', 'web'],
      required: true,
    },
    title: { type: String, required: true },
    originalName: { type: String },
    url: { type: String },
    storagePath: { type: String },
    mimeType: { type: String },
    size: { type: Number },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'ready', 'error', 'unsupported'],
      default: 'uploaded',
    },
    errorMessage: { type: String },
    textPreview: { type: String },
    summary: { type: String },
    keyFacts: { type: [String], default: [] },
    chunksCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

projectSourceSchema.index({ project: 1, createdAt: -1 });
projectSourceSchema.index({ user: 1, project: 1 });

const ProjectSource =
  models.ProjectSource ||
  mongoose.model('ProjectSource', projectSourceSchema);
export default ProjectSource;
