import siteData from './site.data.json';
import type { ToolCategory } from '../types/tool';

interface SiteConfig {
  name: string;
  shortName: string;
  description: string;
  tagline: string;
  url: string;
  author: string;
  github: string;
  blog: string;
  footer: string;
  categories: ToolCategory[];
}

export const siteConfig = siteData as SiteConfig;
