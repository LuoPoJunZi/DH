import siteData from './site.data.json';
import type { ToolCategory } from '../types/tool';

interface FriendLink {
  name: string;
  url: `https://${string}`;
}

interface SiteConfig {
  name: string;
  shortName: string;
  description: string;
  tagline: string;
  url: string;
  author: string;
  github: string;
  blog: string;
  friendLinks: FriendLink[];
  footer: string;
  categories: ToolCategory[];
}

export const siteConfig = siteData as SiteConfig;
