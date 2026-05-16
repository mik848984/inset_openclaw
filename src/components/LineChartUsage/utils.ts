export function isMountDates(date: Date) {
  const inputDate = new Date(date);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - inputDate.getTime();
  const dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

  if (dayDifference < 15) {
    return false;
  } else if (dayDifference > 15 && dayDifference <= 30) {
    return true;
  }

  return true;
}

function getDateLabel(date: Date) {
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
  });
}

export function getWeekLabel(date: Date) {
  return date
    .toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
    })
    .toUpperCase();
}

export function generateDateLabels(date: Date) {
  const inputDate = new Date(date);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - inputDate.getTime();
  const dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

  if (isMountDates(date)) return generateMonthLabels(inputDate, currentDate);
  return generateDayLabels(dayDifference);
}

function generateDayLabels(dayCount: number) {
  const labels = [];
  const today = new Date();

  for (let i = dayCount - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dayName = getDateLabel(date);
    labels.push(dayName);
  }

  return labels;
}

function generateMonthLabels(startDate: Date, endDate: Date) {
  const labels = [];
  let currentDate = new Date(startDate);

  const maxDate = endDate;

  maxDate.setMonth(maxDate.getMonth() + 1);

  while (currentDate <= maxDate) {
    const monthName = getMonthLabel(currentDate);
    labels.push(monthName);

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return labels;
}

interface IGroupDataByTimeParams {
  groupedData: any;
  data: any[];
  granularity: string;
  accessUsage: string;
}
export function groupDataByTime({
  groupedData,
  granularity,
  data,
  accessUsage,
}: IGroupDataByTimeParams): any {
  data.forEach((item) => {
    const date = new Date(item.createdAt);
    let timeKey = '';

    switch (granularity) {
      case 'day':
        timeKey = getDateLabel(date);
        break;
      case 'week':
        timeKey = getWeekLabel(date);
        break;
      case 'month':
        timeKey = getMonthLabel(date);
        break;
      default:
        return groupedData;
    }

    if (!groupedData[timeKey]) {
      groupedData[timeKey] = 0;
    }

    groupedData[timeKey] += item[accessUsage];
  });

  return groupedData;
}

export const sevenDaysAgo = new Date();

sevenDaysAgo.setDate(new Date().getDate() - 7);
