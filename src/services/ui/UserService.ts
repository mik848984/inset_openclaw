export interface IUserUI {
  isAdmin: boolean;
  id: string;
  email: string;
  name: string;
  image: string;
  modelsBalance: number;
  imageGenerationBalance: number;
  webSearchBalance: number;
  createdAt: string;
  updatedAt: string;
  subscription: {
    status: 'active' | 'cancel';
    grade?: string;
    startDate: string;
  };
}

class UserService {
  async getUser(): Promise<IUserUI> {
    const response = await fetch(`/api/user`);

    return response.json();
  }
}

export const userService = new UserService();
