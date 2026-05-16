import { IUsageUI } from '@/services/ui/UsageService';

export interface IStatisticUser {
  _id: string;
  email: string;
  name: string;
  image: string;
  modelsBalance: number;
  imageGenerationBalance: number;
  webSearchBalance: number;

  subscriptions: [
    {
      _id: string;
      grade: string;
      status: string;
      paymentMethodId: string;
      user: string;
      startDate: string;
    },
  ];
}

interface IResponseUsers {
  length: number;
  users: IStatisticUser[];
}

interface UserDetailedResponse {
  user: IStatisticUser;
  usage: IUsageUI[];
}

export class UsersService {
  currentUser: IStatisticUser | null = null;
  usages: IUsageUI[] = [];

  listeners = new Set<() => void>([]);

  runListeners = () => {
    this.listeners.forEach((listener) => {
      listener();
    });
  };

  async getUsers(): Promise<IStatisticUser[]> {
    const response = await fetch(`/api/users`);

    return ((await response.json()) as IResponseUsers).users;
  }

  async getUser(userId: string): Promise<UserDetailedResponse> {
    const response = await fetch(`/api/admin/user?userId=${userId}`);

    const result = await response.json();

    // this.currentUser = result.user;
    this.usages = result.usage;

    this.runListeners();

    return result;
  }

  async updateUser(
    modelsBalance: number,
    imageGenerationBalance: number,
    webSearchBalance: number,
  ) {
    const response = await fetch(`/api/admin/user`, {
      method: 'POST',
      body: JSON.stringify({
        modelsBalance,
        imageGenerationBalance,
        webSearchBalance,
        userId: this.currentUser?._id,
      }),
    });

    this.currentUser = {
      ...this.currentUser!,
      imageGenerationBalance,
      modelsBalance,
      webSearchBalance,
    };

    this.runListeners();
  }

  setCurrentUser(user: IStatisticUser) {
    this.currentUser = user;
    this.runListeners();
  }
}

export const usersService = new UsersService();
