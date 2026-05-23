import mongoose, { Schema, models, Types } from 'mongoose';

export interface IProjectChunk {
  project: Types.ObjectId;
  source: Types.ObjectId;
  user: Types.ObjectId;
  userEmail: string;
  chunkIndex: number;
  text: string;
  // Location metadata — depends on source type.
  page?: number;
  sectionTitle?: string;
  sheet?: string;
  rowRange?: string;
  url?: string;
  startChar?: number;
  endChar?: number;
  // Vector store linkage. If embeddingProvider/vectorId are present, the
  // chunk has been indexed in the external vector DB; otherwise retrieval
  // falls back to Mongo keyword search.
  embeddingProvider?: 'deepinfra';
  embeddingModel?: string;
  vectorId?: string;
  // Optional inline embedding (lightweight fallback for cosine in Mongo).
  // We do NOT store this by default to keep documents small, but the field
  // is available if a future migration wants to enable it.
  embeddingPreview?: number[];
  metadata?: Record<string, any>;
  createdAt: Date;
}

const projectChunkSchema = new Schema<IProjectChunk>(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectSource',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userEmail: { type: String, required: true, index: true },
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    page: { type: Number },
    sectionTitle: { type: String },
    sheet: { type: String },
    rowRange: { type: String },
    url: { type: String },
    startChar: { type: Number },
    endChar: { type: Number },
    embeddingProvider: { type: String, enum: ['deepinfra'] },
    embeddingModel: { type: String },
    vectorId: { type: String },
    embeddingPreview: { type: [Number] },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

projectChunkSchema.index({ project: 1, source: 1, chunkIndex: 1 });
projectChunkSchema.index({ user: 1, project: 1 });
// Простой текстовый индекс для keyword-fallback retrieval.
projectChunkSchema.index({ text: 'text' });

const ProjectChunk =
  models.ProjectChunk ||
  mongoose.model('ProjectChunk', projectChunkSchema);
export default ProjectChunk;
