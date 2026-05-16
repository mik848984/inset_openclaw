import { IAttachmentUI } from '@/services/ui/AttachemntsService';
import Card from '@/components/card/Card';
import React from 'react';
import {
  Box,
  Flex,
  Icon,
  IconButton,
  Spinner,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { TiDeleteOutline } from 'react-icons/ti';
import { MdError } from 'react-icons/md';
import {
  GrDocument,
  GrDocumentImage,
  GrDocumentPdf,
  GrDocumentTxt,
} from 'react-icons/gr';
import TruncateText from '@/components/TruncateText';
import { TbBrandYoutube } from 'react-icons/tb';

interface IProps extends IAttachmentUI {
  onRemove: () => void;
}

function getIcon(type: string) {
  if (type.startsWith('image')) {
    return GrDocumentImage;
  }

  if (type.includes('pdf')) {
    return GrDocumentPdf;
  }

  if (type.includes('text')) {
    return GrDocumentTxt;
  }

  if (type.includes('youtube')) {
    return TbBrandYoutube;
  }

  return GrDocument;
}

function AttachmentItem({ type, name, url, onRemove, loading, error }: IProps) {
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');

  const attachColor = useColorModeValue('gray.500', 'white');

  return (
    <Card
      maxWidth="252px"
      minWidth="252px"
      p="8px"
      pl="12px"
      pr="6px"
      w="auto"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="none"
    >
      <Flex
        gap="6px"
        alignItems="center"
        h="100%"
        justifyContent="space-between"
      >
        <Flex gap="6px" alignItems="center" h="100%">
          <Icon
            as={getIcon(type)}
            width="24px"
            height="24px"
            color={attachColor}
          />
          <Box fontWeight="500" ml="4px" whiteSpace="nowrap">
            <TruncateText text={name} maxLength={16} />
          </Box>
        </Flex>
        {loading && <Spinner w="1rem" h="1rem" />}
        {error && (
          <Tooltip
            textAlign="center"
            label="При загрузке вложения произошла ошибка!"
            aria-label="При загрузке вложения произошла ошибка!"
          >
            <Flex alignItems="center" justifyContent="center">
              <Icon as={MdError} width="24px" height="24px" color="red.500" />
            </Flex>
          </Tooltip>
        )}
        {!loading && (
          <IconButton
            onClick={onRemove}
            aria-label="Удалить файл"
            minW="2rem"
            h="2rem"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon
              as={TiDeleteOutline}
              width="24px"
              height="24px"
              color={attachColor}
            />
          </IconButton>
        )}
      </Flex>
    </Card>
  );
}

export default AttachmentItem;
