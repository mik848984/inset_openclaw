import {
  Box,
  Button,
  Grid,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Modal } from '@salutejs/plasma-web';
interface IProps {
  onClose: () => void;
  onCloseAfterRedirect: () => void;
  open: boolean;
}

function AuthorizationModal({ onClose, open, onCloseAfterRedirect }: IProps) {
  const brandColor = useColorModeValue('#fdfeff', '#142050');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');

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
      <Heading style={{ fontSize: '25px', textAlign: 'center' }}>
        Необходима авторизация!
      </Heading>{' '}
      <div>
        <Box p="18px">
          <Grid>
            <Heading size="md" style={{ textAlign: 'center' }}>
              Для оплаты необходимо авторизоваться!
            </Heading>
            <Box h="16px" />
            <div style={{ textAlign: 'center' }}>
              После авторизации вы вернетесь на предыдущую страницу.
            </div>
            <Box h="16px" />
          </Grid>
          <Link
            style={{ width: '100%' }}
            href="/others/sign-in"
            onClick={() => {
              onClose();
              onCloseAfterRedirect();
            }}
          >
            <Button w="100%" variant="primary" mb={'5'}>
              Авторизоваться
            </Button>
          </Link>
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

export default AuthorizationModal;
