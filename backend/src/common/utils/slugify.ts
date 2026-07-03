export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Appends a short random suffix when the base slug is taken. */
export function uniqueSlug(base: string, taken: (slug: string) => Promise<boolean>) {
  return (async () => {
    let slug = slugify(base);
    if (!(await taken(slug))) return slug;
    let i = 2;
    while (await taken(`${slug}-${i}`)) i++;
    return `${slug}-${i}`;
  })();
}
