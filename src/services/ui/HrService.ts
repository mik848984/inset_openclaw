interface ICreateHrAgent {
  initialQuery: string;
  requestData: any;
}

export enum HrSearchStatus {
  Created,
  Fetching,
  Calculation,
  Idle,
  Stopped,
}

export interface IHrSearchUI {
  _id: string;
  user: string;
  initialQuery: string;
  query: string[];
  requestData: any;
  isActive: boolean;
  completedResumes: number;
  totalResumes: number;
  status: HrSearchStatus;
}

export interface IHrScoreUI {
  _id: string;
  resume: {
    text: string;
    systemId: string;
    params: {
      age: string;
      area: string;
      title: string;
    };
  };
  hrSearch: string;
  score: number;
  reason: string;
  isComplete: boolean;
}

class HrServiceUI {
  currentHrSearch: IHrSearchUI | null = null;
  currentHrSearchEdit: IHrSearchUI | null = null;

  hrSearch: IHrSearchUI[] = [];

  hrScores: IHrScoreUI[] = [];
  bestHrScores: IHrScoreUI[] = [];

  listeners = new Set<() => void>([]);

  loadingScores = false;
  totalCount = 0;
  nextPage = 0;
  hasMore = true;
  searchLoading = false;

  runListeners = () => {
    this.listeners.forEach((listener) => {
      listener();
    });
  };

  setCurrentHrSearch(currentHrSearch: IHrSearchUI | null) {
    this.currentHrSearch = currentHrSearch;
    this.hrScores = [];
    this.runListeners();
  }

  setCurrentHrSearchEdit(currentHrSearch: IHrSearchUI | null) {
    this.currentHrSearchEdit = currentHrSearch;
    this.runListeners();
  }

  clearScores() {
    this.hrScores = [];
    this.bestHrScores = [];
    this.totalCount = 0;
    this.nextPage = 0;
    this.hasMore = true;
    this.loadingScores = false;
  }

  async getHrScores() {
    if (!this.hasMore) return;

    if (!this.currentHrSearch) return;

    if (this.loadingScores) return;

    this.loadingScores = true;

    const response = await fetch(
      `/api/hr-search?id=${this.currentHrSearch._id}&page=${this.nextPage}&limit=20`,
    );

    const result = (await response.json()) as {
      data: IHrScoreUI[];
      hasMore: true;
      totalCount: number;
      nextPage: number;
    };

    this.hrScores = this.hrScores.concat(result.data);

    this.totalCount = result.totalCount;
    this.hasMore = result.hasMore;
    this.nextPage = result.nextPage;
    this.loadingScores = false;

    this.runListeners();
  }

  async createHrAgent({ initialQuery, requestData }: ICreateHrAgent) {
    const beforeUpdateHrSearch = this.hrSearch.slice();

    this.hrSearch.push({
      _id: 'loading',
      isActive: true,
      status: 0,
      initialQuery: '',
      query: [],
      totalResumes: 0,
      completedResumes: 0,
      requestData: {},
      user: '',
    });
    this.runListeners();

    const response = await fetch(`/api/hr-search`, {
      method: 'POST',
      body: JSON.stringify({
        initialQuery,
        requestData,
      }),
    });

    const result = (await response.json()) as IHrSearchUI;

    beforeUpdateHrSearch.push(result);
    this.hrSearch = beforeUpdateHrSearch;
    this.runListeners();

    return result;
  }

  async searchOfTheBest(filterQuery: string, scorePercentage: number) {
    this.searchLoading = true;
    this.bestHrScores = [];

    this.runListeners();
    const response = await fetch(`/api/hr-filter`, {
      method: 'POST',
      body: JSON.stringify({
        filterQuery: `Важно обращать только на эти критерии: "${filterQuery}", оценивай кандидата только по ним, отвечай точно соответствует или нет, если критериев нет, то сразу понижай оценку`,
        hrSearchId: this.currentHrSearch?._id,
        scorePercentage: scorePercentage,
      }),
    });

    this.bestHrScores = (await response.json()) as IHrScoreUI[];

    this.searchLoading = false;

    this.runListeners();
  }

  async getHrAgents() {
    const response = await fetch(`/api/hr-search`);
    const loadingHrSearch = this.hrSearch.filter(
      ({ _id }) => _id === 'loading',
    );

    const hrSearch = (await response.json()) as IHrSearchUI[];
    this.hrSearch = hrSearch.concat(loadingHrSearch);

    this.runListeners();
  }

  async deleteHrAgent(id: string) {
    const response = await fetch(`/api/hr-search?id=${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      this.hrSearch = this.hrSearch.filter((item) => item._id !== id);
      this.runListeners();
    }
  }

  async toggleActive(id: string, isActive: boolean) {
    const status = isActive ? HrSearchStatus.Idle : HrSearchStatus.Stopped;

    const response = await fetch(`/api/hr-search?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive, status }),
    });

    const updatedItem = await response.json();

    if (response.ok) {
      this.hrSearch = this.hrSearch.map((item) =>
        item._id === updatedItem._id ? { ...item, ...updatedItem } : item,
      );

      this.runListeners();
    }
  }
}

export const hrServiceUI = new HrServiceUI();
