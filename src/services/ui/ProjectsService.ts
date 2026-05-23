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
}

export const projectsService = new ProjectsService();
