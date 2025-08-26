export const slugify = (text: string): string => {
  return (text || '')
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric
    .trim()
    .replace(/\s+/g, '-') // spaces to dashes
    .replace(/-+/g, '-'); // collapse
};
