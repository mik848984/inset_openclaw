// Thin client for /api/projects routes.
// All calls assume the user is authenticated — server enforces this.

export type ProjectMemoryType =
  | 'decision'
  | 'fact'
  | 'task'
  | 'risk'
  | 'note';

export interface IProjectMemoryItemUI {
  type: ProjectMemoryType;
  text: string;
  createdAt: string;
}

// ── Agent Blueprint (UI mirror of server types) ─────────────────
export type ProjectDomainUI =
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

export type ProjectMechanicUI =
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

export type ProjectFirstStepTypeUI =
  | 'intake_form'
  | 'upload_sources'
  | 'web_research'
  | 'create_living_document';

export interface IProjectFirstStepUI {
  type: ProjectFirstStepTypeUI;
  title: string;
  hint: string;
  formKind?: string;
}

export interface IProjectArtifactPlanUI {
  kind: 'input' | 'research' | 'living_document' | 'tracker' | 'calculation' | 'comparison' | 'generated_document';
  title: string;
  hint: string;
}

export interface IProjectBlueprintUI {
  domain: ProjectDomainUI;
  mechanics: ProjectMechanicUI[];
  missingInputs: string[];
  firstStep: IProjectFirstStepUI;
  steps: string[];
  artifactPlans: IProjectArtifactPlanUI[];
  trackerColumns?: string[];
  primaryDocumentTitle?: string;
}

// Чистые лейблы для UI — продублированы здесь, чтобы не тянуть
// серверный модуль в клиент.
export const RU_DOMAIN_LABELS_UI: Record<ProjectDomainUI, string> = {
  business: 'Бизнес и запуск',
  career: 'Карьера и работа',
  health_fitness: 'Здоровье и форма',
  education: 'Обучение и навыки',
  academic_writing: 'Учебная работа',
  creative_writing: 'Творческое письмо',
  content: 'Контент и публикации',
  document_analysis: 'Работа с документом',
  research_decision: 'Исследование и решение',
  travel_relocation: 'Поездка или переезд',
  personal_productivity: 'Личная задача',
  general: 'Общая задача',
};

// ── Agent State (dynamic) ───────────────────────────────────────
// intake = baseline (стартовые данные, одна сущность, перезаписывается).
// tracker = entries во времени (новые замеры добавляются как push).
// Это НЕ то же самое, что blueprint — blueprint классификация цели.
export interface IProjectIntakeUI {
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
  outcome?: string;
  deadline?: string;
  constraints?: string;
  context?: string;
  comment?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface IProjectTrackerEntryUI {
  id: string;
  date: string;
  weightKg?: number;
  waistCm?: number;
  training?: string;
  calories?: number;
  wellbeing?: string;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProjectTrackerUI {
  type: string;
  baseline?: { date?: string; weightKg?: number; waistCm?: number };
  entries: IProjectTrackerEntryUI[];
  createdAt?: string;
}

export interface IProjectAgentStateUI {
  intake?: IProjectIntakeUI;
  tracker?: IProjectTrackerUI;
  currentStepId?: string;
  updatedAt?: string;
}

// ── Roadmap step (computed UI-side from agent state) ────────────
export type RoadmapStepStatusUI = 'locked' | 'todo' | 'active' | 'done';
export type RoadmapWidgetTypeUI =
  | 'intake_form'
  | 'tracker'
  // education-specific widgets:
  | 'learning_tracker'
  | 'diagnostic'
  | 'learning_roadmap'
  | 'learning_materials'
  | 'learning_review'
  | 'calculator'
  | 'document'
  | 'web_research'
  | 'review';

export interface IRoadmapStepUI {
  id: string;
  title: string;
  widgetType: RoadmapWidgetTypeUI;
  status: RoadmapStepStatusUI;
  actionLabel: string;
  hint?: string;
}

export interface IProjectUI {
  _id: string;
  title: string;
  goal: string;
  description: string;
  instructions: string;
  nextStep: string;
  suggestedActions: string[];
  memoryItems: IProjectMemoryItemUI[];
  blueprint?: IProjectBlueprintUI;
  agentState?: IProjectAgentStateUI;
  createdAt: string;
  updatedAt: string;
}

class ProjectsService {
  async list(): Promise<IProjectUI[]> {
    const res = await fetch('/api/projects', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  async create(rawText: string): Promise<IProjectUI | null> {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText }),
    });
    if (!res.ok) return null;
    return await res.json();
  }

  async get(id: string): Promise<IProjectUI | null> {
    const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  }

  async update(
    id: string,
    patch: Partial<
      Pick<
        IProjectUI,
        | 'title'
        | 'goal'
        | 'description'
        | 'instructions'
        | 'nextStep'
        | 'suggestedActions'
      >
    >,
  ): Promise<IProjectUI | null> {
    const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return null;
    return await res.json();
  }

  async remove(id: string): Promise<boolean> {
    const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  }

