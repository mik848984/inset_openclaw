
'use client';
/*eslint-disable*/

import {
  Button,
  Flex,
  FormLabel,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { copyTextToClipboard } from '@/utils/copyText';
import Card from '@/components/card/Card';
import { useState } from 'react';
import MessageBox from '@/components/MessageBox';

interface LifeAgentPageProps {
  agentId: string;
  title: string;
  description: string;
  placeholder: string;
  ctaLabel?: string;
}

export default function LifeAgentPage(props: LifeAgentPageProps) {
  const { agentId, title, description, placeholder, ctaLabel = 'Создать' } = props;

  const [content, setContent] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);


  const extraInfo: Record<string, { title: string; text: string }> = {
    psychoanalyst: {
      title: 'Как работает агент «Психоаналитик»',
      text:
        'Это игровой ИИ-агент, который опирается только на твои ответы и не заменяет психотерапию или медицинскую помощь. ' +
        'Он помогает мягко отразить твои сильные стороны, привычки и мотивы, чтобы ты мог(ла) по-новому посмотреть на себя.'
    },
    'netflix-writer': {
      title: 'Как работает агент «Netflix-сценарист»',
      text:
        'Агент превращает факты о тебе в сюжет эпизода сериала. Это способ взглянуть на свою жизнь как на историю героя, ' +
        'без мистики и прогнозов, только творческая интерпретация.'
    },
    oracle: {
      title: 'Как работает агент «Оракул»',
      text:
        'Оракул не предсказывает будущее и не даёт финансовых или медицинских советов. ' +
        'Он берёт твой текущий контекст и рисует вдохновляющую, но реалистичную картинку возможного будущего.'
    },
    'letter-from-child': {
      title: 'Как работает агент «Письмо из детства»',
      text:
        'Этот агент пишет тёплое «письмо» от твоего воображаемого детского «я». Оно основано на информации, которую ты даёшь, ' +
        'и помогает вспомнить, какие мечты и ценности для тебя важны.'
    },
    epilogist: {
      title: 'Как работает агент «Эпилогист»',
      text:
        'Эпилогист подводит спокойный итог выбранному периоду жизни. Это не приговор и не диагноз, а способ структурировать опыт и увидеть, что уже получилось.'
    },
  };

  const currentExtra = extraInfo[agentId];
  const textColor = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const toast = useToast();

  const handleGenerate = async () => {
    if (!content) {
      alert('Пожалуйста, введите текст.');
      return;
    }

    setLoading(true);
    setOutput('');

    const controller = new AbortController();

    const body = {
      agentId,
      content,
    };

    try {
      const response = await fetch('/api/lifeAgentsAPI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        setLoading(false);
        alert('Произошла ошибка при получении данных от API.');
        return;
      }

      const data = response.body;

      if (!data) {
        setLoading(false);
        alert('Что-то пошло не так');
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let result = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value || new Uint8Array());

        result += chunkValue;

        setOutput((prev) => prev + chunkValue);
      }

      setLoading(false);
    } catch (error: any) {
      console.error(error);
      setLoading(false);
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить ответ от модели.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleContent = (event: any) => {
    setContent(event.target.value);
  };

  const handleShare = async () => {
    if (!output) return;

    try {
      if (typeof navigator !== 'undefined' && (navigator as any).share) {
        try {
          await (navigator as any).share({
            text: output,
            title: 'Результат агента жизни',
          });
          // если системный шэринг отработал — можно даже не показывать тост
          return;
        } catch (shareError) {
          // пользователь мог отменить окно шаринга — просто пойдём в копирование
          console.warn('Share cancelled or failed', shareError);
        }
      }

      await copyTextToClipboard(output);
      toast({
        title: 'Скопировано',
        description:
          'Результат скопирован в буфер обмена. Можете делиться им где угодно.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось поделиться результатом. Попробуйте ещё раз.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex
      w="100%"
      direction="column"
      position="relative"
      mt={{ base: '70px', md: '0px', xl: '0px' }}
    >
      <Flex
        mx="auto"
        w={{ base: '100%', md: '100%', xl: '100%' }}
        maxW="100%"
        justify="center"
        direction={{ base: 'column', md: 'row' }}
      >
        <Card
          minW={{ base: '100%', md: '40%', xl: '476px' }}
          maxW={{ base: '100%', md: '40%', xl: '476px' }}
          h="min-content"
          me={{ base: '0px', md: '20px' }}
          mb={{ base: '20px', md: '0px' }}
        >
          <Text fontSize={'30px'} color={textColor} fontWeight="800" mb="10px">
            {title}
          </Text>
          <Text fontSize={'16px'} color="gray.500" fontWeight="500" mb="30px">
            {description}
          </Text>

          <FormLabel
            display="flex"
            ms="4px"
            fontSize="sm"
            fontWeight="500"
            color={textColor}
            mb="8px"
          >
            Ваш текст
          </FormLabel>
          <Textarea
            border="1px solid"
            borderRadius={'10px'}
            borderColor={borderColor}
            p="15px 20px"
            mb="28px"
            minH="324px"
            fontWeight="500"
            _focus={{ borderColor: 'none' }}
            placeholder={placeholder}
            value={content}
            onChange={handleContent}
          />

          <Text fontSize="sm" color="gray.500" mb="16px">
            Подсказка: опиши ситуацию и желаемый результат в 2–3 предложениях. Это поможет агенту дать более точный ответ.
          </Text>

          <Button
            fontSize="md"
            variant="primary"
            borderRadius="45px"
            w={{ base: '100%' }}
            mt="28px"
            h="54px"
            onClick={handleGenerate}
            isLoading={loading ? true : false}
            _hover={{
              boxShadow:
                '0px 21px 27px -10px rgba(96, 60, 255, 0.48) !important',
              bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%) !important',
              _disabled: {
                bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)',
              },
            }}
          >
            {ctaLabel}
          </Button>

          <Button
            fontSize="sm"
            variant="outline"
            borderRadius="45px"
            w={{ base: '100%' }}
            mt="12px"
            h="46px"
            onClick={handleShare}
            isDisabled={!output}
          >
            Поделиться результатом (скопировать)
          </Button>
        </Card>

        <Flex
          mt={{ base: '20px', md: '0px' }}
          w={{ base: '100%', md: '60%', xl: '60%' }}
        >
          <MessageBox output={output} />
        </Flex>
      </Flex>

      {currentExtra && (
        <Flex
          direction="column"
          w="100%"
          maxW="800px"
          mt={{ base: '24px', md: '32px' }}
          gap="8px"
        >
          <Text fontSize="sm" fontWeight="600" color={textColor} mb="1">
            {currentExtra.title}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {currentExtra.text}
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
