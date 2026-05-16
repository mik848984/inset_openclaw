import { Skeleton, Stack } from '@chakra-ui/react';

function SkeletonLoader() {
  return (
    <Stack  gap="6" maxW="s">
      <Skeleton  borderRadius='14px'  height="160px" />
    </Stack>
  );
}

export default SkeletonLoader;
