class ViewedItemsService {
  private localStorageKey: string;
  private viewedIds: Set<string>;

  constructor(localStorageKey: string) {
    if (!localStorageKey) {
      throw new Error('localStorageKey не может быть пустым.');
    }
    this.localStorageKey = localStorageKey;
    this.viewedIds = new Set<string>();
    this.load();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private load(): void {
    if (!this.isBrowser()) {
      return;
    }
    try {
      const data = localStorage.getItem(this.localStorageKey);
      if (data) {
        const idArray: string[] = JSON.parse(data);
        if (Array.isArray(idArray)) {
          this.viewedIds = new Set<string>(idArray);
        } else {
          console.error(
            `[${this.localStorageKey}] Данные в localStorage не являются массивом.`,
          );
        }
      }
    } catch (error) {
      console.error(
        `[${this.localStorageKey}] Ошибка при загрузке данных из localStorage:`,
        error,
      );
    }
  }

  private save(): void {
    if (!this.isBrowser()) {
      return;
    }
    try {
      const idArray = Array.from(this.viewedIds);
      const data = JSON.stringify(idArray);
      localStorage.setItem(this.localStorageKey, data);
    } catch (error) {
      console.error(
        `[${this.localStorageKey}] Ошибка при сохранении данных в localStorage:`,
        error,
      );
    }
  }

  markAsViewed(id: string | number): void {
    if (!this.isBrowser()) {
      return;
    }
    const idStr = String(id);
    if (!this.viewedIds.has(idStr)) {
      this.viewedIds.add(idStr);
      this.save(); // Сохраняем только при изменении
    }
  }

  isViewed(id: string | number): boolean {
    if (!this.isBrowser()) {
      return false;
    }
    const idStr = String(id);
    return this.viewedIds.has(idStr);
  }

  unmarkAsViewed(id: string | number): void {
    if (!this.isBrowser()) {
      return;
    }
    const idStr = String(id);
    // delete возвращает true, если элемент был найден и удален
    if (this.viewedIds.delete(idStr)) {
      this.save(); // Сохраняем только при изменении
    }
  }

  getAllViewedIds(): Set<string> {
    return new Set(this.viewedIds);
  }

  clearAll(): void {
    if (!this.isBrowser()) {
      return;
    }
    this.viewedIds.clear();
    localStorage.removeItem(this.localStorageKey);
    console.log(
      `[${this.localStorageKey}] Все данные о просмотренных элементах очищены.`,
    );
  }
}

export const viewedItemsService =
  typeof window !== 'undefined'
    ? new ViewedItemsService('viewedResumes')
    : null;
