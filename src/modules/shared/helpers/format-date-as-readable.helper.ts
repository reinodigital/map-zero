export const formatDateAsReadable = (dateString: string): string => {
  const date = new Date(dateString);

  const datePart = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${datePart} a las ${hours}:${minutes}`;
};