  async addMemory(
    id: string,
    item: { type: ProjectMemoryType; text: string },
  ): Promise<IProjectUI | null> {
    const res = await fetch(
      `/api/projects/${encodeURIComponent(id)}/memory`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      },
    );
    if (!res.ok) return null;
    return await res.json();
  }

  // ─── Sources ───────────────────────────────────────────────────
  async listSources(projectId: string): Promise<IProjectSourceUI[]> {
    const res = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/sources`,
      { cache: 'no-store' },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  async uploadSourceFile(
    projectId: string,
    file: File,
  ): Promise<IProjectSourceUI | null> {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/sources/upload`,
      { method: 'POST', body: fd },
    );
    if (!res.ok) return null;
    return await res.json();
  }

  async addSourceLink(
    projectId: string,
    url: string,
  ): Promise<IProjectSourceUI | null> {
    const res = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/sources/link`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      },
    );
    if (!res.ok) return null;
    return await res.json();
  }

  async addSourceNote(
    projectId: string,
    text: string,
    title?: string,
  ): Promise<IProjectSourceUI | null> {
    const res = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/sources/note`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, title }),
      },
    );
    if (!res.ok) return null;
    return await res.json();
  }

  async deleteSource(
    projectId: string,
    sourceId: string,
  ): Promise<boolean> {
    const res = await fetch(
      `/api/projects/${encodeURIComponent(
        projectId,
      )}/sources/${encodeURIComponent(sourceId)}`,
      { method: 'DELETE' },
    );
    return res.ok;
  }

  async reprocessSource(
    projectId: string,
    sourceId: string,
  ): Promise<IProjectSourceUI | null> {
    const res = await fetch(
      `/api/projects/${encodeURIComponent(
        projectId,
      )}/sources/${encodeURIComponent(sourceId)}/reprocess`,
      { method: 'POST' },
    );
    if (!res.ok) return null;
    return await res.json();
  }

  async discoverSources(
    projectId: string,
    query?: string,
  ): Promise<{ recommended: IDiscoveredSource[] }> {
    const res = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/discover-sources`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      },
    );
    if (!res.ok) return { recommended: [] };
    const data = await res.json();
    return {
      recommended: Array.isArray(data?.recommended) ? data.recommended : [],
    };
  }

  async createArtifact(
    projectId: string,
    type: ProjectArtifactKind,
  ): Promise<IProjectArtifactUI | null> {
    const res = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/artifacts`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      },
    );
    if (!res.ok) return null;
    return await res.json();
  }

  async listArtifacts(projectId: string): Promise<IProjectArtifactUI[]> {
    const res = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/artifacts`,
      { cache: 'no-store' },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  // ─── Threads (branches) ───────────────────────────────────────
  async listThreads(projectId: string): Promise<IProjectThreadUI[]> {
    const res = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/threads`,
      { cache: 'no-store' },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  async createThread(
    projectId: string,
    payload: { title: string; kind?: string; hint?: string },
  ): Promise<IProjectThreadUI | null> {
    const res = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/threads`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) return null;
    return await res.json();
  }

  // ─── Agent state: intake (baseline) ──────────────────────────
  // Анкета — единая baseline-сущность. Каждый PATCH перезаписывает
  // её целиком, НЕ создаёт новый artifact.
  async updateIntake(
    projectId: string,
    intake: IProjectIntakeUI,
  ): Promise<IProjectUI | null> {
    const res = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/intake`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intake),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.project as IProjectUI;
  }

  async resetIntake(projectId: string): Promise<IProjectUI | null> {
    const res = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/intake`,
      { method: 'DELETE' },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.project as IProjectUI;
  }

  // ─── Agent state: tracker entries ────────────────────────────
  // Каждый замер — новая запись через атомарный $push. Tracker
  // создаётся автоматически на первом push, если его ещё не было.
  async addTrackerEntry(
    projectId: string,
    entry: Omit<IProjectTrackerEntryUI, 'id' | 'createdAt'>,
  ): Promise<{ entry: IProjectTrackerEntryUI; project: IProjectUI } | null> {
    const res = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/tracker/entries`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      },
    );
    if (!res.ok) return null;
    return await res.json();
  }

  async deleteTrackerEntry(
    projectId: string,
    entryId: string,
  ): Promise<IProjectUI | null> {
    const res = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/tracker/entries?entryId=${encodeURIComponent(entryId)}`,
      { method: 'DELETE' },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.project as IProjectUI;
  }

  // ─── Agent state: generic patch (currentStepId, etc.) ────────
  async patchAgentState(
    projectId: string,
    patch: Partial<IProjectAgentStateUI>,
  ): Promise<IProjectUI | null> {
    const project = await this.get(projectId);
    const next = { ...(project?.agentState || {}), ...patch };
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentState: next }),
    });
    if (!res.ok) return null;
    return await res.json();
  }
}

export type ProjectSourceUIType = 'file' | 'link' | 'note' | 'web';
export type ProjectSourceUIStatus =
  | 'uploaded'
  | 'processing'
  | 'ready'
  | 'error'
  | 'unsupported';

export interface IProjectSourceUI {
  _id: string;
  type: ProjectSourceUIType;
  title: string;
  url?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  status: ProjectSourceUIStatus;
  errorMessage?: string;
  textPreview?: string;
  summary?: string;
  chunksCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IDiscoveredSource {
  url: string;
  title: string;
  domain: string;
  snippet?: string;
  date?: string;
  reason?: string;
}

export type ProjectArtifactKind =
  | 'brief'
  | 'plan'
  | 'risks'
  | 'faq'
  | 'comparison'
  | 'mindmap'
  | 'report';

export interface IProjectArtifactUI {
  _id: string;
  type: ProjectArtifactKind;
  title: string;
  content: string;
  createdAt: string;
}

export interface IProjectThreadUI {
  _id: string;
  project: string;
  title: string;
  kind?: string;
  hint?: string;
  dialog?: string;
  createdAt: string;
  updatedAt: string;
}

export const projectsService = new ProjectsService();
