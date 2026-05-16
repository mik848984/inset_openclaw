import React, { useState } from 'react';

import {
  Button,
  Divider,
  Flex,
  Grid,
  Heading,
  IconButton,
  Textarea,
  Text,
  useColorModeValue,
  Box,
  Slider,
  SliderFilledTrack,
} from '@chakra-ui/react';
import {
  CloseIcon,
  SliderMark,
  SliderThumb,
  SliderTrack,
} from '@chakra-ui/icons';

import Modal from '@/components/modals/Modal/Modal';
import { hrServiceUI } from '@/services/ui/HrService';
import { useSubscribe } from '@/utils/hooks/useSubscribe';
import HrScoreItem from '../../../../app/hr-agent-scores/HrScoreItem';

interface IProps {
  onClose: () => void;
  open: boolean;
}

function BestSearchHrModal({ onClose, open }: IProps) {
  const textColor = useColorModeValue('gray.600', 'white');
  const [initialQuery, setInitialQuery] = useState('');
  const labelStyles = {
    mt: '2',
    ml: '-2.5',
    fontSize: 'sm',
  };
  const [sliderValue, setSliderValue] = useState(65);
  useSubscribe(hrServiceUI.listeners);

  return (
    <Modal
      open={open}
      onClose={onClose}
      headerProps={
        <>
          <Grid p="4" templateColumns="1fr 3.5fr 1fr">
            <div></div>
            <Flex align="center" textAlign="center" justify="center">
              <Heading size="md">Поиск среди лучших</Heading>
            </Flex>
            <Flex direction="row-reverse">
              <IconButton size="lg" aria-label="Close Model" onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Flex>
          </Grid>
          <Divider />
        </>
      }
      contentProps={
        <Grid p="16px" gap="8px" overflow="auto">
          <Box h="6px" />
          <Text color={textColor} fontSize="13px">
            Критерии для поиска из лучших
          </Text>
          <Textarea
            height="200px"
            onChange={(e: any) => setInitialQuery(e.target.value)}
            placeholder="Укажите что должно быть точно у кандидатов"
          />
          <Box height="6px" />

          <Text color={textColor} fontSize="13px">
            Процент совпадения по критериям
          </Text>

          <Box height="16px" />

          <Grid padding="0 16px">
            <Slider
              value={sliderValue}
              min={40}
              max={90}
              aria-label="slider-ex-6"
              onChange={(val: any) => setSliderValue(val)}
            >
              <SliderMark value={40} {...labelStyles}>
                40%
              </SliderMark>
              <div></div>
              <SliderMark
                style={{ marginTop: '8px !important' }}
                value={65}
                {...labelStyles}
              >
                65%
              </SliderMark>
              <SliderMark value={90} {...labelStyles}>
                90%
              </SliderMark>
              <SliderMark
                value={sliderValue}
                textAlign="center"
                bg="brand.500"
                color="white"
                mt="-10"
                ml="-5"
                w="12"
                borderRadius="5px"
              >
                {sliderValue}%
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Grid>
          <Box height="20px" />
          <Button
            className="search"
            isLoading={hrServiceUI.searchLoading}
            variant="primary"
            w="100%"
            onClick={async () => {
              await hrServiceUI.searchOfTheBest(initialQuery, sliderValue);
            }}
          >
            Искать
          </Button>

          <Box height="8px" />
          <Grid gap="12px">
            {hrServiceUI.bestHrScores.map((hrScore) => (
              <HrScoreItem hrScore={hrScore} isView={false} />
            ))}
          </Grid>
        </Grid>
      }
    ></Modal>
  );
}

export default BestSearchHrModal;
