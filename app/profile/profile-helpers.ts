export function calculatePages(tokens: number = 0) {
  return Number((tokens / 625).toFixed(2));
}

export function getTariffName(status?: string, grade?: string) {
  if (status === 'cancel') return '💤 Приостановлена';

  if (grade === 'Premium') return '✅ Активна';
  if (grade === 'Medium') return '✅ Активна';
  if (grade === 'Start') return 'Активна';
  return '🟥 Не активна';
}

export function getExpiredDate(startDate?: string) {
  if (!startDate) return '—';

  const date = new Date(startDate);
  date.setMonth(date.getMonth() + 1);

  return Intl.DateTimeFormat('ru').format(date);
}
