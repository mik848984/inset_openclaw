export const YM_ID = 100585692;

declare global {
  interface Window {
    ym?: (...args: any[]) => void;
  }
}

/**
 * Отправка цели в Яндекс.Метрику.
 */
export function trackGoal(goal: string, params?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  if (!window.ym) return;
  try {
    window.ym(YM_ID, 'reachGoal', goal, params);
  } catch (e) {
    // Не ломаем UX, если метрика недоступна
    console.error('trackGoal error', e);
  }
}

/**
 * Привязка пользователя к Метрике и установка пользовательских параметров.
 */
export function setYmUser(user: {
  _id?: string;
  email?: string;
  modelsBalance?: number;
  simpleModelsBalance?: number;
  premiumModelsBalance?: number;
  imageGenerationBalance?: number;
  webSearchBalance?: number;
}) {
  if (typeof window === 'undefined') return;
  if (!window.ym) return;
  try {
    if (user?._id) {
      window.ym(YM_ID, 'setUserID', String(user._id));
    }
    window.ym(YM_ID, 'userParams', {
      user_id: user?._id,
      email: user?.email,
      modelsBalance: user?.modelsBalance,
      simpleModelsBalance: user?.simpleModelsBalance,
      premiumModelsBalance: user?.premiumModelsBalance,
      imageBalance: user?.imageGenerationBalance,
      webSearchBalance: user?.webSearchBalance,
      hasSubscription: Boolean(user?.premiumModelsBalance),
      user_type: user?._id
        ? Boolean(user?.premiumModelsBalance)
          ? 'subscriber'
          : 'registered'
        : 'anonymous',
    });
  } catch (e) {
    console.error('setYmUser error', e);
  }
}
