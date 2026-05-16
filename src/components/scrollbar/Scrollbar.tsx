'use client';
import { Box } from '@chakra-ui/react';

export const renderTrack = ({ style, ...props }: any) => {


  console.log({ ...style})
  return <div style={{ ...style }} {...props} />;
};
export const renderThumb = ({ style, ...props }: any) => {

  return <div style={{ ...style }} {...props} />;
};
export const renderView = ({ style, ...props }: any) => {

  return (
    <Box
      me={{ base: '0px !important', lg: '-16px !important' }}
      style={{ ...style }}
      {...props}
    />
  );
};
