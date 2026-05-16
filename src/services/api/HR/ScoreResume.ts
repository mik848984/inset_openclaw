import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources';
import OpenAI from 'openai';
import { ResumeHrScore } from '@/models/resumeHrScore';
import { chunkArray } from '@/utils/chunkArray';
import { IHrSearch } from '@/models/hrSearch';
import { Resume } from '@/models/resume';

const client = new OpenAI({
  baseURL: 'https://api.deepinfra.com/v1/openai',
  apiKey: 'UHHqxwr7uoNCRGcwBx0Jy9uz7k4tPYjG',
});

export class ScoreResume {
  async getScore(hrPrompt: string, resume: string) {
    const tools: ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'get_relevance_resume',
          description:
            'Gets a number from 0 to 1, indicating the relevance of the resume to the description of which candidate they are looking for and the reason why the candidate is not suitable.',
          parameters: {
            type: 'object',
            properties: {
              score: {
                type: 'number',
                description:
                  'The number from 0 to 1, indicating the relevance of the resume to the description of which candidate is being searched for',
              },
              reason: {
                type: 'string',
                description:
                  'Explains his verdict on the candidate, the verdict should be detailed in the form of a list, use smiles ✔️ and ❌',
              },
            },
            required: ['score', 'reason'],
          },
        },
      },
    ];

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content:
          'Оцени резюме по таким критериям, постарайся дать подробный и структурированный и отформатированный ответ. Обязательно используй tools!: ' +
          hrPrompt,
      },
      { role: 'user', content: 'Резюме кандидата: ' + resume },
      {
        role: 'user',
        content: `Пиши на русском! 
          Примерный формат:
✔️ Плюсы:
- Указан опыт работы с Rust, хотя и без детализации.
- Кандидат имеет высшее образование в области программной инженерии.
❌ Минусы:
- Основной опыт и указанные проекты связаны с C#, что не соответствует требованиям вакансии.
- Отсутствует указание коммерческого опыта в Rust (требуется 3+ года).
- Не указан опыт работы с Actix, Tokio, MongoDB, PostgreSQL, Redis, что является ключевым требованием.
- Уровень английского (B1) может быть недостаточным для эффективной работы в команде.
- Указан широкий спектр технологий, что может говорить об отсутствии глубокой специализации в Rust.

Так же, прими во внимание:

Не нужно экономить токены.
Пиши развернуто.
Соответствие опыта заявленной должности.
Чёткость формулировок и активный язык.
Конкретика достижений, использование метрик.
Ключевые компетенции и навыки.
Насколько явно и обоснованно представлены ключевые профессиональные навыки.
Присутствуют ли релевантные soft skills и tech skills.
          `,
      },
    ];

    const response = await client.chat.completions.create({
      model: 'google/gemma-3-27b-it',
      messages,
      tools,
      tool_choice: 'required',
    });

    console.log(response.choices[0].message);
    const tool_calls = response.choices[0].message.tool_calls!;

    return JSON.parse(tool_calls[0].function.arguments);
  }

  async getBestScore(hrPrompt: string, resume: string) {
    const tools: ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'get_relevance_resume',
          description:
            'Gets a number from 0 to 1, indicating the relevance of the resume to the description of which candidate they are looking for and the reason why the candidate is not suitable.',
          parameters: {
            type: 'object',
            properties: {
              score: {
                type: 'number',
                description:
                  'The number from 0 to 1, indicating the relevance of the resume to the description of which candidate is being searched for',
              },
              reason: {
                type: 'string',
                description:
                  'Explains his verdict on the candidate, the verdict should be detailed in the form of a list, use smiles ✔️ and ❌',
              },
            },
            required: ['score', 'reason'],
          },
        },
      },
    ];

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content:
          'Оцени резюме по таким критериям, постарайся дать подробный и структурированный и отформатированный ответ,  Обязательно используй tools!: ' +
          hrPrompt,
      },
      { role: 'user', content: 'Резюме кандидата: ' + resume },
    ];

    const response = await client.chat.completions.create({
      model: 'google/gemma-3-27b-it',
      messages,
      tools,
      tool_choice: 'required',
    });

    console.log(response.choices[0].message);
    const tool_calls = response.choices[0].message.tool_calls!;

    return JSON.parse(tool_calls[0].function.arguments);
  }

  async evaluteScoreHrSearchItem(hrSearchItem: IHrSearch) {
    const hrSearchItemId = hrSearchItem.id;

    console.log(
      `\n--- Начинаем обработку поискового запроса (hrSearchItem ID): ${hrSearchItemId} ---`,
    );

    try {
      console.log(`[${hrSearchItemId}] Ищем неполные оценки резюме...`);
      const incompleteScoresWithResumes = await ResumeHrScore.find({
        isComplete: false,
        hrSearch: hrSearchItemId,
      })
        .populate('resume')
        .exec();

      console.log(
        `[${hrSearchItemId}] Найдено ${incompleteScoresWithResumes.length} неполных оценок для обработки.`,
      );

      if (incompleteScoresWithResumes.length === 0) {
        console.log(
          `Нет неполных оценок для обработки для этого запроса. Переходим к следующему`,
        );
        return;
      }

      const chunkSize = 150;
      const chunks = chunkArray(incompleteScoresWithResumes, chunkSize);
      console.log(
        `Данные разбиты на ${chunks.length} частей по ~${chunkSize} элементов`,
      );

      const successesItems = [];

      console.log(`Начинаем обработку частей...`);
      for (let i = 0; i < chunks.length; i++) {
        const items = chunks[i];
        console.log(
          `[${new Date().toISOString()}] [${hrSearchItemId}] Обрабатываем часть ${i + 1} из ${chunks.length} (${items.length} элементов)...`,
        );

        const resolvedTasks = await Promise.allSettled(
          items.map(async (item) => {
            const itemId = item.id;

            if (!item.resume) {
              console.warn(
                `[${new Date().toISOString()}] [${hrSearchItemId}] [${itemId}] WARN: Элемент оценки не имеет связанного резюме. Пропускаем.`,
              );
              throw new Error(`Resume is null for item ID ${itemId}`);
            }

            try {
              const { score, reason } = await this.getScore(
                hrSearchItem.initialQuery,
                item.resume.text,
              );
              return { score, reason, id: itemId };
            } catch (error: any) {
              console.error(
                `[${new Date().toISOString()}] [${hrSearchItemId}] [${itemId}] ERROR: Ошибка при генерации оценки: ${error.message}`,
              );
              throw error;
            }
          }),
        );

        const chunkSuccesses = resolvedTasks
          .filter((promise) => promise.status === 'fulfilled')
          .map((promise: any) => promise.value);

        const chunkFailures = resolvedTasks.filter(
          (promise) => promise.status === 'rejected',
        );

        console.log(
          `Часть ${i + 1} обработана. Успешно: ${chunkSuccesses.length}, Неудачно: ${chunkFailures.length}.`,
        );

        successesItems.push(...chunkSuccesses);

        console.log(
          `[${new Date().toISOString()}] [${hrSearchItemId}] Обработка всех частей завершена. Всего успешно обработано элементов для обновления: ${successesItems.length}.`,
        );

        if (successesItems.length > 0) {
          const bulkOperations = successesItems.map((updateData) => ({
            updateOne: {
              filter: { _id: updateData.id },
              update: {
                $set: {
                  score: updateData.score,
                  reason: updateData.reason,
                  isComplete: true,
                },
              },
            },
          }));

          console.log(
            `[${new Date().toISOString()}] [${hrSearchItemId}] Выполнение пакетного обновления...`,
          );

          await ResumeHrScore.bulkWrite(bulkOperations);

          console.log(
            `[${new Date().toISOString()}] [${hrSearchItemId}] Пакетное обновление завершено.`,
          );
        } else {
          console.log(
            `[${new Date().toISOString()}] [${hrSearchItemId}] Нет успешно обработанных элементов для пакетного обновления.`,
          );
        }

        console.log(
          `--- Обработка поискового запроса (hrSearchItem ID): ${hrSearchItemId} завершена ---`,
        );
      }
    } catch (error: any) {
      console.error(
        `[${new Date().toISOString()}] [${hrSearchItemId}] FATAL ERROR: Необработанная ошибка при обработке hrSearchItem: ${error.message}`,
        error,
      );
    }
  }

  async bestResumeEvalute(resumesScore: any[], filterQuery: string) {
    const chunks = chunkArray(resumesScore, 50);

    const successItems = [];
    for (let i = 0; i < chunks.length; i++) {
      const items = chunks[i];

      const resolvedTasks = await Promise.allSettled(
        items.map(async (item) => {
          const itemId = item.id;

          if (!item.resume) {
            console.warn(
              ` [${itemId}] WARN: Элемент оценки не имеет связанного резюме. Пропускаем.`,
            );
            throw new Error(`Resume is null for item ID ${itemId}`);
          }

          try {
            const { score, reason } = await this.getBestScore(
              filterQuery,
              item.resume.text,
            );

            return {
              ...item._doc,
              initialScore: item._doc.score,
              score,
              reason,
            };
          } catch (error: any) {
            console.error(
              `[${itemId}] ERROR: Ошибка при генерации оценки: ${error.message}`,
            );
            throw error;
          }
        }),
      );

      const chunkSuccesses = resolvedTasks
        .filter((promise) => promise.status === 'fulfilled')
        .map((promise: any) => promise.value);

      successItems.push(...chunkSuccesses);
    }

    return successItems;
  }

  async removeHrScores() {
    const brokenLinks = await ResumeHrScore.aggregate([
      {
        $lookup: {
          from: Resume.collection.name,
          localField: 'resume',
          foreignField: '_id',
          as: 'matchedResumes',
        },
      },
      {
        $match: { matchedResumes: { $eq: [] } },
      },
      { $project: { _id: 1 } },
    ]);

    const idsToDelete = brokenLinks.map((doc) => doc._id);

    if (idsToDelete.length > 0) {
      console.log(
        `Найдено ${idsToDelete.length} записей ResumeHrScore с неверными ссылками на Resume.`,
      );

      const deleteResult = await ResumeHrScore.deleteMany({
        _id: { $in: idsToDelete },
      });

      console.log(`Успешно удалено ${deleteResult.deletedCount} записей.`);
    } else {
      console.log(
        'Записи ResumeHrScore с неверными ссылками на Resume не найдены.',
      );
    }

    console.log('Процесс очистки завершен.');
  }
}

export const scoreResume = new ScoreResume();
