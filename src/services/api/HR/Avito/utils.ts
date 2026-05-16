export function formatResumeObject(resumeData: any) {
  const title = resumeData.title || 'Не указано';
  const salary = resumeData.salary ? `${resumeData.salary} руб.` : 'Не указана';
  const description = resumeData.description
    ? resumeData.description.replace(/\r\n/g, '\n')
    : 'Нет информации';

  const params = resumeData.params || {};
  const age = params.age || 'Не указан';
  const pol = params.pol || 'Не указан';
  const address = params.address || 'Не указан';
  const businessArea = params.business_area || 'Не указана';
  const totalExperience = params.experience || 'Не указан'; // Общий опыт в годах
  const educationLevel = params.education || 'Не указано';
  const abilityToBusinessTrip = params.ability_to_business_trip || 'Не указана';
  const moving = params.moving || 'Не указана';
  const schedule = params.schedule || 'Не указан';
  const nationality = params.nationality || 'Не указана';
  const driverLicence = params.driver_licence || 'Нет';
  const driverLicenceCategories = params.driver_licence_category
    ? params.driver_licence_category.join(', ')
    : 'Не указаны';

  const educationList = params.education_list || [];
  const experienceList = params.experience_list || [];
  const languageList = params.language_list || [];

  let result = `**Резюме**

**Должность:** ${title}
**Предполагаемая зарплата:** ${salary}

---

`;

  result += `**Общая информация:**
- Возраст: ${age}${typeof age === 'number' ? ' лет' : ''}
- Пол: ${pol}
- Место проживания: ${address}
- Гражданство: ${nationality}
- Сфера деятельности: ${businessArea}
- Опыт работы: ${totalExperience}${typeof totalExperience === 'number' ? ' года' : ''}
- Образование: ${educationLevel}
- График работы: ${schedule}
- Готовность к командировкам: ${abilityToBusinessTrip}
- Готовность к переезду: ${moving}

---

`;

  result += `**О себе:**
${description}

---

`;

  if (experienceList.length > 0) {
    result += `**Опыт работы (${totalExperience}${typeof totalExperience === 'number' ? ' года' : ''}):**`;

    experienceList.forEach((job: any, index: number) => {
      const company = job.company || 'Не указано';
      const position = job.position || 'Не указана';
      const startDate = job.work_start ? new Date(job.work_start) : null;
      const endDate = job.work_finish ? new Date(job.work_finish) : null;

      const startDateStr = startDate
        ? startDate.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
          })
        : 'Не указано';
      let endDateStr = 'наст. время';

      if (endDate && endDate <= new Date()) {
        endDateStr = endDate.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: 'long',
        });
      } else if (!endDate) {
        endDateStr = 'Не указано';
      }
      const period =
        startDateStr !== 'Не указано' || endDateStr !== 'Не указано'
          ? `${startDateStr} – ${endDateStr}`
          : 'Не указан';

      const responsibilities = job.responsibilities
        ? job.responsibilities.replace(/\r\n/g, '\n')
        : 'Не указаны';

      result += `**${index + 1}. ${position}**
   Компания: ${company}
   Период работы: ${period}
   Обязанности и результаты:
${responsibilities}`;
    });
    result += `---\n\n`;
  }

  if (educationList.length > 0) {
    result += `**Образование:**`;

    educationList.forEach((edu: any) => {
      const institution = edu.institution || 'Не указано';
      const specialty = edu.specialty || 'Не указана';
      const stopYear = edu.education_stop || 'Не указан';

      result += `- ${institution}
  Специальность: ${specialty}
  Год окончания: ${stopYear}${stopYear !== 'Не указан' ? ` (${educationLevel})` : ''}
`;
    });
    result += `---\n\n`;
  }

  if (languageList.length > 0) {
    result += `**Владение языками:**`;

    languageList.forEach((lang: any) => {
      const language = lang.language || 'Не указан';
      const level = lang.language_level || 'Не указан';
      result += `- ${language}: ${level}`;
    });
    result += `---\n\n`;
  }

  const driverLicenceInfo = `- Водительское удостоверение: ${driverLicence}${driverLicenceCategories !== 'Не указаны' && driverLicence === 'Есть' ? ` (категории ${driverLicenceCategories})` : ''}`;

  result += `**Дополнительная информация:**
${driverLicenceInfo}

---

`;

  if (result.endsWith('---\n\n')) {
    result = result.slice(0, -6); // Удаляем '---\n\n'
  }

  return result;
}
