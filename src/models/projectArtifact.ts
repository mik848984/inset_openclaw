import mongoose, { Schema, models, Types } from 'mongoose';

export type ProjectArtifactType =
  | 'brief'
  | 'report'
  | 'mindmap'
  | 'comparison'
  | 'plan'
  | 'risks'
  | 'faq'
  // Agent Workspace artifact kinds:
  | 'intake' // заполненная пользователем анкета
  | 'living_document' // главный документ проекта (книга, курсовая, бизнес-план)
  | 'tracker'; // markdown-таблица прогресса (вес/калории, разделы, главы)

export interface IProjectArtifact {
  project: Types.ObjectId;
  user: Types.ObjectId;
  userEmail: string;
  type: ProjectArtifactType;
  title: string;
  content: string;
  sourceIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const projectArtifactSchema = new Schema<IProjectArtifact>(
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
    userEmail: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: [
        'brief',
        'report',
        'mindmap',
        'comparison',
        'plan',
        'risks',
        'faq',
        'intake',
        'living_document',
        'tracker',
      ],
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    sourceIds: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: true },
);

projectArtifactSchema.index({ project: 1, createdAt: -1 });

const ProjectArtifact =
  models.ProjectArtifact ||
  mongoose.model('ProjectArtifact', projectArtifactSchema);
export default ProjectArtifact;
