import type { ComponentType, LazyExoticComponent } from 'react';

export type ToolCategoryId = 'text' | 'developer' | 'image' | 'converter' | 'network' | 'other';

export type ToolIconName =
  | 'braces'
  | 'binary'
  | 'link'
  | 'clock'
  | 'fingerprint'
  | 'text-cursor'
  | 'list-filter'
  | 'arrow-left-right';

export interface ToolSeo {
  title: string;
  description: string;
}

export interface ToolMeta {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: ToolCategoryId;
  path: `/tools/${string}`;
  icon: ToolIconName;
  keywords: string[];
  featured: boolean;
  seo: ToolSeo;
  usage: string[];
  features: string[];
}

export interface ToolDefinition extends ToolMeta {
  component: LazyExoticComponent<ComponentType>;
}

export interface ToolCategory {
  id: ToolCategoryId;
  name: string;
  shortName: string;
  description: string;
}
