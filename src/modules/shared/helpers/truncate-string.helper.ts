export const truncateSomeString = (
  name: string | null,
  length: number = 23,
): string => {
  if (!name) {
    return '';
  }

  return name.length > length ? name.slice(0, length - 1) + '...' : name;
};
