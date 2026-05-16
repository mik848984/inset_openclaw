import Dialog from '@/models/dialog';
import Message, { IMessage } from '@/models/message';

export interface ICreateMessage {
  user: string;
  dialog: string;
  role: string;
  content: string;
}

class DialogService {
  getDialog(user: string, dialogId?: string) {
    if (dialogId) {
      return Dialog.findOne({ _id: dialogId, user });
    }

    return Dialog.create({ user });
  }

  getMessages(user: string, dialog?: string) {
    return Message.find({ user, dialog }).sort({ createdAt: 1 });
  }

  getDialogs(user: string) {
    return Dialog.find({ user }).sort({ updatedAt: -1 });
  }

  async addMessageToDialog({
    dialog,
    role,
    user,
    content,
  }: ICreateMessage): Promise<IMessage> {
    const message = await Message.create({
      content,
      dialog,
      user,
      role,
    });

    const dialogEntity = await this.getDialog(user, dialog);

    dialogEntity.lastMessage = content;

    await dialogEntity.save();

    return message;
  }
}

export const dialogService = new DialogService();
