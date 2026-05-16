import OpenAI from 'openai';
import fetch from 'node-fetch';
import { formatResumeObject } from '@/services/api/HR/Avito/utils';

const clientId = 'WckUFmKN5qg-7u01tryc';
const clientSecret = 'rxknuYRGTkTryWQ4HD7zwP242AsDWrnwm3CwyFEh';

class AvitoService {
  BATCH_SIZE = 25;
  authHeaders = { Authorization: `Bearer ` };

  async formatResume(resumeId: any) {
    const specificResumeUrl = `https://api.avito.ru/job/v2/resumes/${resumeId}`;

    const specificResponse = await fetch(specificResumeUrl, {
      method: 'GET',
      headers: this.authHeaders,
    });

    if (!specificResponse.ok) {
      const errorText = await specificResponse.text();
      const errorMessage = `Ошибка HTTP при получении деталей для резюме ID ${resumeId}: Статус ${specificResponse.status}, Тело ответа: ${errorText}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const specificData = (await specificResponse.json()) as any;

    return {
      resume: formatResumeObject(specificData),
      title: specificData.title,
      area: specificData.params.address,
      age: specificData.params.age ? `${specificData.params.age} лет` : null,
    };
  }

  async generateQueryTags(initialRequest: string) {}

  async updateToken() {
    console.log('Обновляем токен');
    const tokenBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    });

    const tokenResponse = await fetch('https://api.avito.ru/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenBody,
    });

    const tokeResult = (await tokenResponse.json()) as any;

    console.log(tokeResult);

    this.authHeaders = { Authorization: `Bearer ${tokeResult.access_token}` };
  }

  async getResumes(query: string[], params = {}) {
    return [];
    await this.updateToken();
    let allResumeItems: any[] = [];
    let currentPage = 1;
    let totalPages = 1;

    do {
      try {
        const listResponse = await fetch(
          `https://api.avito.ru/job/v1/resumes?query=${query[0]}&page=${currentPage}&per_page=100`,
          { headers: this.authHeaders },
        );

        if (!listResponse.ok) {
          console.log(await listResponse.text());
          continue;
        }

        const listData = (await listResponse.json()) as any;

        if (currentPage === 1 && listData.meta && listData.meta.pages) {
          totalPages = listData.meta.pages;
        } else if (
          currentPage === 1 &&
          (!listData.meta || !listData.meta.pages)
        ) {
          console.warn(
            'Не удалось получить информацию о страницах из ответа API списка.',
            listData,
          );
          totalPages = 1;
        }

        if (listData.resumes && Array.isArray(listData.resumes)) {
          allResumeItems = allResumeItems.concat(listData.resumes);
          console.log(
            `Добавлено ${listData.resumes.length} резюме со страницы ${currentPage}. Всего собрано: ${allResumeItems.length}`,
          );
        } else {
          console.warn(
            `Не удалось найти массив резюме в ответе API страницы ${currentPage}.`,
            listData,
          );
        }
      } catch (error: any) {
        console.error(
          `Произошла ошибка при получении списка резюме (страница ${currentPage}):`,
          error.message,
        );
      }

      currentPage++;
    } while (currentPage <= totalPages);

    return allResumeItems;
  }

  getSystemId(id: string) {
    return `avito_${id}`;
  }
}

export const avitoService = new AvitoService();
