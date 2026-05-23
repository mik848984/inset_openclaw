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

// ── Agent Blueprint ────────────────────────────────────────────────
// Двухуровневая классификация цели проекта: domain (сфера) + mechanics
// (какие механики нужны). Хранится как JSON-subdoc — добавление поля
// безопасное (additive), старые проекты остаются совместимыми, у них
// blueprint === undefined.
export type ProjectDomain =
  | 'business'
  | 'career'
  | 'health_fitness'
  | 'education'
  | 'academic_writing'
  | 'creative_writing'
  | 'content'
  | 'document_analysis'
  | 'research_decision'
  | 'travel_relocation'
  | 'personal_productivity'
  | 'general';

export type ProjectMechanic =
  | 'intake_required'
  | 'file_required'
  | 'web_research_required'
  | 'single_living_document'
  | 'multi_artifact_workspace'
  | 'progress_tracking'
  | 'metric_tracking'
  | 'deadline_tracking'
  | 'calculator_required'
  | 'comparison_required'
  | 'source_citation_required'
  | 'recurring_checkins'
  | 'risk_sensitive';

export type ProjectFirstStepType =
  | 'intake_form'
  | 'upload_sources'
  | 'web_research'
  | 'create_living_document';

export interface IProjectFirstStep {
  type: ProjectFirstStepType;
  title: string;
  hint: string;
  formKind?: string; // 'business' | 'health' | 'academic' | 'career' | 'general' | …
}

export interface IProjectArtifactPlan {
  kind: 'input' | 'research' | 'living_document' | 'tracker' | 'calculation' | 'comparison' | 'generated_document';
  title: string;
  hint: string;
}

export interface IProjectBlueprint {
  domain: ProjectDomain;
  mechanics: ProjectMechanic[];
  missingInputs: string[];
  firstStep: IProjectFirstStep;
  steps: string[];
  artifactPlans: IProjectArtifactPlan[];
  trackerColumns?: string[];
  primaryDocumentTitle?: string;
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
  blueprint?: IProjectBlueprint;
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
    // Agent blueprint — гибкий JSON-subdoc. Mixed-тип, чтобы не
    // привязываться к жёсткой схеме на MVP-этапе.
    blueprint: { type: Schema.Types.Mixed, default: undefined },
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
