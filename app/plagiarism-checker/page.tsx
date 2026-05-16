'use client';
/*eslint-disable*/

import Card from '@/components/card/Card';
import MessageBox from '@/components/MessageBox';
import {
  Button,
  Flex,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';

export default function HomePage() {
  // Состояния ввода
  const [content, setContent] = useState<string>('');
  // Сообщение с ответом
  const [outputCode, setOutputCode] = useState<string>('');
  // Состояние загрузки
  const [loading, setLoading] = useState<boolean>(false);

  // Стилевые константы
  const textColor = useColorModeValue('navy.700', 'white');
  const placeholderColor = useColorModeValue(
    { color: 'gray.500' },
    { color: 'whiteAlpha.600' },
  );
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const toast = useToast();

  // Основной обработчик API
  const handleCheckPlagiarism = async () => {
    if (!content) {
      alert('Пожалуйста, введите текст для проверки');
      return;
    }

    setLoading(true);
    setOutputCode('');

    const controller = new AbortController();
    const requestBody = { content };

    try {
      const response = await fetch('/api/plagiarismCheckerAPI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Ошибка запроса');

      const data = response.body;
      if (!data) throw new Error('Нет данных в ответе');

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        result += chunk;
        setOutputCode((prev) => prev + chunk);
      }

      copyToClipboard(result);
    } finally {
      setLoading(false);
    }
  };

  // Копирование в буфер обмена
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      const tempElement = document.createElement('textarea');
      tempElement.value = text;
      document.body.appendChild(tempElement);
      tempElement.select();
      document.execCommand('copy');
      document.body.removeChild(tempElement);
    });
  };

  // Обработчик изменения текста
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  return (
    <Flex
      width="100%"
      direction="column"
      position="relative"
      marginTop={{ base: '70px', md: '0px', xl: '0px' }}
    >
      <Flex
        marginX="auto"
        width={{ base: '100%', md: '100%', xl: '100%' }}
        maxWidth="100%"
        justify="center"
        direction={{ base: 'column', md: 'row' }}
      >
        {/* Блок ввода текста */}
        <Card
          minW={{ base: '100%', md: '40%', xl: '476px' }}
          maxW={{ base: '100%', md: '40%', xl: '476px' }}
          h="min-content"
          me={{ base: '0px', md: '20px' }}
          mb={{ base: '20px', md: '0px' }}
        >
          <Text fontSize="3xl" color={textColor} fontWeight="800" mb="2">
            Текст для проверки
          </Text>
          <Text fontSize="md" color="gray.500" mb="6">
            Введите текст, который нужно проверить на плагиат:
          </Text>

          <Textarea
            border="1px solid"
            borderRadius="md"
            borderColor={borderColor}
            padding="4"
            minHeight="324px"
            fontWeight="500"
            _focus={{ borderColor: 'none' }}
            color={textColor}
            placeholder="Введите ваш текст здесь..."
            _placeholder={placeholderColor}
            onChange={handleTextChange}
          />

          <Button
            marginTop="6"
            paddingY="5"
            fontSize="md"
            variant="primary"
            borderRadius="full"
            width="full"
            height="14"
            onClick={handleCheckPlagiarism}
            isLoading={loading}
            _hover={{
              boxShadow: '0px 21px 27px -10px rgba(96, 60, 255, 0.48)',
              bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)',
            }}
          >
            Проверить на плагиат
          </Button>
        </Card>

        {/* Блок результатов */}
        <Card width="full">
          <Text fontSize="3xl" color={textColor} fontWeight="800" mb="2">
            Результат проверки
          </Text>
          <Text fontSize="md" color="gray.500" mb="6">
            Результат проверки текста на плагиат:
          </Text>

          <MessageBox output={outputCode} />

          <Button
            variant="outline"
            borderColor={borderColor}
            borderRadius="full"
            maxWidth="48"
            marginLeft="auto"
            fontSize="md"
            width={{ base: '300px', md: '420px' }}
            height="14"
            onClick={() => {
              if (outputCode) {
                copyToClipboard(outputCode);
                toast({
                  title: 'Текст успешно скопирован!',
                  status: 'success',
                  position: 'top',
                  isClosable: true,
                });
              }
            }}
          >
            Скопировать
          </Button>
        </Card>
      </Flex>
    </Flex>
  );
}
