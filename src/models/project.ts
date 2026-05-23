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

// ── Agent State — реальное состояние проекта (intake + tracker) ────
// В отличие от blueprint (статичная классификация цели), agentState —
// это динамическое состояние: что пользователь ввёл, что измеряет,
// какой текущий шаг. Хранится в одном subdoc и обновляется через
// PATCH /api/projects/[id] (агрегированно) или через специализированные
// endpoint'ы (atomically: tracker entries, intake).
export interface IProjectIntake {
  // health_fitness:
  sex?: string;
  age?: number;
  heightCm?: number;
  startWeightKg?: number;
  targetWeightKg?: number;
  targetLossKg?: number;
  targetDays?: number;
  activityLevel?: string;
  currentTraining?: string;
  currentNutrition?: string;
  healthRestrictions?: string;
  sleep?: string;
  // shared fields:
  outcome?: string;
  deadline?: string;
  constraints?: string;
  context?: string;
  comment?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface IProjectTrackerEntry {
  id: string;
  date: string; // ISO yyyy-mm-dd
  weightKg?: number;
  waistCm?: number;
  training?: string;
  calories?: number;
  wellbeing?: string;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProjectTracker {
  type: string; // 'weight_progress' | …
  baseline?: { date?: string; weightKg?: number; waistCm?: number };
  entries: IProjectTrackerEntry[];
  createdAt?: string;
}

export interface IProjectAgentState {
  intake?: IProjectIntake;
  tracker?: IProjectTracker;
  currentStepId?: string;
  updatedAt?: string;
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
  agentState?: IProjectAgentState;
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
    // Agent blueprint — статичная классификация цели (domain, mechanics,
    // план, будущие документы). Mixed-тип, гибкий MVP-формат.
    blueprint: { type: Schema.Types.Mixed, default: undefined },
    // Agent state — динамическое состояние: intake (baseline) и tracker
    // (entries). Обновляется через PATCH /api/projects/[id] или
    // специализированные endpoint'ы для атомарных push операций.
    agentState: { type: Schema.Types.Mixed, default: undefined },
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
