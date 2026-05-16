export interface IDialogUI {
  updatedAt: string;
  createdAt: string;
  lastMessage: string;
  _id: string;
}

interface ICreateMessageParams {
  role: string;
  content: string;
}

class MessagesService {
  currentDialog = '';
  async createMessage({ role, content }: ICreateMessageParams) {
    const response = await fetch(`/api/message`, {
      method: 'POST',
      body: JSON.stringify({
        role,
        content,
        dialogId: this.currentDialog,
      }),
    });

    const result = await response.json();

    console.log(result);
    this.currentDialog = result.dialog;

    return result;
  }

  async getDialog() {
    const response = await fetch(`/api/dialog?dialogId=${this.currentDialog}`);

    return response.json();
  }

  async getDialogs(): Promise<IDialogUI[]> {
    const response = await fetch(`/api/dialogs`);

    return response.json();
  }
}

export const messagesService = new MessagesService();
