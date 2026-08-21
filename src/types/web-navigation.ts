export type WebNavigationCategoryId =
  | 'ai'
  | 'cloud'
  | 'network'
  | 'video'
  | 'anime'
  | 'music'
  | 'reading'
  | 'game'
  | 'entertainment'
  | 'toolbox'
  | 'software';

export interface WebNavigationLink {
  name: string;
  description: string;
  url: `https://${string}`;
  logoUrl: `https://${string}`;
}

export interface WebNavigationSubcategory {
  id: string;
  name: string;
  links: WebNavigationLink[];
}

export interface WebNavigationCategory {
  id: WebNavigationCategoryId;
  name: string;
  description: string;
  sourceUrl: `https://${string}`;
  links: WebNavigationLink[];
  subcategories?: WebNavigationSubcategory[];
}
