import Card from '@/components/card/Card';
import {
  Divider,
  Flex,
  Grid,
  Heading,
  Icon,
  Progress,
  Radio,
  useColorModeValue,
} from '@chakra-ui/react';
import IconBox from '@/components/icons/IconBox';
import { LuBrain } from 'react-icons/lu';
import { BiSolidTimer } from 'react-icons/bi';
import React from 'react';
import { IoDocumentAttachOutline } from 'react-icons/io5';

interface IProps {
  title: string;
  isChecked: boolean;
  onClick: () => void;
  power: number;
  speed: number;
  attachments?: boolean;
}

function ModelsCard({
  title,
  onClick,
  isChecked,
  power,
  speed,
  attachments,
}: IProps) {
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const brandColor = useColorModeValue('brand.500', 'white');

  return (
    <Card
      cursor="pointer"
      onClick={onClick}
      style={{
        borderRadius: '2rem',
      }}
    >
      <Flex justify="space-between">
        <Heading size="md">{title}</Heading>
        <Radio w="20px" pr="6px" isChecked={isChecked} />
      </Flex>
      <Divider pt="12px" mb="12px" />
      <Flex gap="16px">
        <IconBox
          minW="56px"
          minH="56px"
          maxW="56px"
          maxH="56px"
          bg={boxBg}
          icon={<Icon w="24px" h="24px" as={LuBrain} color={brandColor} />}
        />
        <Grid w="100%" m="0 !important">
          <div>Качество ответов (Ум)</div>
          <Progress
            mt="8px !important"
            w="100%"
            colorScheme={power < 50 ? 'orange' : 'green'}
            value={power}
          />
        </Grid>
      </Flex>
      <Divider pt="12px" mb="12px" />
      <Flex gap="16px">
        <IconBox
          minW="56px"
          minH="56px"
          bg={boxBg}
          icon={<Icon w="24px" h="24px" as={BiSolidTimer} color={brandColor} />}
        />
        <Grid w="100%" m="0 !important">
          <div>Скорость генерации</div>
          <Progress
            mt="8px !important"
            w="100%"
            colorScheme={speed < 50 ? 'orange' : 'green'}
            value={speed}
          />
        </Grid>
      </Flex>
      {attachments && (
        <>
          <Divider pt="12px" mb="12px" />
          <Flex gap="16px" alignItems="center" flexDirection="start">
            <IconBox
              minW="56px"
              minH="56px"
              bg={boxBg}
              icon={
                <Icon
                  w="24px"
                  h="24px"
                  as={IoDocumentAttachOutline}
                  color={brandColor}
                />
              }
            />
            <span>
              Поддерживает загрузку документов, изображений и YouTube видео
            </span>
          </Flex>
        </>
      )}
    </Card>
  );
}

export default ModelsCard;
