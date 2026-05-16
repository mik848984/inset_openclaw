export function removeDuplicatesById(arr: any[]) {
  const seenIds = new Set();
  const result = [];

  for (const item of arr) {
    if (!seenIds.has(item.id)) {
      result.push(item);
      seenIds.add(item.id);
    }
  }

  return result;
}

export function dictionaryToToolProperty(
  type: string,
  prefix: string,
  dictionaries: { id: string; name: string }[],
) {
  return {
    type,
    description: `${prefix}. Possible values, write one of them: ${dictionaries.map((dictionary) => dictionary.id).join(',')}. Detailed information about the values: ${dictionaries.map((dictionary) => `${dictionary.id} - ${dictionary.name}`).join(',')}. If you can't get the information you need, just specify N/A`,
  };
}
