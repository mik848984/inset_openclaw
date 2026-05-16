import fetch from 'node-fetch';
import { llmStructureGenerator } from '@/services/api/HR/HH/LLMStructureGenerator';
import { removeDuplicatesById } from '@/services/api/HR/HH/utils';

function removeNAParameters(obj: any, additionalKeys: string[] = []) {
  const keys = Object.keys(obj);

  keys.forEach((key) => {
    if (additionalKeys.includes(key)) {
      delete obj[key];
      return;
    }

    if (!obj[key] || obj[key] === 'N/A') {
      delete obj[key];
    }
  });

  return obj;
}

class HHService {
  BATCH_SIZE = 80;

  async formatResume(resumeId: any) {
    const response = await fetch(
      `${process.env.MODELS_URI}/resume_hh/${resumeId}`,
      { headers: { 'Content-Type': 'application/json' } },
    );

    return await response.json();
  }

  async generateQueryTags(initialRequest: string) {
    return llmStructureGenerator.generateQueryTags(initialRequest);
  }

  async getResumes(queries: string[], params = {}) {
    const queryParamsItems = queries.flatMap((text) => {
      const queryParams = new URLSearchParams({
        text,
        ...removeNAParameters(params),
      });

      const queryParamsWithoutExperience = new URLSearchParams({
        text,
        ...removeNAParameters(params, ['experience']),
      });

      return [queryParams, queryParamsWithoutExperience];
    });

    const items = [];

    for (const queryParamsItem of queryParamsItems) {
      let totalPage = 19;
      let page = 0;

      do {
        const queryParamsBase = new URLSearchParams({
          per_page: '100',
          page: String(page),
          order_by: 'publication_time',
        });

        const resumeResponse = await fetch(
          `https://api.hh.ru/resumes?${queryParamsItem.toString()}&${queryParamsBase.toString()}`,
          {
            method: 'GET',
            headers: {
              Authorization:
                'Bearer USERLVPM2ER936OOCSS4NJBLSVQBHRCM8VEVSN8LGIV3L4VP268C2TG9UJJ5RNDJ',
            },
          },
        );

        if (!resumeResponse.ok) {
          console.log(await resumeResponse.text());
          return;
        }

        const result = (await resumeResponse.json()) as any;

        console.log(
          `${queryParamsItem.get('text')}: Найдено резюме: ${result.found}`,
        );
        totalPage = result.pages > 19 ? 19 : result.pages;
        console.log(queryParamsBase.toString());
        console.log(`Страница: ${page}/${totalPage}`);

        items.push(...result.items);

        page++;
      } while (page < totalPage);
    }

    console.log({ 'items.length': items.length });
    console.log({
      ' removeDuplicatesById(items).length': removeDuplicatesById(items).length,
    });

    return removeDuplicatesById(items);
  }

  getSystemId(id: string) {
    return `hh_${id}`;
  }

  async getSearchParams(initQuery: string) {
    return llmStructureGenerator.getSearchParams(initQuery);
  }
}

export const hhService = new HHService();
