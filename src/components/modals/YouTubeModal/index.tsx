import { Modal } from '@salutejs/plasma-web';
import {
  Box,
  Button,
  FormLabel,
  Grid,
  Heading,
  Input,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { attachmentsService } from '@/services/ui/AttachemntsService';

interface IProps {
  onClose: () => void;
  open: boolean;
}

function isValidYoutubeUrl(url: string) {
  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(watch\?v=|embed\/|v\/|shorts\/)?([a-zA-Z0-9_-]{11})(?:[?&].*)?$/;

  return youtubeRegex.test(url);
}

function YouTubeModal({ open, onClose }: IProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const brandColor = useColorModeValue('#fdfeff', '#142050');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('gray.500', 'white');

  const [render, setRender] = useState(false);

  useEffect(() => {
    setRender(true);
  }, []);

  if (!render) return null;

  return (
    <Modal
      opened={open}
      onClose={onClose}
      showCloseButton={false}
      style={{ background: brandColor, width: '28rem' }}
    >
      <Heading style={{ fontSize: '20px', textAlign: 'center' }}>
        Укажите ссылку на YouTube Видео
      </Heading>{' '}
      <div>
        <Box p="18px">
          <Grid>
            <FormLabel
              display="flex"
              htmlFor="youtube"
              fontSize="md"
              color={textColor}
              letterSpacing="0px"
              _hover={{ cursor: 'pointer' }}
            >
              Ссылка
            </FormLabel>
            <Input
              id="youtube"
              isInvalid={error}
              placeholder="https://www.youtube.com/watch?v=XXXXXXXX"
              value={value}
              onChange={(e: any) => setValue(e.target.value)}
            />
          </Grid>
          {error && (
            <FormLabel
              display="flex"
              fontSize="md"
              color="red.500"
              letterSpacing="0px"
            >
              Укажите валидную ссылку!
            </FormLabel>
          )}
          <Box h="14px" />
          <Button
            w="100%"
            variant="primary"
            mb="6px"
            onClick={() => {
              const isValid = isValidYoutubeUrl(value);
              setError(!isValid);

              if (!isValid) return;

              attachmentsService.setYouTube(value);
              setValue('');
              setError(false);
              onClose();
            }}
          >
            Применить
          </Button>
          <Button
            w="100%"
            onClick={() => {
              onClose();
            }}
            variant="transparent"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="full"
            fontSize="md"
            p="6px 20px"
          >
            Закрыть
          </Button>
        </Box>
      </div>
    </Modal>
  );
}

export default YouTubeModal;
