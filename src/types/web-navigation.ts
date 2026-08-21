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

export interface WebNavigationCategory {
  id: WebNavigationCategoryId;
  name: string;
  description: string;
  sourceUrl: `https://${string}`;
  links: WebNavigationLink[];
}
