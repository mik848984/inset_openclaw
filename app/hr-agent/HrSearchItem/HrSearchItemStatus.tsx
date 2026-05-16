import { HrSearchStatus } from '@/services/ui/HrService';
import { Flex, Spinner, Tag } from '@chakra-ui/react';

interface IProps {
  status: HrSearchStatus;
}

function HrSearchItemStatus({ status }: IProps) {
  if (status === HrSearchStatus.Created) {
    return (
      <Flex>
        <Tag
          background="gray.300"
          color="black"
          size="md"
          p="6px"
          pl="12px"
          pr="12px"
        >
          Создан, ожидает загрузки резюме
        </Tag>
      </Flex>
    );
  }

  if (status === HrSearchStatus.Fetching) {
    return (
      <Flex alignItems="center" gap="12px">
        <Spinner />
        <Tag
          size="md"
          background="navy.300"
          color="white"
          p="6px"
          pl="12px"
          pr="12px"
        >
          Запрос резюме
        </Tag>
      </Flex>
    );
  }

  if (status === HrSearchStatus.Calculation) {
    return (
      <Flex alignItems="center" gap="12px">
        <Spinner />
        <Tag
          size="md"
          background="navy.500"
          color="white"
          p="6px"
          pl="12px"
          pr="12px"
        >
          Оценка резюме
        </Tag>
      </Flex>
    );
  }
  if (status === HrSearchStatus.Stopped) {
    return (
      <Flex alignItems="center" gap="12px">
        <Tag
          size="md"
          background="gray.300"
          color="black"
          p="6px"
          pl="12px"
          pr="12px"
        >
          Остановлен
        </Tag>
      </Flex>
    );
  }

  return (
    <Flex>
      <Tag
        size="md"
        background="gray.300"
        color="black"
        p="6px"
        pl="12px"
        pr="12px"
      >
        Ожидает обновления резюме
      </Tag>
    </Flex>
  );
}

export default HrSearchItemStatus;
