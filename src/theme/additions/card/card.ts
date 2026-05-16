import { mode } from '@chakra-ui/theme-tools';
const Card = {
  baseStyle: (props: any) => ({
    p: '20px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    position: 'relative',
    borderRadius: '14px',
    minWidth: '0px',
    wordWrap: 'break-word',
    bg: mode('#ffffff', 'navy.800')(props),
    boxShadow: mode(
      '2px 1px 33px 7px rgba(112, 144, 176, 0.15)',
      'unset',
    )(props),
    backgroundClip: 'border-box',
  }),
};

export const CardComponent = {
  components: {
    Card,
  },
};
