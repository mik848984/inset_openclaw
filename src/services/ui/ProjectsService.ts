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

export interface IProjectUI {
  _id: string;
  title: string;
  goal: string;
  description: string;
  instructions: string;
  nextStep: string;
  suggestedActions: string[];
  memoryItems: IProjectMemoryItemUI[];
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

export const projectsService = new ProjectsService();
