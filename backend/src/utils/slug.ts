import slugify from 'slugify';

export const slugifyName = (name: string): string => slugify(name, { lower: true, strict: true, trim: true });
