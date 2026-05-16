import { Box, Button, Flex, Grid, Heading, Text } from '@chakra-ui/react';
import { hrServiceUI } from '@/services/ui/HrService';
import React, { useContext } from 'react';
import { useSubscribe } from '@/utils/hooks/useSubscribe';
import { ModalContext } from '@/contexts/ModalContext';
import HrScoreItem from '../HrScoreItem';
import useInfinityScroll from '@/utils/hooks/useInfinityScroll';
import { viewedItemsService } from '@/services/ui/ViewedItemsService';

function HrScoresList() {
  const { setBestSearchModalOpen } = useContext(ModalContext);

  useSubscribe(hrServiceUI.listeners);

  const { observerTarget } = useInfinityScroll(async () => {
    await hrServiceUI.getHrScores();
  });

  return (
    <>
      <Box height="24px" />
      <Flex
        flexDirection={{ base: 'column', md: 'row' }}
        gap="12px"
        alignItems="center"
        justifyContent="space-between"
      >
        <Heading
          alignItems="end"
          display="flex"
          gap="4px"
          size="md"
          fontSize="14px"
        >
          Обработано резюме:{' '}
          <Text fontSize="14px">{hrServiceUI.totalCount || 0}</Text>
        </Heading>
        <Button
          variant="primary"
          onClick={() => {
            setBestSearchModalOpen!(true);
          }}
        >
          Поиск среди лучших
        </Button>
      </Flex>
      <Box height="24px" />
      <Grid gap="12px">
        {hrServiceUI.hrScores.length > 0 ? (
          hrServiceUI.hrScores.map((hrScore) => (
            <HrScoreItem
              hrScore={hrScore}
              isView={viewedItemsService.isViewed(
                `${hrServiceUI.currentHrSearch?._id}_${hrScore._id}`,
              )}
            />
          ))
        ) : (
          <Flex
            mt="32px"
            w="100%"
            display="flex"
            justifyContent="center"
            textAlign="center"
          >
            <Heading size="md">
              Поиск еще не начался. <br /> Подождите следующего цикла
              поиска/оценки резюме
            </Heading>
          </Flex>
        )}

        <Box height="10px" ref={observerTarget}></Box>
      </Grid>
    </>
  );
}

export default HrScoresList;
