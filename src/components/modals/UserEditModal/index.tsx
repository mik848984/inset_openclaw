import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  IconButton,
  Input,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import React, { useEffect, useState } from 'react';
import Modal from '../Modal/Modal';
import { usersService } from '@/services/ui/UsersService';
import { useSubscribe } from '@/utils/hooks/useSubscribe';

interface IProps {
  open: boolean;
  onClose: () => void;
}

function UserEditModal({ open, onClose }: IProps) {
  const toast = useToast();

  const textColorPrimary = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');

  useSubscribe(usersService.listeners);

  const modelsBalance = usersService.currentUser?.modelsBalance;
  const imageGenerationBalance =
    usersService.currentUser?.imageGenerationBalance;
  const currentWebSearchBalance = usersService.currentUser?.webSearchBalance;

  const [textGenerate, setTextGenerate] = useState(modelsBalance);
  const [imageGenerate, setImageGenerate] = useState(
    usersService.currentUser?.imageGenerationBalance,
  );
  const [webSearchBalance, setWebSearchBalance] = useState(
    usersService.currentUser?.webSearchBalance,
  );

  useEffect(() => {
    setTextGenerate(modelsBalance);
    setImageGenerate(imageGenerationBalance);
    setWebSearchBalance(currentWebSearchBalance);
  }, [modelsBalance, imageGenerationBalance, currentWebSearchBalance]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      headerProps={
        <Grid p="4" templateColumns="1fr 1.5fr 1fr">
          <div />
          <Flex align="center" justify="center">
            <Heading textAlign="center" size="md">
              Редактирование баланса
            </Heading>
          </Flex>
          <Flex direction="row-reverse">
            <IconButton size="lg" aria-label="Close Model" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Flex>
        </Grid>
      }
      contentProps={
        <Grid p="30px" gap="12px">
          <Box>
            <Text fontSize="14px" mb="4px">
              Баланс генераций текста
            </Text>
            <Input
              width="100%"
              color={textColorPrimary}
              value={textGenerate}
              onChange={(e: any) => setTextGenerate(e.target.value)}
              type="number"
              placeholder="Баланс генераций текста..."
            />
          </Box>
          <Box width="100%">
            <Text fontSize="14px" mb="4px">
              Баланс генераций изображений
            </Text>
            <Input
              width="100%"
              color={textColorPrimary}
              value={imageGenerate}
              onChange={(e: any) => setImageGenerate(e.target.value)}
              type="number"
              placeholder="Баланс генераций изображений..."
            />
          </Box>
          <Box width="100%">
            <Text fontSize="14px" mb="4px">
              Баланс веб-поиска
            </Text>
            <Input
              width="100%"
              color={textColorPrimary}
              value={webSearchBalance}
              onChange={(e: any) => setWebSearchBalance(e.target.value)}
              type="number"
              placeholder="Баланс веб-поиска..."
            />
          </Box>
          <Box height="12px" />
          <Button
            variant="transparent"
            border="1px solid"
            borderColor={borderColor}
            onClick={async () => {
              try {
                await usersService.updateUser(
                  Number(textGenerate ?? 0),
                  Number(imageGenerate ?? 0),
                  Number(webSearchBalance ?? 0),
                );
                onClose();

                toast({
                  title: 'Баланс успешно обновлен!',
                  position: 'bottom-left',
                  status: 'success',
                  isClosable: true,
                });
              } catch (e) {
                toast({
                  title: 'Не удалось обновить баланс!',
                  position: 'bottom-left',
                  status: 'error',
                  isClosable: true,
                });
              }
            }}
          >
            Обновить балансы
          </Button>
        </Grid>
      }
    ></Modal>
  );
}

export default UserEditModal;
