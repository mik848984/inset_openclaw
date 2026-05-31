'use client';
/*eslint-disable*/

import Card from '@/components/card/Card';
import MessageBox from '@/components/MessageBox';
import { NameGeneratorBody, OpenAIModel } from '@/types/types';
import {
  Button,
  Flex,
  FormLabel,
  Input,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';

export default function NameGeneratorClient() {
  const [topic, setTopic] = useState<string>('');
  const [productType, setProductType] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [model, setModel] = useState<OpenAIModel>('gpt-3.5-turbo');
  const [loading, setLoading] = useState<boolean>(false);
  const textColor = useColorModeValue('navy.700', 'white');
  const placeholderColor = useColorModeValue(
    { color: 'gray.500' },
    { color: 'whiteAlpha.600' },
  );
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const toast = useToast();

  const handleTranslate = async () => {
    if (!productType) {
      alert('Пожалуйста, выберите тип продукта.');
      return;
    }
    if (!topic) {
      alert('Пожалуйста, введите тему.');
      return;
    }

    setLoading(true);
    setOutputCode('');

    const controller = new AbortController();
    const body = {
      topic,
      productType,
    };

    const response = await fetch('/api/nameGeneratorAPI', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      setLoading(false);
      alert(
        'Произошла ошибка при обращении к API. Убедитесь, что используете действительный API-ключ.',
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

  const copyToClipboard = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  const handleTopic = (Event: any) => setTopic(Event.target.value);
  const handleProductType = (Event: any) => setProductType(Event.target.value);

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
            Детали продукта
          </Text>
          <Text fontSize={'16px'} color="gray.500" fontWeight="500" mb="30px">
            На основе чего должно быть сгенерировано название продукта?
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
            placeholder="Введите тему..."
            _placeholder={placeholderColor}
            _focus={{ borderColor: 'none' }}
            mb="28px"
            onChange={handleTopic}
          />
          <FormLabel
            display="flex"
            ms="10px"
            htmlFor={'productType'}
            fontSize="md"
            color={textColor}
            letterSpacing="0px"
            fontWeight="bold"
            _hover={{ cursor: 'pointer' }}
          >
            Тип продукта
          </FormLabel>
          <Input
            color={textColor}
            border="1px solid"
            borderRadius={'10px'}
            borderColor={borderColor}
            h="60px"
            id="productType"
            fontWeight="500"
            placeholder="Введите тип продукта..."
            _placeholder={placeholderColor}
            _focus={{ borderColor: 'none' }}
            mb="28px"
            onChange={handleProductType}
          />
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
            Сгенерировать название продукта
          </Button>
        </Card>
        <Card maxW="100%" h="100%">
          <Text fontSize={'30px'} color={textColor} fontWeight="800" mb="10px">
            Ответ нейросети
          </Text>
          <Text fontSize={'16px'} color="gray.500" fontWeight="500" mb="30px">
            Наслаждайтесь новым названием продукта!
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
                  ? 'Название продукта успешно скопировано!'
                  : 'Сначала сгенерируйте название!',
                position: 'top',
                status: outputCode ? 'success' : 'error',
                isClosable: true,
              });
            }}
          >
            Cкопировать
          </Button>
        </Card>
      </Flex>
    </Flex>
  );
}
