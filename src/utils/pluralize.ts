export function pluralize(number: number, wordForms: [string, string, string]) {
  if (!Array.isArray(wordForms) || wordForms.length !== 3) {
    throw new Error('Аргумент wordForms должен быть массивом из 3 форм слова.');
  }

  const num = Math.abs(number);

  const lastTwoDigits = num % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return wordForms[2]; // Используем форму для 5+
  }

  const lastDigit = num % 10;

  if (lastDigit === 1) {
    return wordForms[0];
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return wordForms[1];
  } else {
    return wordForms[2];
  }
}
