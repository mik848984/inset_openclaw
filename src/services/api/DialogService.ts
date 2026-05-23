import Dialog from '@/models/dialog';
import Message, { IMessage } from '@/models/message';
import {
  stripSourcesMarker,
  stripThinkBlocks,
} from '@/utils/normalizeModelOutput';

export interface ICreateMessage {
  user: string;
  dialog: string;
  role: string;
  content: string;
}

/**
 * Делает текст безопасным для preview-полей (Dialog.lastMessage, history-карточки).
 * Удаляет служебные маркеры (`__IISET_SOURCES__=…`) и блоки `<think>`, чтобы
 * пользователь никогда не увидел сырой JSON в превью.
 */
function buildPreviewText(content: string): string {
  if (!content) return '';
  const cleaned = stripThinkBlocks(stripSourcesMarker(content)).replace(
    /^\s+/,
    '',
  );
  return cleaned.slice(0, 800);
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

    // Не сохраняем сырой __IISET_SOURCES__ marker в preview-поле, чтобы
    // он не светился в карточках истории чатов.
    dialogEntity.lastMessage = buildPreviewText(content);

    await dialogEntity.save();

    return message;
  }
}

export const dialogService = new DialogService();
