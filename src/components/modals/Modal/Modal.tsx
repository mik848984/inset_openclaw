import { Box, useColorModeValue } from '@chakra-ui/react';
import React, { ReactNode, useEffect, useState } from 'react';
import { Sheet } from '@salutejs/plasma-web';

interface IProps {
  open: boolean;
  onClose: () => void;
  headerProps: JSX.Element;
  contentProps: JSX.Element;
  contentBorderRadius?: string;
  headerBorderRadius?: string;
  marginBottom?: string;
  fullWidth?: boolean;
  contentFooter?: ReactNode;
}

function Modal({
  open,
  onClose,
  headerProps,
  contentProps,
  fullWidth,
  contentFooter,
}: IProps) {
  const brandColor = useColorModeValue('#fdfeff', '#142050');

  const [render, setRender] = useState(false);

  useEffect(() => {
    setRender(true);
  }, []);

  if (!render) return null;

  return (
    <>
      <Sheet
        contentFooter={contentFooter}
        className={fullWidth ? '' : 'modal-sheet'}
        style={{ padding: 0 }}
        opened={open}
        onClose={onClose}
        contentHeader={
          <div
            style={{
              background: brandColor,
              borderRadius: '1.25rem 1.25rem 0rem 0rem',
            }}
          >
            {headerProps}
          </div>
        }
        hasHandle
        withOverlay
        withBlur
      >
        <Box
          width={{ base: '100%', md: fullWidth ? '100%' : '750px' }}
          minHeight="70vh"
          background={brandColor}
          borderRadius="0rem 0rem 1.25rem 1.25rem"
        >
          {contentProps}
        </Box>
      </Sheet>
    </>
  );
}

export default Modal;
