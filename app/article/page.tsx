/*eslint-disable*/
'use client';
import {
  Flex,
  Button,
  FormLabel,
  Select,
  Text,
  Textarea,
  useToast,
  useColorModeValue,
  Input,
} from '@chakra-ui/react';
import Card from '@/components/card/Card';
import { OpenAIModel, ArticleBody } from '@/types/types';
import { useState } from 'react';
import MessageBox from '@/components/MessageBox';

export default function Home() {
  // *** Если вы используете переменную ..env.local для вашего API-ключа, рекомендуемый нами метод, используйте переменную apiKey, закомментированную ниже
  // Состояния ввода
  const [topic, setTopic] = useState<string>(''); // Тема
  const [title, setTitle] = useState<string>(''); // Заголовок
  const [language, setLanguage] = useState<'' | 'English' | 'Russian'>(''); // Язык
  const [words, setWords] = useState<200 | 300 | 400 | 500 | 600>(200); // Количество слов
  // Сообщение ответа
  const [outputCode, setOutputCode] = useState<string>(''); // Выходной код
  // Модель ChatGPT
  const [model, setModel] = useState<OpenAIModel>('gpt-3.5-turbo'); // Модель
  // Состояние загрузки
  const [loading, setLoading] = useState<boolean>(false); // Загрузка
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
    if (!topic) {
      alert('Пожалуйста, введите тему.'); // Please enter your subject.
      return;
    }

    setLoading(true);
    setOutputCode('');

    const controller = new AbortController();

    const body = {
      topic,
      title,
      language,
      words,
    };

    // -------------- Запрос данных --------------
    const response = await fetch('/api/articleAPI', {
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
        'Произошла ошибка при получении данных от API. Убедитесь, что используете действительный API-ключ.', // Something went wrong went fetching from the API. Make sure to use a valid API key.
      );
      return;
    }

    const data = response.body;

    if (!data) {
      setLoading(false);
      alert('Что-то пошло не так'); // Something went wrong
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

  // -------------- Копирование ответа --------------
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
  const handleTitle = (Event: any) => {
    setTitle(Event.target.value);
  };
  const handleLanguage = (Event: any) => {
    setLanguage(Event.target.value);
  };
  const handleWords = (Event: any) => {
    setWords(Event.target.value);
  };

  // Инициализация apiKey значением из localStorage
  // useEffect(() => {
  //   setApiKey(apiKeyApp);
  // }, [apiKey]);

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
            Детали статьи
          </Text>
          <Text fontSize={'16px'} color="gray.500" fontWeight="500" mb="30px">
            О чем будет ваша статья?
          </Text>
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
            placeholder="Введите здесь тему..."
            _placeholder={placeholderColor}
            onChange={handleTopic}
          />
          <FormLabel
            display="flex"
            ms="10px"
            htmlFor={'title'}
            fontSize="md"
            color={textColor}
            letterSpacing="0px"
            fontWeight="bold"
            _hover={{ cursor: 'pointer' }}
          >
            Заголовок
          </FormLabel>
          <Input
            color={textColor}
            border="1px solid"
            borderRadius={'10px'}
            borderColor={borderColor}
            h="60px"
            id="title"
            fontWeight="500"
            placeholder="Введите здесь заголовок..."
            _placeholder={placeholderColor}
            _focus={{ borderColor: 'none' }}
            mb="28px"
            onChange={handleTitle}
          />
          <FormLabel
            display="flex"
            ms="10px"
            htmlFor={'lang'}
            fontSize="md"
            color={textColor}
            letterSpacing="0px"
            fontWeight="bold"
            _hover={{ cursor: 'pointer' }}
          >
            Выберите язык
          </FormLabel>
          <Select
            border="1px solid"
            borderRadius={'10px'}
            borderColor={borderColor}
            h="60px"
            id="lang"
            placeholder="Выберите язык"
            _focus={{ borderColor: 'none' }}
            mb="28px"
            onChange={handleLanguage}
          >
            <option value="English">Английский</option>
            <option value="Russian">Русский</option>
          </Select>
          <FormLabel
            display="flex"
            ms="10px"
            htmlFor={'words'}
            fontSize="md"
            color={textColor}
            letterSpacing="0px"
            fontWeight="bold"
            _hover={{ cursor: 'pointer' }}
          >
            Выберите количество слов
          </FormLabel>
          <Select
            defaultValue={200}
            border="1px solid"
            borderRadius={'10px'}
            borderColor={borderColor}
            h="60px"
            id="words"
            placeholder="Выберите количество слов"
            _focus={{ borderColor: 'none' }}
            mb="28px"
            onChange={handleWords}
          >
            <option value={200}>200</option>
            <option value={300}>300</option>
            <option value={400}>400</option>
            <option value={500}>500</option>
            <option value={600}>600</option>
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
            Сгенерировать статью
          </Button>
        </Card>
        <Card maxW="100%" h="100%">
          <Text fontSize={'30px'} color={textColor} fontWeight="800" mb="10px">
            Ответ нейросети
          </Text>
          <Text fontSize={'16px'} color="gray.500" fontWeight="500" mb="30px">
            Наслаждайтесь вашей новой статьей!
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
                  : `Сначала сгенерируйте контент!`,
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
