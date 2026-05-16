export interface IAttachmentUI {
  id: number;
  type: string;
  name: string;
  url: string;
  error: boolean;
  loading?: boolean;
}

class AttachmentsService {
  youTube = '';

  listeners = new Set<() => void>([]);

  runListeners = () => {
    this.listeners.forEach((listener) => {
      listener();
    });
  };

  attachments: Set<IAttachmentUI> = new Set();

  async loadAttachment(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name); // 'file.ts' - это имя поля, которое ожидает API

    const attachment: IAttachmentUI = {
      id: Math.random(),
      url: '',
      loading: true,
      error: false,
      name: file.name,
      type: file.type,
    };

    this.attachments.add(attachment);

    this.runListeners();

    try {
      const response = await fetch('/api/file', {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as any;

      attachment.url = data.url;
    } catch (e) {
      attachment.error = true;
    }

    attachment.loading = false;
    this.runListeners();
  }

  async removeAttachment(attachment: IAttachmentUI) {
    this.attachments.delete(attachment);

    const response = await fetch('/api/file/delete', {
      method: 'POST',
      body: JSON.stringify({ url: attachment.url }),
    });

    this.runListeners();
  }

  getSuccessAttachments() {
    return [...this.attachments].filter((attachment) => !attachment.error);
  }

  setYouTube(youTube: string) {
    this.youTube = youTube;
    this.runListeners();
  }

  hasAttachments() {
    return !!this.attachments.size || !!this.youTube;
  }

  sizeAttachments() {
    if (this.youTube) {
      return this.attachments.size + 1;
    }

    return this.attachments.size;
  }
}

export const attachmentsService = new AttachmentsService();
