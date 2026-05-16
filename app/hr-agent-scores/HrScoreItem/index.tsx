import Card from '@/components/card/Card';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Tag,
  TagLabel,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { markdown } from '@/services/ui/MarkdownService';
import React, { useContext } from 'react';
import { hrServiceUI, IHrScoreUI } from '@/services/ui/HrService';
import { useRouter } from 'next/navigation';
import { ChatAiContext } from '@/contexts/ChatAiContext';
import { AvitoLogo, HHLogo } from '@/components/icons/Icons';
import { viewedItemsService } from '@/services/ui/ViewedItemsService';

function getColor(score: number) {
  if (score >= 0.65) {
    return 'green.400';
  }

  if (score >= 0.45) {
    return 'orange.400';
  }

  return 'red.500';
}

interface IProps {
  hrScore: IHrScoreUI;
  isView: boolean;
}

function HrScoreItem({ hrScore, isView }: IProps) {
  const textColor = useColorModeValue('gray.600', 'white');
  const router = useRouter();
  const { sendMessage, setMessages } = useContext(ChatAiContext);

  if (!hrScore.resume) return null;

  const isHH = hrScore.resume.systemId.includes('hh');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');

  return (
    <Card height="100%" opacity={isView ? 0.73 : 1}>
      {isView ? 'Резюме просмотрено' : null}
      <Box h="20px" />
      <Flex
        w="100%"
        justifyContent="space-between"
        flexDirection={{ base: 'column', md: 'row' }}
      >
        <Grid w="100%">
          <Flex gap="12px" w="100%">
            {isHH ? (
              <HHLogo w="28px" h="28px" />
            ) : (
              <AvitoLogo w="32px" h="32px" />
            )}
            <Heading size="md">{hrScore.resume.params.title}</Heading>
          </Flex>
          <Box height="12px" />
          <Text fontSize="14px" size="md" color={textColor}>
            Возраст: {hrScore.resume.params.age}
          </Text>
          <Text fontSize="14px" size="md" color={textColor}>
            Расположение: {hrScore.resume.params.area}
          </Text>
        </Grid>
        <Flex w="100%" flexDirection={{ base: 'row', md: 'row-reverse' }}>
          <Box mt={{ base: '12px', md: '0px' }}>
            <Tag
              color="white"
              size="lg"
              borderRadius="full"
              variant="solid"
              background={getColor(hrScore.score)}
            >
              <TagLabel>Совпадение {hrScore.score * 100}%</TagLabel>
            </Tag>
          </Box>
        </Flex>
      </Flex>
      <Box height="14px" />
      <Grid gap="4px" mt="12px" margin="0px !important">
        <Heading size="xs">Комментарий нейросети:</Heading>

        <Box fontSize="13px" mt="12px" class="reason" margin="0px !important">
          <Text
            color={textColor}
            dangerouslySetInnerHTML={{
              __html: markdown.markdownItWithPlugins.render(
                hrScore.reason.replaceAll('\\n', '\n').replaceAll('❌', '\n❌'),
              ),
            }}
          />
        </Box>
      </Grid>
      <Box height="12px" />
      <Grid gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="24px">
        <Button
          border="1px solid"
          borderColor={borderColor}
          borderRadius="full"
          onClick={() => {
            viewedItemsService.markAsViewed(
              `${hrServiceUI.currentHrSearch?._id}_${hrScore._id}`,
            );
          }}
          as="a"
          target="_blank"
          href={
            isHH
              ? `https://hh.ru/resume/${hrScore.resume.systemId.replaceAll('hh_', '')}`
              : `https://www.avito.ru/moskva/rezume/${hrScore.resume.systemId}`
          }
        >
          Открыть резюме
        </Button>
        <Button
          border="1px solid"
          borderColor={borderColor}
          borderRadius="full"
          onClick={() => {
            router.push('/chat');

            setMessages!([]);
            sendMessage!(`Вакансия: 

\`\`\`
${hrServiceUI.currentHrSearch?.initialQuery}
\`\`\`
 
Резюме кандидата:

\`\`\`
${hrScore.resume.text}
\`\`\`
Предложи свою помощь рекрутеру по анализу этого резюме и вакансии, подходит ли кандидат к вакансии?.
Используй таблицы и другие структурированные способы для ответов рекрутеру.
Будь краток и лаконичен.`);

            viewedItemsService.markAsViewed(
              `${hrServiceUI.currentHrSearch?._id}_${hrScore._id}`,
            );
          }}
        >
          Чат с резюме
        </Button>
      </Grid>
    </Card>
  );
}

export default HrScoreItem;
