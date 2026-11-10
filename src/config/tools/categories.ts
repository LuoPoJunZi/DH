import { siteConfig } from '../site/site';
export const categories = siteConfig.categories;

export function getCategory(categoryId: string) {
  return categories.find((category) => category.id === categoryId);
}
