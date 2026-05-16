export function copyTextToClipboard(text: string) {
  if (navigator.clipboard) {
    return navigator.clipboard
      .writeText(text)
      .catch(fallbackCopyTextToClipboard);
  } else {
    return fallbackCopyTextToClipboard(text);
  }
}

function fallbackCopyTextToClipboard(text: string) {
  return new Promise((resolve, reject) => {
    var textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      successful
        ? resolve(successful)
        : reject('Не удалось скопировать (запасной вариант)');
    } catch (err) {
      reject('Не удалось скопировать (запасной вариант): ' + err);
    } finally {
      document.body.removeChild(textArea);
    }
  });
}
