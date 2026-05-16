// Chakra imports
import { Box, Button, Divider, Flex, Text } from '@chakra-ui/react';
import BarChart from '@/components/charts/BarChart';
import { getBarOptionsSidebar } from '@/variables/charts';
import { useEffect, useMemo, useState } from 'react';
import {
  getWeekLabel,
  groupDataByTime,
} from '@/components/LineChartUsage/utils';
import { usageService } from '@/services/ui/UsageService';
import { calculatePages } from '../../../../app/profile/page';
import { useSubscribe } from '@/utils/hooks/useSubscribe';
import Link from 'next/link';

function getDatesOfCurrentWeek() {
  const today = new Date();
  const dayOfWeek = today.getDay();

  const daysUntilMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - daysUntilMonday);

  const weekDates = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(monday);
    currentDate.setDate(monday.getDate() + i);
    weekDates.push(currentDate);
  }

  return weekDates;
}

function getMinValue(data: number[]) {
  if (Math.max(...data) == 0) {
    return 0;
  }

  if (Math.max(...data) <= 2) {
    return 0.01;
  }

  return 1;
}

export default function SidebarDocs() {
  const bgColor = 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)';

  const [data, setData] = useState<any[]>([]);

  const labels = useMemo(() => getDatesOfCurrentWeek().map(getWeekLabel), []);

  useSubscribe(usageService.listeners);

  const rawData = usageService.usages;

  useEffect(() => {
    usageService.getUsages();
  }, []);

  useEffect(() => {
    if (!rawData.length) return;

    const groupedData = groupDataByTime({
      granularity: 'week',
      data: rawData,
      accessUsage: 'tokens',
      groupedData: Object.fromEntries(labels.map((date) => [date, 0])),
    });

    setData(
      Object.values<any>(
        Object.fromEntries(labels.map((date) => [date, groupedData[date]])),
      ).map(calculatePages),
    );
  }, [rawData]);

  if (!data.length) return null;

  const minValue = getMinValue(data);

  console.log(minValue);

  if (!minValue) {
    return null;
  }

  return (
    <Flex
      justify="center"
      direction="column"
      align="center"
      bg={bgColor}
      borderRadius="16px"
      position="relative"
      w="100%"
      pb="10px"
    >
      <Flex direction="column" mb="12px" w="100%" px="20px" pt="20px">
        <Text fontSize="sm" fontWeight={'600'} color="white" mb="12px">
          Ежеденедельная статистика:
        </Text>
      </Flex>
      <Box h="160px" w="100%" mt="-46px">
        <BarChart
          key={data.join('')}
          chartData={[
            {
              name: 'Использовано страниц',
              data: data.map((value) => (value < 1 ? minValue + value : value)),
            },
          ]}
          chartOptions={getBarOptionsSidebar(labels, data)}
        />
      </Box>
      <Box h="8px" />
      <Box pl="12px" pr="12px" width="100%">
        <Link href="/usage">
          <Button width="100%">Использование</Button>
        </Link>
      </Box>
    </Flex>
  );
}
