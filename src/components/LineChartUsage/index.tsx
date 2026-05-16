import { Box, Icon, useColorModeValue } from '@chakra-ui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { IUsageUI, usageService } from '@/services/ui/UsageService';
import MiniStatistics from '@/components/card/MiniStatistics';
import IconBox from '@/components/icons/IconBox';
import LineChart from '@/components/charts/LineChart';
import { getBarUsage } from '@/variables/charts';

import {
  generateDateLabels,
  groupDataByTime,
  isMountDates,
  sevenDaysAgo,
} from './utils';
import { IconType } from 'react-icons';
import { useSubscribe } from '@/utils/hooks/useSubscribe';
import dynamic from 'next/dynamic';

interface IProps {
  accessKey: string;
  title: string;
  icon: IconType;
  processData: (value: number) => number;
  rawData: IUsageUI[];
}

const DatePicker = dynamic(
  //@ts-ignore
  () =>
    import('@salutejs/plasma-web/components/DatePicker').then(
      (data) => data.DatePicker,
    ),
  { ssr: false },
);

function LineChartUsage({
  accessKey,
  title,
  icon,
  processData,
  rawData,
}: IProps) {
  const [isOpen, setOpen] = useState<boolean>(false);
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const brandColor = useColorModeValue('gray.500', 'white');

  const [data, setData] = useState<number[]>([]);
  const [selectedDate, setDate] = useState<Date>(sevenDaysAgo);

  const labels = useMemo(
    () => generateDateLabels(selectedDate),
    [selectedDate],
  );

  useSubscribe(usageService.listeners);

  useEffect(() => {
    if (!rawData.length) return;

    const minDate = new Date(rawData[0].createdAt);
    if (minDate < sevenDaysAgo) {
      setDate(minDate);
    }
  }, [rawData]);

  useEffect(() => {
    if (!rawData.length) return;

    setData(
      Object.values<any>(
        groupDataByTime({
          granularity: isMountDates(selectedDate) ? 'month' : 'day',
          data: rawData,
          accessUsage: accessKey,
          groupedData: Object.fromEntries(labels.map((date) => [date, 0])),
        }),
      ).map(processData),
    );
  }, [rawData, selectedDate]);

  if (data.length) {
    return (
      <div>
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={<Icon w="24px" h="24px" as={icon} color={brandColor} />}
            />
          }
          endContent={
            <Box width={{ base: '100%', md: '256px' }}>
              <DatePicker
                opened={isOpen}
                onToggle={(value) => setOpen(!!value)}
                style={{ width: '100%' }}
                placement="bottom"
                value={selectedDate}
                placeholder="Введите дату"
                format="MM.DD.YYYY"
                min={new Date('04.04.2024')}
                max={new Date()}
                onChange={(date: any) => {
                  setDate(date.target.value);
                  setOpen(false);
                }}
              />
            </Box>
          }
          name={title}
          value={data.reduce((acc, tokens) => acc + tokens).toFixed(2)}
          bottomContent={
            <Box mt="12px">
              <LineChart
                chartData={[{ name: title, data: data }]}
                chartOptions={getBarUsage(labels)}
              />
            </Box>
          }
        />
      </div>
    );
  }

  return null;
}

export default LineChartUsage;
