import HrSearch, { HrSearchStatus } from '@/models/hrSearch';
import { Resume } from '@/models/resume';
import { ResumeHrScore } from '@/models/resumeHrScore';
import { ObjectId } from 'bson';
import { chunkArray } from '@/utils/chunkArray';
import { scoreResume } from '@/services/api/HR/ScoreResume';
import { hhService } from '@/services/api/HR/HH';
import { avitoService } from './HR/Avito';

class HrService {
  currentHrSearch: any = null;
  isProcessing = false;
  isProcessingEvaluate = false;

  async generateQueryTags(initialRequest: string, type: string) {
    return hhService.generateQueryTags(initialRequest);
  }

  async getSearchParams(initialRequest: string, type: string) {
    return hhService.getSearchParams(initialRequest);
  }

  async getResumes(queries: string[], type: string, params = {}) {
    if (type === 'avito') {
      return avitoService.getResumes(queries, params);
    }

    return hhService.getResumes(queries, params);
  }

  async findResumesStatus(
    systemIds: string[],
    hrSearchObjectId: ObjectId,
  ): Promise<any> {
    const existingResumes = await Resume.find(
      { systemId: { $in: systemIds } },
      { _id: 1, systemId: 1 },
    ).lean();

    const existingSystemIdSet = new Set(existingResumes.map((r) => r.systemId));

    const nonExistentSystemIds: string[] = systemIds.filter(
      (id) => !existingSystemIdSet.has(id),
    );

    const existingResumeIds = existingResumes.map((r) => r._id);

    if (existingResumeIds.length === 0) {
      return {
        resumesMissingScore: [],
        nonExistentSystemIds: nonExistentSystemIds, // Все, что не нашлось в Resume
      };
    }

    const scoredResumeEntries = await ResumeHrScore.find(
      {
        resume: { $in: existingResumeIds },
        hrSearch: hrSearchObjectId,
      },
      { resume: 1 },
    ).lean();

    const scoredResumeIdSet = new Set(
      scoredResumeEntries.map((entry) => entry.resume.toString()),
    );

    const resumesMissingScore: string[] = existingResumes
      .filter((resume) => !scoredResumeIdSet.has(resume._id.toString()))
      .map((resume) => resume.systemId);

    return {
      resumesMissingScore: resumesMissingScore,
      nonExistentSystemIds: nonExistentSystemIds,
    };
  }

  async formatResume(type: string, resumeId: string): Promise<any> {
    if (type === 'avito') {
      return await avitoService.formatResume(resumeId);
    }

    return await hhService.formatResume(resumeId);
  }

  getSystemId(type: string, resumeId: string) {
    if (type === 'avito') {
      return avitoService.getSystemId(resumeId);
    }

    return hhService.getSystemId(resumeId);
  }

  getBatchSize(type: string) {
    if (type === 'avito') {
      return avitoService.BATCH_SIZE;
    }

    return hhService.BATCH_SIZE;
  }

