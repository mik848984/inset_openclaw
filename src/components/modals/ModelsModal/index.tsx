import { Divider, Flex, Grid, Heading, IconButton } from '@chakra-ui/react';
import React, { useContext } from 'react';
import { CloseIcon } from '@chakra-ui/icons';
import { ChatAiContext } from '@/contexts/ChatAiContext';
import ModelsCard from '@/components/modals/ModelsModal/ModelsCard';

import Modal from '../Modal/Modal';

interface IProps {
  open: boolean;
  onClose: () => void;
}

function ModelsModal({ open, onClose }: IProps) {
  const { model, setModel } = useContext(ChatAiContext);

  return (
    <Modal
      open={open}
      onClose={onClose}
      headerProps={
        <>
          <Grid p="4" templateColumns="1fr 3.5fr 1fr">
            <div></div>
            <Flex align="center" textAlign="center" justify="center">
              <Heading size="md">Выбор модели</Heading>
            </Flex>
            <Flex direction="row-reverse">
              <IconButton size="lg" aria-label="Close Model" onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Flex>
          </Grid>
          <Divider />
        </>
      }
      contentProps={
        <Grid p="16px" gap="16px" overflow="auto">
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
            title="Deepseek V3.2"
            isChecked={model === 'deepseek-ai/DeepSeek-V3.2-Exp'}
            onClick={() => setModel!('deepseek-ai/DeepSeek-V3.2-Exp')}
            power={90}
            speed={60}
          />
          <ModelsCard
            title="Gemini-2.5-pro-thinking"
            isChecked={model === 'gemini-2.5-pro'}
            onClick={() => setModel!('gemini-2.5-pro')}
            power={96}
            speed={50}
            attachments
          />
          <ModelsCard
            title="Gemini-2.5-flash-thinking"
            isChecked={model === 'gemini-2.5-flash'}
            onClick={() => setModel!('gemini-2.5-flash')}
            power={89}
            speed={70}
            attachments
          />
          <ModelsCard
            title="Gemini-2.5-flash-lite"
            isChecked={model === 'gemini-2.5-flash-lite'}
            onClick={() => setModel!('gemini-2.5-flash-lite')}
            power={75}
            speed={70}
            attachments
          />
          <ModelsCard
            title="DeepSeek-R1"
            isChecked={model === 'deepseek-ai/DeepSeek-R1'}
            onClick={() => setModel!('deepseek-ai/DeepSeek-R1')}
            power={70}
            speed={30}
          />

          <ModelsCard
            title="DeepSeek-V3"
            isChecked={model === 'deepseek-ai/DeepSeek-V3'}
            onClick={() => setModel!('deepseek-ai/DeepSeek-V3')}
            power={65}
            speed={50}
          />

          <ModelsCard
            title="Llama-3.3-70B"
            isChecked={model === 'meta-llama/Llama-3.3-70B-Instruct-Turbo'}
            onClick={() => setModel!('meta-llama/Llama-3.3-70B-Instruct-Turbo')}
            power={55}
            speed={60}
          />
          <ModelsCard
            title="Ministral Small"
            isChecked={model === 'mistral-small'}
            onClick={() => setModel!('mistral-small')}
            power={45}
            speed={70}
          />
        </Grid>
      }
    ></Modal>
  );
}

export default ModelsModal;
