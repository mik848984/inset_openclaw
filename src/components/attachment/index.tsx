import {
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
  useMediaQuery,
  useToast,
} from '@chakra-ui/react';
import { ImAttachment } from 'react-icons/im';
import React, { useContext } from 'react';
import { attachmentsService } from '@/services/ui/AttachemntsService';
import { pluralize } from '@/utils/pluralize';
import InputFile from '@/components/InputFile';
import {
  TbBrandYoutube,
  TbBrandYoutubeFilled,
  TbCameraPlus,
  TbFiles,
  TbFileSpark,
  TbPhotoPlus,
} from 'react-icons/tb';
import { ChatAiContext } from '@/contexts/ChatAiContext';
import { ModalContext } from '@/contexts/ModalContext';

interface IProps {}
function Attachment() {
  const { model } = useContext(ChatAiContext);
  const { setYouTubeModalOpen } = useContext(ModalContext);

  const [isLargerThan800] = useMediaQuery('(min-width: 800px)', {
    ssr: true,
    fallback: false, // return false on the server, and re-evaluate on the client side
  });

  console.log({ isLargerThan800 });

  const toast = useToast();

  const attachColor = useColorModeValue('gray.500', 'white');

  const onChange = async (event: any) => {
    const files = [...event.target?.files!];

    console.log(files);

    const maxFiles = 3;
    const currentTotalFiles = attachmentsService.attachments.size;

    if (currentTotalFiles >= maxFiles) {
      toast({
        title: `К диалогу уже прикреплено максимальное количество файлов (${maxFiles}).`,
        position: 'bottom-left',
        status: 'info',
        isClosable: true,
      });

      return;
    }

    const remainingSlots = maxFiles - currentTotalFiles;

    const filesToProcess = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast({
        title: `Вы выбрали ${files.length} ${pluralize(files.length, ['файл', 'файла', 'файлов'])}, но можно добавить только ${remainingSlots}. ${pluralize(remainingSlots, ['Будет', 'Будут', 'Будут'])} ${pluralize(remainingSlots, ['прикреплен', 'прикреплены', 'прикреплены'])} ${pluralize(remainingSlots, ['первый', 'первые', 'первые'])} ${pluralize(remainingSlots, ['файл', 'файла', 'файлов'])}.`,
        position: 'bottom-left',
        status: 'info', // Можно использовать 'warning'
        isClosable: true,
      });
    }

    await Promise.all(
      filesToProcess.map(async (file) => {
        console.log(file);

        await attachmentsService.loadAttachment(file);
      }),
    );
  };

  if (!model?.includes('gemini')) {
    return null;
  }

  if (isLargerThan800) {
    return (
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Приложить файл"
          w="38px"
          h="38px"
        >
          <Icon
            as={ImAttachment}
            width="24px"
            height="24px"
            color={attachColor}
          />
        </MenuButton>
        <MenuList>
          <InputFile onChange={onChange} type="file">
            <MenuItem display="flex" gap="12px">
              <Icon
                as={TbFileSpark}
                width="24px"
                height="24px"
                color={attachColor}
              />
              Файл
            </MenuItem>
          </InputFile>
          <MenuItem
            display="flex"
            gap="12px"
            onClick={() => {
              setYouTubeModalOpen!(true);
            }}
          >
            <Icon
              as={TbBrandYoutube}
              width="24px"
              height="24px"
              color={attachColor}
            />
            YouTube Видео
          </MenuItem>
        </MenuList>
      </Menu>
    );
  }

  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Приложить файл"
          w="38px"
          h="38px"
        >
          <Icon
            as={ImAttachment}
            width="24px"
            height="24px"
            color={attachColor}
          />
        </MenuButton>
        <MenuList>
          <InputFile
            onChange={onChange}
            type="file"
            accept="image/*"
            capture="environment"
          >
            <MenuItem display="flex" gap="12px">
              <Icon
                as={TbCameraPlus}
                width="24px"
                height="24px"
                color={attachColor}
              />
              Сделать фото
            </MenuItem>
          </InputFile>
          <InputFile onChange={onChange} type="file" accept="image/*">
            <MenuItem display="flex" gap="12px">
              <Icon
                as={TbPhotoPlus}
                width="24px"
                height="24px"
                color={attachColor}
              />
              Галерея
            </MenuItem>
          </InputFile>

          <InputFile onChange={onChange} type="file">
            <MenuItem display="flex" gap="12px">
              <Icon
                as={TbFiles}
                width="24px"
                height="24px"
                color={attachColor}
              />
              Документ
            </MenuItem>
          </InputFile>
          <MenuItem
            display="flex"
            gap="12px"
            onClick={() => {
              setYouTubeModalOpen!(true);
            }}
          >
            <Icon
              as={TbBrandYoutube}
              width="24px"
              height="24px"
              color={attachColor}
            />
            YouTube Видео
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
}

export default Attachment;