  async getDetailedResumeParallel(
    resumeItems: string[],
    searchHrId: string,
    type: string,
  ) {
    const BATCH_SIZE = this.getBatchSize(type);
    console.log(
      `Начинаем получать детали для ${resumeItems.length} резюме, батчами по ${BATCH_SIZE}.`,
    );

    const batches = chunkArray(resumeItems, BATCH_SIZE);

    for (let i = 0; i < batches.length; i++) {
      const currentBatch = batches[i];

      console.log(
        `Обрабатываем батч ${i + 1}/${batches.length} (${currentBatch.length} резюме)...`,
      );

      const batchPromises = currentBatch.map(async (resumeId) => {
        const systemId = this.getSystemId(type, resumeId);

        console.log(
          `[Батч ${i + 1}] Получаем детали для резюме ID: ${resumeId}...`,
        );

        try {
          const { resume, ...params } = await this.formatResume(type, resumeId);

          const newResume = await Resume.create({
            systemId,
            text: resume,
            params,
          });

          await ResumeHrScore.create({
            resume: newResume.id,
            hrSearch: searchHrId,
          });

          console.log(
            `[Батч ${i + 1}] Детали для резюме ID ${resumeId} успешно получены и сохранены.`,
          );
          return { status: 'fulfilled', id: resumeId, data: {} };
        } catch (error: any) {
          const errorMessage = `[Батч ${i + 1}] Произошла ошибка при обработке резюме ID ${resumeId}: ${error.message}`;
          console.error(errorMessage);
          throw { status: 'rejected', id: resumeId, reason: error.message }; // Бросаем объект с деталями ошибки для allSettled
        }
      });

      await Promise.allSettled(batchPromises);

      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  async createBatchResumeHrScores(
    systemIdsToScore: string[],
    hrSearchObjectId: ObjectId,
  ): Promise<number> {
    if (!systemIdsToScore || systemIdsToScore.length === 0) {
      console.log(
        'createBatchResumeHrScores: Входной массив systemIdsToScore пуст. Ничего не создано.',
      );
      return 0;
    }

    try {
      const existingResumes = await Resume.find(
        { systemId: { $in: systemIdsToScore } },
        { _id: 1, systemId: 1 },
      ).lean();

      if (existingResumes.length === 0) {
        console.log(
          'createBatchResumeHrScores: Не найдено существующих резюме по заданным systemIds.',
        );
        return 0;
      }

      const documentsToInsert = existingResumes.map((resume) => ({
        resume: resume._id,
        hrSearch: hrSearchObjectId,
      }));

      const insertResult = await ResumeHrScore.insertMany(documentsToInsert);

      console.log(
        `createBatchResumeHrScores: Успешно создано ${insertResult.length} записей в ResumeHrScore.`,
      );

      return insertResult.length;
    } catch (error) {
      console.error(
        'createBatchResumeHrScores: Ошибка при создании записей ResumeHrScore:',
        error,
      );
      return 0;
    }
  }

  async updateResumes() {
    const hrSearchItem = await HrSearch.findOne({
      isActive: true,
      nextUpdate: { $lte: new Date() },
    }).sort({ nextUpdate: -1 });

    if (!hrSearchItem) {
      console.log('Нет свободных агентов');
    }

    hrSearchItem.nextUpdate = new Date(Date.now() + 6 * 60 * 60 * 1000);
    hrSearchItem.status = HrSearchStatus.Fetching;

    await hrSearchItem.save();

    this.currentHrSearch = hrSearchItem;

    await Promise.allSettled(
      hrSearchItem.requestData.type.map(async (type: string) => {
        const resumes = (await this.getResumes(
          hrSearchItem.query,
          type,
          hrSearchItem.requestData.params[type],
        )) as any;

        console.log({ 'resumes.length': resumes.length });

        const { resumesMissingScore, nonExistentSystemIds } =
          await this.findResumesStatus(
            resumes.map((resume: any) => `${type}_${resume.id}`),
            hrSearchItem.id,
          );

        console.log({
          'resumesMissingScore.length': resumesMissingScore.length,
          'nonExistentSystemIds.length': nonExistentSystemIds.length,
        });

        await this.createBatchResumeHrScores(resumesMissingScore, hrSearchItem);

        console.log({ nonExistentSystemIds });
        await this.getDetailedResumeParallel(
          nonExistentSystemIds.map((id: string) => id.split('_')[1]),
          hrSearchItem._id,
          type,
        );
      }),
    );

    this.currentHrSearch = null;
  }

  async setFetchingCurrentHrSearch() {
    // console.log({ 'this.currentHrSearch': this.currentHrSearch });
    // if (!this.currentHrSearch) return;
    // try {
    //   this.currentHrSearch.status = HrSearchStatus.Fetching;
    //
    //   await this.currentHrSearch.save();
    // } catch (e) {
    //   console.log(e);
    // }
  }

  async evaluteResumes() {
    const hrSearchItems = await HrSearch.find({
      isActive: true,
    });

    if (hrSearchItems.length === 0) {
      console.log('Ничего не найдено!');
      return;
    }

    for (const hrSearchItem of hrSearchItems) {
      hrSearchItem.status = HrSearchStatus.Calculation;
      const calculatingHrSearch = await hrSearchItem.save();

      await scoreResume.evaluteScoreHrSearchItem(hrSearchItem);

      if (calculatingHrSearch.id === this.currentHrSearch?.id) {
        calculatingHrSearch.status = HrSearchStatus.Fetching;
        await calculatingHrSearch.save();
      } else {
        calculatingHrSearch.status = HrSearchStatus.Idle;
        await calculatingHrSearch.save();
      }
    }

    console.log(
      '\n--- Обработка неполных оценок резюме завершена полностью ---',
    );
  }
}

export const hrService = new HrService();
