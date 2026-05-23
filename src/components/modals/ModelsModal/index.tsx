import {
  Box,
  Flex,
  Grid,
  Heading,
  IconButton,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import React, { useContext } from 'react';
import { CloseIcon } from '@chakra-ui/icons';
import { ChatAiContext } from '@/contexts/ChatAiContext';
import ModelsCard from '@/components/modals/ModelsModal/ModelsCard';

import Modal from '../Modal/Modal';

interface IProps {
  open: boolean;
  onClose: () => void;
}

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

function ModelsModal({ open, onClose }: IProps) {
  const { model, setModel } = useContext(ChatAiContext);

  // ── iOS Liquid Glass header tokens ─────────────────────────────
  const headerGlassBg = useColorModeValue(
    'rgba(255,255,255,0.72)',
    'rgba(12,16,30,0.72)',
  );
  const borderSubtle = useColorModeValue(
    'rgba(0,0,0,0.07)',
    'rgba(255,255,255,0.08)',
  );
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textSecondary = useColorModeValue(
    '#6e6e73',
    'rgba(245,245,247,0.65)',
  );
  const closeBg = useColorModeValue(
    'rgba(0,0,0,0.05)',
    'rgba(255,255,255,0.08)',
  );
  const closeHoverBg = useColorModeValue(
    'rgba(0,0,0,0.09)',
    'rgba(255,255,255,0.14)',
  );
  const closeColor = useColorModeValue('#1d1d1f', '#f5f5f7');

  return (
    <Modal
      open={open}
      onClose={onClose}
      headerProps={<Box height="0" minHeight="0" overflow="hidden" />}
      contentProps={
        <Box
          width="100%"
          maxWidth="100%"
          minWidth={0}
          fontFamily={FONT_APPLE_TEXT}
        >
          {/* ── Sticky iOS-style Liquid Glass header ────────────── */}
          <Box
            position="sticky"
            top="0"
            zIndex={3}
            bg={headerGlassBg}
            backdropFilter="blur(24px) saturate(180%)"
            borderBottom="1px solid"
            borderColor={borderSubtle}
            px={{ base: '14px', md: '24px' }}
            py={{ base: '12px', md: '14px' }}
            sx={{
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              // Subtle top-light highlight on the header bar
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: '0',
                pointerEvents: 'none',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 60%)',
                opacity: 0.85,
                zIndex: 0,
              },
              '& > *': { position: 'relative', zIndex: 1 },
            }}
          >
            <Grid
              templateColumns="1fr auto"
              alignItems="center"
              gap="12px"
              width="100%"
              maxWidth="100%"
              minWidth={0}
            >
              <Flex direction="column" gap="2px" minWidth={0}>
                <Heading
                  fontFamily={FONT_APPLE_DISPLAY}
                  fontSize={{ base: '18px', md: '21px' }}
                  fontWeight="600"
                  letterSpacing="-0.4px"
                  lineHeight="1.2"
                  color={textPrimary}
                  noOfLines={1}
                >
                  Выбор модели
                </Heading>
                <Text
                  fontSize={{ base: '12px', md: '13px' }}
                  fontWeight="400"
                  color={textSecondary}
                  letterSpacing="-0.15px"
                  lineHeight="1.3"
                  noOfLines={1}
                >
                  Качество и скорость зависят от модели
                </Text>
              </Flex>
              <IconButton
                aria-label="Закрыть"
                onClick={onClose}
                variant="ghost"
                bg={closeBg}
                borderRadius="9999px"
                w="30px"
                h="30px"
                minW="30px"
                flexShrink={0}
                _hover={{ bg: closeHoverBg }}
                _active={{ transform: 'scale(0.94)' }}
                transition="background 0.14s ease, transform 0.12s ease"
              >
                <CloseIcon w="9px" h="9px" color={closeColor} />
              </IconButton>
            </Grid>
          </Box>

          {/* ── Scrollable models list ───────────────────────────── */}
          <Flex
            direction="column"
            gap={{ base: '8px', md: '10px' }}
            px={{ base: '12px', md: '16px' }}
            pt={{ base: '12px', md: '14px' }}
            pb={{
              base: 'calc(20px + env(safe-area-inset-bottom))',
              md: '24px',
            }}
            width="100%"
            maxWidth="100%"
            minWidth={0}
          >
            <ModelsCard
              title="ChatGPT (GPT-OSS)"
              isChecked={model === 'openai/gpt-oss-120b'}
              onClick={() => setModel!('openai/gpt-oss-120b')}
              power={100}
              speed={50}
            />
            <ModelsCard
              title="Microsoft Phi 4"
              isChecked={model === 'microsoft/phi-4'}
              onClick={() => setModel!('microsoft/phi-4')}
              power={80}
              speed={70}
            />
            <ModelsCard
              title="DeepSeek V3.2"
              isChecked={model === 'deepseek-ai/DeepSeek-V3.2-Exp'}
              onClick={() => setModel!('deepseek-ai/DeepSeek-V3.2-Exp')}
              power={90}
              speed={60}
            />
            <ModelsCard
              title="DeepSeek V4 Pro"
              isChecked={model === 'deepseek-ai/DeepSeek-V4-Pro'}
              onClick={() => setModel!('deepseek-ai/DeepSeek-V4-Pro')}
              power={96}
              speed={55}
            />
            <ModelsCard
              title="Qwen 3.6 35B"
              isChecked={model === 'Qwen/Qwen3.6-35B-A3B'}
              onClick={() => setModel!('Qwen/Qwen3.6-35B-A3B')}
              power={88}
              speed={70}
            />
            <ModelsCard
              title="Gemini 2.5 Pro"
              isChecked={model === 'gemini-2.5-pro'}
              onClick={() => setModel!('gemini-2.5-pro')}
              power={96}
              speed={50}
              attachments
            />
            <ModelsCard
              title="Gemini 2.5 Flash"
              isChecked={model === 'gemini-2.5-flash'}
              onClick={() => setModel!('gemini-2.5-flash')}
              power={89}
              speed={70}
              attachments
            />
            <ModelsCard
              title="Gemini 2.5 Flash Lite"
              isChecked={model === 'gemini-2.5-flash-lite'}
              onClick={() => setModel!('gemini-2.5-flash-lite')}
              power={75}
              speed={70}
              attachments
            />
            <ModelsCard
              title="DeepSeek R1"
              isChecked={model === 'deepseek-ai/DeepSeek-R1'}
              onClick={() => setModel!('deepseek-ai/DeepSeek-R1')}
              power={70}
              speed={30}
            />
            <ModelsCard
              title="DeepSeek V3"
              isChecked={model === 'deepseek-ai/DeepSeek-V3'}
              onClick={() => setModel!('deepseek-ai/DeepSeek-V3')}
              power={65}
              speed={50}
            />
            <ModelsCard
              title="Llama 3.3 70B"
              isChecked={model === 'meta-llama/Llama-3.3-70B-Instruct-Turbo'}
              onClick={() => setModel!('meta-llama/Llama-3.3-70B-Instruct-Turbo')}
              power={55}
              speed={60}
            />
            <ModelsCard
              title="Mistral Small"
              isChecked={model === 'mistral-small'}
              onClick={() => setModel!('mistral-small')}
              power={45}
              speed={70}
            />
          </Flex>
        </Box>
      }
    ></Modal>
  );
}

export default ModelsModal;
