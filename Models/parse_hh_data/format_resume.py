import re
from datetime import datetime, date
import json

# Словарь для парсинга русских названий месяцев без зависимости от локали системы
MONTH_NAMES_RU = {
    'января': 1, 'февраля': 2, 'марта': 3, 'апреля': 4,
    'мая': 5, 'июня': 6, 'июля': 7, 'августа': 8,
    'сентября': 9, 'октября': 10, 'ноября': 11, 'декабря': 12
}


def remove_llm_blocks(text):
    pattern_to_remove = r"\[INST\]<<SYS>>.*?<</SYS>>\[/INST\]|\[INST\].*?\[/INST\]"

    return re.sub(pattern_to_remove, "", text, flags=re.S)


def parse_russian_date(date_str):
    """
    Парсит строку даты в формате 'DD MonthName YYYY' (например, '12 августа 1996').
    Обрабатывает неразрывный пробел (\xa0).
    """
    if not isinstance(date_str, str):
        return None

    # Заменяем неразрывный пробел на обычный и убираем пробелы по краям
    date_str = date_str.replace('\xa0', ' ').strip()
    parts = date_str.split()

    if len(parts) != 3:
        return None  # Неверный формат

    day_str, month_str, year_str = parts
    try:
        day = int(day_str)
        year = int(year_str)
        # Находим номер месяца по названию (независимо от регистра)
        month = MONTH_NAMES_RU.get(month_str.lower())

        if month is None:
            return None  # Неизвестное название месяца

        # Возвращаем объект date
        return date(year, month, day)
    except (ValueError, TypeError):
        # Ошибка при преобразовании числа или некорректные данные
        return None


def calculate_age(birth_date):
    """
    Вычисляет возраст на основе даты рождения.
    """
    today = date.today()
    if birth_date is None:
        return None  # Не можем посчитать возраст без даты рождения

    # Вычисляем возраст в годах
    age = today.year - birth_date.year

    # Корректируем, если день рождения в этом году еще не наступил
    if today.month < birth_date.month or (today.month == birth_date.month and today.day < birth_date.day):
        age -= 1

    return age


def format_age_string(age):
    """
    Форматирует возраст с правильным склонением слова 'год'.
    """
    if age is None:
        return "Возраст не указан"
    if age < 0:  # На всякий случай, если даты некорректные
        return "Возраст не указан"
    if age % 10 == 1 and age % 100 != 11:
        return f"{age} год"
    elif 2 <= age % 10 <= 4 and (age % 100 < 10 or age % 100 >= 20):
        return f"{age} года"
    else:
        return f"{age} лет"


# --- Основная функция форматирования с расчетом опыта и возраста ---

def format_resume(resume_dict):
    """
    Форматирует словарь с данными резюме в одну строку,
    рассчитывает и добавляет общий опыт работы и возраст.

    Args:
        resume_dict (dict): Словарь, содержащий данные резюме.

    Returns:
        str: Отформатированная строка с информацией из резюме, включая общий опыт и возраст.
    """
    lines = []

    birth_date_str = resume_dict.get('birth_date')
    birth_date_obj = parse_russian_date(birth_date_str)
    age = calculate_age(birth_date_obj)
    age_string = format_age_string(age)

    total_days_sum = 0
    experience_list = resume_dict.get('experience', [])

    for exp in experience_list:
        try:
            start_date_str = exp.get('start')
            end_date_str = exp.get('end')

            if start_date_str:
                start_date = datetime.strptime(start_date_str, '%d-%m-%Y').date()

                if end_date_str is None:
                    end_date = date.today()
                else:
                    end_date = datetime.strptime(end_date_str, '%d-%m-%Y').date()

                duration_days = (end_date - start_date).days + 1
                if duration_days > 0:
                    total_days_sum += duration_days

        except (ValueError, TypeError):
            print(f"Внимание: Не удалось распарсить даты для периода: {exp}. Этот период не включен в расчет опыта.")
            pass

    years = total_days_sum // 365
    remaining_days = total_days_sum % 365
    months = remaining_days // 30

    if months >= 12:
        years += months // 12
        months = months % 12

    def format_duration_string(years, months):
        parts = []
        if years > 0:
            if years == 1:
                parts.append("1 год")
            elif 2 <= years <= 4:
                parts.append(f"{years} года")
            else:
                parts.append(f"{years} лет")

        if months > 0:
            if months == 1:
                parts.append("1 месяц")
            elif 2 <= months <= 4:
                parts.append(f"{months} месяца")
            else:
                parts.append(f"{months} месяцев")

        if not parts and total_days_sum > 0:  # Менее месяца, но есть дни
            return f"{total_days_sum} дней"
        if not parts:  # 0 дней
            return "Нет опыта"
        return " ".join(parts)

    total_experience_string = format_duration_string(years, months)

    if resume_dict.get('title'):
        lines.append(f"Должность: {resume_dict['title']}")
    if resume_dict.get('area'):
        lines.append(f"Город: {resume_dict['area']}")

    if birth_date_str:
        lines.append(f"Дата рождения: {birth_date_str.strip()} ({age_string})")
        lines.append(f"Дата рождения: {age_string}")

    if resume_dict.get('gender'):
        lines.append(f"Пол: {resume_dict['gender']}")

    lines.append(f"Общий опыт работы: {total_experience_string}")

    salary_info = resume_dict.get('salary')
    if salary_info and salary_info.get('amount') is not None:
        currency = salary_info.get('currency', '')
        lines.append(f"Зарплата: {salary_info['amount']} {currency}".strip())

    specializations = resume_dict.get('specialization')
    if specializations:
        lines.append("Специализации:")
        for spec in specializations:
            spec_name = spec.get('name', 'Не указана')
            lines.append(f"- {spec_name}")

    if resume_dict.get('education_level'):
        lines.append(f"Уровень образования: {resume_dict['education_level']}")

    education_list = resume_dict.get('education')
    if education_list:
        lines.append("Образование:")
        for edu in education_list:
            year = edu.get('year', '')
            organization = edu.get('organization', 'Не указано')
            name = edu.get('name', 'Не указано')
            lines.append(f"- {year} - {organization}, {name}".strip(" -,"))

    languages = resume_dict.get('language')
    if languages:
        lines.append("Языки:")
        for lang in languages:
            name = lang.get('name', 'Не указан')
            level = lang.get('level', 'Уровень не указан')
            lines.append(f"- {name} ({level})")

    if experience_list:
        lines.append("Детальный опыт работы:")
        for exp in experience_list:
            start_date_str_display = exp.get('start', 'Дата не указана')
            end_date_str_display = exp.get('end')
            if end_date_str_display is None:
                end_date_str_display = 'настоящее время'

            position = exp.get('position', 'Должность не указана')
            description = exp.get('description', '')

            lines.append(f"  ({start_date_str_display} - {end_date_str_display}) {position}".strip())
            if description:
                lines.append(f"    {description.strip()}")

    skill_set_list = resume_dict.get('skill_set')
    if skill_set_list:
        lines.append("Навыки (список):")
        for skill in skill_set_list:
            lines.append(f"- {skill.strip()}")

    skills_text = resume_dict.get('skills')
    if skills_text:
        lines.append("Навыки (описание):")
        lines.append(skills_text.strip())

    return remove_llm_blocks("\n".join(lines))
