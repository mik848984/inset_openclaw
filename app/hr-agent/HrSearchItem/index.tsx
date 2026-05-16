import Card from '@/components/card/Card';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Switch,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import TruncateText from '@/components/TruncateText';
import { hrServiceUI, IHrSearchUI } from '@/services/ui/HrService';
import { MdDelete, MdEditNote } from 'react-icons/md';
import React, { useContext } from 'react';
import { useRouter } from 'next/navigation';
import HrSearchItemStatus from './HrSearchItemStatus';
import { ImAttachment } from 'react-icons/im';
import { IoMdMore } from 'react-icons/io';
import { FiEdit } from 'react-icons/fi';
import { ModalContext } from '@/contexts/ModalContext';
import { IoAdd } from 'react-icons/io5';

interface IProps {
  item: IHrSearchUI;
}

function HrSearchItem({ item }: IProps) {
  const textColor = useColorModeValue('gray.500', 'white');
  const router = useRouter();

  const { setHrAgentUpdateModalOpen } = useContext(ModalContext);

  if (item._id === 'loading') {
    return (
      <Card
        transition="0.3s"
        tabIndex="0"
        _focus={{
          cursor: 'pointer',
          boxShadow: '2px 1px 23px 7px rgba(112, 144, 176, 0.55)',
        }}
        _hover={{
          cursor: 'pointer',
          boxShadow: '2px 1px 23px 7px rgba(112, 144, 176, 0.55)',
        }}
      >
        <Flex
          alignItems="center"
          justifyContent="center"
          minHeight="180px"
          height="100%"
          textAlign="center"
          gap="12px"
        >
          <Spinner size="xl" />
        </Flex>
      </Card>
    );
  }

  return (
    <Card>
      <Flex
        alignItems="center"
        pt="4px"
        pb="4px"
        gap="8px"
        justifyContent="space-between"
      >
        <Heading size="md">
          <TruncateText maxLength={120} text={item.query.join(', ')} />
        </Heading>
        <Switch
          onChange={(e: any) => {
            hrServiceUI.toggleActive(item._id, e.target.checked);
          }}
          isChecked={item.isActive}
        />
      </Flex>
      <Box height="12px" />

      <HrSearchItemStatus status={item.status} />
      <Box height="12px" />
      <Grid>
        <Heading size="xs" fontSize="14px">
          Критерий поиска:
        </Heading>
        <Box height="8px" />
        <Text fontSize="12px" color={textColor}>
          <TruncateText
            withoutTooltip
            maxLength={230}
            text={item.initialQuery}
          />
        </Text>
      </Grid>
      <Box height="12px" />
      <Heading
        display="flex"
        gap="4px"
        size="xs"
        fontSize="13px"
        alignItems="end"
      >
        Найдено всего резюме:
        <Text fontSize="14px">{item.totalResumes || 0}</Text>
      </Heading>
      <Heading
        alignItems="end"
        display="flex"
        gap="4px"
        size="xs"
        fontSize="13px"
      >
        Обработано резюме:{' '}
        <Text fontSize="14px">{item.completedResumes || 0}</Text>
      </Heading>
      <Box height="12px" />
      <Box marginTop="auto">
        <Flex justifyContent="space-between" alignItems="center" mt="12px">
          <Menu>
            <MenuButton as={IconButton}>
              <IconButton aria-label="Действия по карточке">
                <Icon
                  as={IoMdMore}
                  width="28px"
                  height="30px"
                  color={textColor}
                />
              </IconButton>
            </MenuButton>
            <MenuList>
              <MenuItem
                gap="8px"
                onClick={() => {
                  hrServiceUI.setCurrentHrSearchEdit(item);
                  setHrAgentUpdateModalOpen!(true);
                }}
              >
                <Icon color="gray.500" w="24px" h="24px" as={MdEditNote} />
                Редактировать
              </MenuItem>
              <MenuItem
                gap="8px"
                onClick={() => {
                  hrServiceUI.deleteHrAgent(item._id);
                }}
              >
                <Icon color="red.500" w="24px" h="24px" as={MdDelete} />
                Удалить
              </MenuItem>
            </MenuList>
          </Menu>

          <Button
            variant="primary"
            onClick={async () => {
              hrServiceUI.setCurrentHrSearch(item);

              router.push('/hr-agent-scores');
            }}
          >
            Посмотреть оценку
          </Button>
        </Flex>
      </Box>
    </Card>
  );
}

export default HrSearchItem;
