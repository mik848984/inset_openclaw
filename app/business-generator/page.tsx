'use client';
/*eslint-disable*/

import Card from '@/components/card/Card';
import MessageBox from '@/components/MessageBox';
import { BusinessGeneratorBody, OpenAIModel } from '@/types/types';
import {
  Button,
  Flex,
  FormLabel,
  Select,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';

export default function Home() {
  // *** Если вы используете ..env.local переменную для вашего API ключа, что мы рекомендуем, используйте переменную apiKey, закомментированную ниже
  // Состояния ввода
  const [topic, setTopic] = useState<
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
  const [productType, setProductType] = useState<
    '' | 'Physical' | 'Digital' | 'Service'
  >('');
  const [budget, setBudget] = useState<
    | ''
    | 'Under $500'
    | '$500-$1000'
    | '$1000-$5000'
    | '$5000-$20,000'
    | '$20,000+'
  >('');
  // Сообщение ответа
  const [outputCode, setOutputCode] = useState<string>('');
  // Модель ChatGPT
  const [model, setModel] = useState<OpenAIModel>('gpt-3.5-turbo');
  // Состояние загрузки
  const [loading, setLoading] = useState<boolean>(false);
  // API Ключ
  // const [apiKey, setApiKey] = useState<string>();
  const textColor = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const toast = useToast();

  // -------------- Главный обработчик API --------------
  const handleTranslate = async () => {
    if (!topic) {
      alert('Пожалуйста, выберите тему.');
      return;
    }

    if (!productType) {
      alert('Пожалуйста, выберите тип продукта.');
      return;
    }

    if (!budget) {
      alert('Пожалуйста, выберите бюджет.');
      return;
    }

    setLoading(true);
    setOutputCode('');

    const controller = new AbortController();

    const body = {
      topic,
      productType,
      budget,
    };

    // -------------- Fetch --------------
    const response = await fetch('/api/businessAPI', {
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
        'Произошла ошибка при запросе к API. Убедитесь, что используете валидный API ключ.',
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
  const handleTopic = (Event: any) => {
    setTopic(Event.target.value);
  };
  const handleProductType = (Event: any) => {
    setProductType(Event.target.value);
  };
  const handleBudget = (Event: any) => {
    setBudget(Event.target.value);
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
            Настройки идеи
          </Text>
          <Text fontSize={'16px'} color="gray.500" fontWeight="500" mb="30px">
            Выберите желаемые параметры для вашей бизнес-идеи!
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
            Выберите тему
          </FormLabel>
          <Select
            border="1px solid"
            borderRadius={'10px'}
            borderColor={borderColor}
            h="60px"
            id="topic"
            placeholder="Выберите тему"
            _focus={{ borderColor: 'none' }}
            mb="28px"
            onChange={handleTopic}
          >
            <option value="Art and Entertainment">
              Искусство и развлечения
            </option>
            <option value="Business Equipment and Supplies">
              Оборудование и расходные материалы для бизнеса
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
            <option value="Pet supplies">Товары для животных</option>
            <option value="Sports and Recreation">Спорт и отдых</option>
            <option value="Toys and Games">Игрушки и игры</option>
            <option value="Travel & Hospitality">
              Туризм и гостиничный бизнес
            </option>
          </Select>
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
            Выберите тип продукта
          </FormLabel>
          <Select
            border="1px solid"
            borderRadius={'10px'}
            borderColor={borderColor}
            h="60px"
            id="topic"
            placeholder="Выберите тип продукта"
            _focus={{ borderColor: 'none' }}
            mb="28px"
            onChange={handleProductType}
          >
            <option value="Physical">Физический</option>
            <option value="Digital">Цифровой</option>
            <option value="Service">Услуга</option>
          </Select>
          <FormLabel
            display="flex"
            ms="10px"
            htmlFor={'budget'}
            fontSize="md"
            color={textColor}
            letterSpacing="0px"
            fontWeight="bold"
            _hover={{ cursor: 'pointer' }}
          >
            Выберите бюджет
          </FormLabel>
          <Select
            border="1px solid"
            borderRadius={'10px'}
            borderColor={borderColor}
            h="60px"
            id="budget"
            placeholder="Выберите бюджет"
            _focus={{ borderColor: 'none' }}
            mb="28px"
            onChange={handleBudget}
          >
            <option value="Under $500">Менее 500$</option>
            <option value="$500-$1000">500$-1000$</option>
            <option value="$1000-$5000">1000$-5000$</option>
            <option value="$5000-$20,000">5000$-20,000$</option>
            <option value="$20,000+">20,000$+ </option>
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
            Сгенерировать бизнес-идею
          </Button>
        </Card>
        <Card maxW="100%" h="100%">
          <Text fontSize={'30px'} color={textColor} fontWeight="800" mb="10px">
            Ответ нейросети
          </Text>
          <Text fontSize={'16px'} color="gray.500" fontWeight="500" mb="30px">
            Наслаждайтесь вашей новой бизнес-идеей!
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
                  ? 'Текст успешно скопирован!'
                  : 'Сначала сгенерируйте контент!',
                position: 'top',
                status: outputCode ? 'success' : 'error', // у тебя тут был `error` строкой, а нужен статус
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
