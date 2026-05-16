/*eslint-disable*/
'use client';
import Card from '@/components/card/Card';
import MessageBox from '@/components/MessageBox';
import {
  Button,
  Flex,
  FormLabel,
  Select,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';

export default function Home() {
  const [paragraphs, setParagraphs] = useState<3 | 4 | 5>(3);
  const [essayType, setEssayType] = useState<
    | ''
    | 'Argumentative'
    | 'Classic'
    | 'Persuasive'
    | 'Memoir'
    | 'Critique'
    | 'Compare/Contrast'
  >('');
  const [topic, setTopic] = useState<string>('');
  // Response message
  const [outputCode, setOutputCode] = useState<string>('');
  // ChatGPT model
  // Loading state
  const [loading, setLoading] = useState<boolean>(false);
  // API Key
  // const [apiKey, setApiKey] = useState<string>();
  const textColor = useColorModeValue('navy.700', 'white');
  const placeholderColor = useColorModeValue(
    { color: 'gray.500' },
    { color: 'whiteAlpha.600' },
  );
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const toast = useToast();

  // -------------- Main API Handler --------------
  const handleTranslate = async () => {
    if (!topic) {
      alert('Пожалуйста, введите тему вашего сочинения.');
      return;
    }
    if (!paragraphs) {
      alert('Пожалуйста, выберите количество параграфов.');
      return;
    }
    if (!essayType) {
      alert('Пожалуйста, выберите тип сочинения.');
      return;
    }

    setLoading(true);
    setOutputCode('');

    const controller = new AbortController();

    const body = {
      topic,
      paragraphs,
      essayType,
    };

    // -------------- Fetch --------------
    const response = await fetch('/api/essayAPI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      setLoading(false);
      if (response) {
        alert(
          'Произошла ошибка при получении данных с API. Убедитесь, что вы используете действительный API-ключ.',
        );
      }
      return;
    }

    const data = response.body;

    if (!data) {
      setLoading(false);
      alert('Что-то пошло не так.');
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let code = '';

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      code += chunkValue;

      setOutputCode((prevCode) => prevCode + chunkValue);
    }

    setLoading(false);
    copyToClipboard(code);
  };

  // -------------- Copy Response --------------
  const copyToClipboard = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  // -------------- Input Value Handler --------------
  const handleChange = (Event: any) => {
    setTopic(Event.target.value);
  };
  const handleChangeParagraphs = (Event: any) => {
    setParagraphs(Event.target.value);
  };
  const handleChangeEssayType = (Event: any) => {
    setEssayType(Event.target.value);
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
          <Text fontSize={'16px'} color="gray.500" fontWeight="500" mb="30px">
            О чем ваше сочинение?
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
            placeholder="Напишите здесь свою тему..."
            _placeholder={placeholderColor}
            onChange={handleChange}
          />
          <FormLabel
            display="flex"
            ms="10px"
            htmlFor={'parag'}
            fontSize="md"
            color={textColor}
            letterSpacing="0px"
            fontWeight="bold"
            _hover={{ cursor: 'pointer' }}
          >
            Количество параграфов
          </FormLabel>
          <Select
            border="1px solid"
            borderRadius={'10px'}
            borderColor={borderColor}
            h="60px"
            id="type"
            placeholder="Выберите вариант"
            _focus={{ borderColor: 'none' }}
            mb="28px"
            onChange={handleChangeParagraphs}
          >
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
            <option value={8}>8</option>
            <option value={9}>9</option>
            <option value={10}>10</option>
            <option value={11}>11</option>
            <option value={12}>12</option>
          </Select>
          <FormLabel
            display="flex"
            ms="10px"
            htmlFor={'type'}
            fontSize="md"
            color={textColor}
            letterSpacing="0px"
            fontWeight="bold"
            _hover={{ cursor: 'pointer' }}
          >
            Выберите тип вашего эссе
          </FormLabel>
          <Select
            border="1px solid"
            borderRadius={'10px'}
            borderColor={borderColor}
            h="60px"
            id="type"
            placeholder="Выберите вариант"
            _focus={{ borderColor: 'none' }}
            mb="28px"
            onChange={handleChangeEssayType}
          >
            <option value="Argumentative">Аргументативный</option>
            <option value="Classic">Классический</option>
            <option value="Compare/Contrast">Сравнение/контраст</option>
            <option value="Persuasive">Убедительный</option>
            <option value="Critique">Критика</option>
            <option value="Memoir">Мемуары</option>
          </Select>

          <Button
            py="20px"
            px="16px"
            fontSize="md"
            variant="primary"
            borderRadius="45px"
            w={{ base: '100%' }}
            h="54px"
            onClick={handleTranslate}
            isLoading={loading}
            _hover={{
              boxShadow:
                '0px 21px 27px -10px rgba(96, 60, 255, 0.48) !important',
              bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%) !important',
              _disabled: {
                bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)',
              },
            }}
          >
            Сгенерировать сочинение
          </Button>
        </Card>
        <Card maxW="100%" h="100%">
          <Text fontSize={'30px'} color={textColor} fontWeight="800" mb="10px">
            Ответ нейросети
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
                  ? `Сочинение успешно скопировано!`
                  : `Сначала сгенерируйте сочинение!`,
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
