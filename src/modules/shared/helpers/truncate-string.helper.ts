export const truncateSomeString = (name: string | null): string => {
  if (!name) {
    return '';
  }

  return name.length > 23 ? name.slice(0, 22) + '...' : name;
};
