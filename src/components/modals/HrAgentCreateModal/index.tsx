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
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

import Modal from '@/components/modals/Modal/Modal';
import { hrServiceUI } from '@/services/ui/HrService';

interface IProps {
  onClose: () => void;
  open: boolean;
}

function AvitoAgentCreateModal({ onClose, open }: IProps) {
  const textColor = useColorModeValue('gray.600', 'white');
  const [initialQuery, setInitialQuery] = useState('');

  return (
    <Modal
      open={open}
      onClose={onClose}
      contentFooter={
        <Button
          variant="primary"
          w="100%"
          onClick={() => {
            hrServiceUI.createHrAgent({
              initialQuery,
              requestData: { type: ['avito', 'hh'] },
            });
            onClose();
          }}
        >
          Создать
        </Button>
      }
      headerProps={
        <>
          <Grid p="4" templateColumns="1fr 3.5fr 1fr">
            <div></div>
            <Flex align="center" textAlign="center" justify="center">
              <Heading size="md">Создание HR агента</Heading>
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
          <Text color={textColor} fontSize="13px">
            Критерии для поиска
          </Text>
          <Textarea
            height="500px"
            onChange={(e: any) => setInitialQuery(e.target.value)}
            placeholder="Введите критерии для выбора кандидата: опыт, навыки, образование"
          ></Textarea>
        </Grid>
      }
    ></Modal>
  );
}

export default AvitoAgentCreateModal;
