'use client';
/*eslint-disable*/

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
import { OpenAIModel, DomainNameGeneratorBody } from '@/types/types';
import { useEffect, useState } from 'react';
import MessageBox from '@/components/MessageBox';

export default function Home() {
  // Состояния для ввода данных
  const [keywords, setKeywords] = useState<string>('');
  const [industry, setIndustry] = useState<
    | ''
    | 'Art and Entertainment'
    | 'Business Equipment and Supplies'
    | 'Clothing and Accessories'
    | 'Food and Drink'
    | 'Hardware and Automotive'
    | 'Health and Beauty'
    | 'Home and Garden'
    | 'Internet and Technology'
    | 'Pet supplies'
    | 'Sports and Recreation'
    | 'Toys and Games'
    | 'Travel & Hospitality'
  >('');
  // Сообщение ответа
  const [outputCode, setOutputCode] = useState<string>('');
  // Модель ChatGPT
  const [model, setModel] = useState<OpenAIModel>('gpt-3.5-turbo');
  // Состояние загрузки
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

  // -------------- Основной обработчик API --------------
  const handleTranslate = async () => {
    if (!keywords) {
      alert('Пожалуйста, введите ключевые слова для домена.');
      return;
    }

    if (!industry) {
      alert('Пожалуйста, выберите индустрию вашего бизнеса.');
      return;
    }

    setLoading(true);
    setOutputCode('');

    const controller = new AbortController();

    const body = {
      keywords,
      industry,
    };

    // -------------- Fetch --------------
    const response = await fetch('/api/domainNameGeneratorAPI', {
      method: 'POST',
      headers: {
        'Content-Keywords': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      setLoading(false);
      alert(
        'Произошла ошибка при получении данных от API. Убедитесь, что используете корректный API ключ.',
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

  // -------------- Копировать ответ --------------
  const copyToClipboard = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  // -------------- Обработчики ввода значений --------------
  const handleKeywords = (Event: any) => {
    setKeywords(Event.target.value);
  };
  const handleIndustry = (Event: any) => {
    setIndustry(Event.target.value);
  };

  // Initializing apiKey with localStorage value
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
            Детали домена
          </Text>
          <Text fontSize={'16px'} color="gray.500" fontWeight="500" mb="30px">
            Введите детали вашего домена
          </Text>
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
            Ключевые слова
          </FormLabel>
          <Input
            color={textColor}
            border="1px solid"
            borderRadius={'10px'}
            borderColor={borderColor}
            h="60px"
            id="title"
            fontWeight="500"
            placeholder="Введите ключевые слова для вашего домена"
            _placeholder={placeholderColor}
            _focus={{ borderColor: 'none' }}
            mb="28px"
            onChange={handleKeywords}
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
            Выберите индустрию вашего бизнеса
          </FormLabel>
          <Select
            border="1px solid"
            borderRadius={'10px'}
            borderColor={borderColor}
            h="60px"
            id="lang"
            placeholder="Выберите индустрию бизнеса"
            _focus={{ borderColor: 'none' }}
            mb="28px"
            onChange={handleIndustry}
          >
            <option value="Art and Entertainment">
              Искусство и развлечения
            </option>
            <option value="Business Equipment and Supplies">
              Оборудование и материалы для бизнеса
            </option>
            <option value="Clothing and Accessories">
              Одежда и аксессуары
            </option>
            <option value="Food and Drink">Еда и напитки</option>
            <option value="Hardware and Automotive">
              Оборудование и автомобили
            </option>
            <option value="Health and Beauty">Здоровье и красота</option>
            <option value="Home and Garden">Дом и сад</option>
            <option value="Internet and Technology">
              Интернет и технологии
            </option>
            <option value="Pet supplies">Товары для питомцев</option>
            <option value="Sports and Recreation">Спорт и отдых</option>
            <option value="Toys and Games">Игрушки и игры</option>
            <option value="Travel & Hospitality">
              Туризм и гостеприимство
            </option>
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
            Сгенерировать доменные имена
          </Button>
        </Card>
        <Card maxW="100%" h="100%">
          <Text fontSize={'30px'} color={textColor} fontWeight="800" mb="10px">
            Ответ нейросети
          </Text>
          <Text fontSize={'16px'} color="gray.500" fontWeight="500" mb="30px">
            Наслаждайтесь вашими новыми доменными именами!
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
                  ? `Текст успешно скопирован!`
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
