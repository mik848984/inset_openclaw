export interface IUsageUI {
  tokens: number;
  images: number;
  createdAt: string;
}

class UsageService {
  listeners = new Set<() => void>([]);

  runListeners = () => {
    this.listeners.forEach((listener) => {
      listener();
    });
  };

  usages: IUsageUI[] = [];

  isLoading = false;

  async getUsages(): Promise<IUsageUI[]> {
    if (this.isLoading) {
      return this.usages;
    }

    this.isLoading = true;
    try {
      const response = await fetch(`/api/usage`);

      const result = await response.json();

      this.usages = result;
      this.runListeners();
      return result;
    } catch (e) {
      console.log(e);
      return [];
    } finally {
      this.isLoading = false;
    }
  }
}

export const usageService = new UsageService();
