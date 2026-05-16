'use client';
/*eslint-disable*/

import Card from '@/components/card/Card';
import MessageBox from '@/components/MessageBox';
import { CaptionBody, OpenAIModel } from '@/types/types';
import {
  Button,
  Flex,
  FormLabel,
  Input,
  Select,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';

export default function Home() {
  // *** Если вы используете переменную ..env.local для вашего API ключа, что является рекомендуемым методом, используйте переменную apiKey, закомментированную ниже
  // Состояния ввода
  const [topic, setTopic] = useState<string>('');
  const [toneOfVoice, setToneOfVoice] = useState<
    | ''
    | 'Formal'
    | 'Informal'
    | 'Humorous'
    | 'Serious'
    | 'Optimistic'
    | 'Motivating'
    | 'Respectful'
    | 'Assertive'
    | 'Conversational'
  >('');
  const [description, setDescription] = useState<string>('');
  // Сообщение ответа
  const [outputCode, setOutputCode] = useState<string>('');
  // Модель ChatGPT
  const [model, setModel] = useState<OpenAIModel>('gpt-3.5-turbo');
  // Состояние загрузки
  const [loading, setLoading] = useState<boolean>(false);
  // API Ключ
  // const [apiKey, setApiKey] = useState<string>();
  const textColor = useColorModeValue('navy.700', 'white');
  const placeholderColor = useColorModeValue(
    { color: 'gray.500' },
    { color: 'whiteAlpha.600' },
  );
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const toast = useToast();

  // -------------- Основной обработчик API --------------
  const handleTranslate = async () => {
    if (!toneOfVoice) {
      alert('Пожалуйста, выберите тон голоса.');
      return;
    }

    if (!topic) {
      alert('Пожалуйста, введите вашу тему.');
      return;
    }

    if (!description) {
      alert('Пожалуйста, введите ваше описание.');
      return;
    }

    setLoading(true);
    setOutputCode('');

    const controller = new AbortController();

    const body: CaptionBody = {
      topic,
      toneOfVoice,
      description,
      model,
    };

    // -------------- Fetch --------------
    const response = await fetch('/api/captionAPI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      setLoading(false);
      alert(
        'Что-то пошло не так при получении данных от API. Убедитесь, что используете валидный API ключ.',
      );
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
    let code = '';

    while (!done) {
      setLoading(true);
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      code += chunkValue;

      setOutputCode((prevCode) => prevCode + chunkValue);
    }

    setLoading(false);
    copyToClipboard(code);
  };

  // -------------- Копировать Ответ --------------
  const copyToClipboard = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  // -------------- Обработчик значений ввода --------------
  const handleTopic = (Event: any) => {
    setTopic(Event.target.value);
  };
  const handleToneOfVoice = (Event: any) => {
    setToneOfVoice(Event.target.value);
  };
  const handleDescription = (Event: any) => {
    setDescription(Event.target.value);
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
            Заголовок
          </Text>
          <Text fontSize={'16px'} color="gray.500" fontWeight="500" mb="30px">
            О чем будет ваш заголовок для Instagram?
          </Text>
          <FormLabel
            display="flex"
            ms="10px"
            htmlFor={'topic'}
            fontSize="md"
            color={textColor}
            letterSpacing="0px"
            fontWeight="bold"
            _hover={{ cursor: 'pointer' }}
          >
            Тема
          </FormLabel>
          <Input
            color={textColor}
            border="1px solid"
            borderRadius={'10px'}
            borderColor={borderColor}
            h="60px"
            id="topic"
            fontWeight="500"
            placeholder="Введите здесь тему..."
            _placeholder={placeholderColor}
            _focus={{ borderColor: 'none' }}
            mb="28px"
            onChange={handleTopic}
          />
          <FormLabel
            display="flex"
            ms="10px"
            htmlFor={'description'}
            fontSize="md"
            color={textColor}
            letterSpacing="0px"
            fontWeight="bold"
            _hover={{ cursor: 'pointer' }}
          >
            Краткое описание
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
            color={textColor}
            placeholder="Введите здесь ваше краткое описание..."
            _placeholder={placeholderColor}
            id="description"
            onChange={handleDescription}
          />
          <FormLabel
            display="flex"
            ms="10px"
            htmlFor={'topic'}
            fontSize="md"
            color={textColor}
            letterSpacing="0px"
            fontWeight="bold"
            _hover={{ cursor: 'pointer' }}
          >
            Тон
          </FormLabel>
          <Select
            border="1px solid"
            borderRadius={'10px'}
            borderColor={borderColor}
            h="60px"
            id="topic"
            placeholder="Выберите тон..."
            _focus={{ borderColor: 'none' }}
            mb="28px"
            onChange={handleToneOfVoice}
          >
            <option value="Formal">Официальный</option>
            <option value="Informal">Неофициальный</option>
            <option value="Humorous">Юмористический</option>
            <option value="Serious">Серьезный</option>
            <option value="Optimistic">Оптимистичный</option>
            <option value="Motivating">Мотивирующий</option>
            <option value="Respectful">Уважительный</option>
            <option value="Assertive">Настойчивый</option>
            <option value="Conversational">Разговорный</option>
          </Select>
          <Button
            py="20px"
            px="16px"
            fontSize="md"
            variant="primary"
            borderRadius="45px"
            w={{ base: '100%' }}
            mt="28px"
            h="54px"
            onClick={handleTranslate}
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
            Сгенерировать заголовок для Instagram
          </Button>
        </Card>
        <Card maxW="100%" h="100%">
          <Text fontSize={'30px'} color={textColor} fontWeight="800" mb="10px">
            Ответ нейросети
          </Text>
          <Text fontSize={'16px'} color="gray.500" fontWeight="500" mb="30px">
            Наслаждайтесь вашим новым заголовком / описанием для Instagram!
          </Text>
          <MessageBox output={outputCode} />
          <Button
            variant="transparent"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="full"
            maxW="160px"
            ms="auto"
            fontSize="md"
            w={{ base: '300px', md: '420px' }}
            h="54px"
            onClick={() => {
              if (outputCode) navigator.clipboard.writeText(outputCode);
              toast({
                title: outputCode
                  ? `Контент успешно скопирован!`
                  : `Сначала сгенерируйте какой-нибудь контент!`,
                position: 'top',
                status: outputCode ? 'success' : `error`,
                isClosable: true,
              });
            }}
          >
            Скопировать
          </Button>
        </Card>
      </Flex>
    </Flex>
  );
}
