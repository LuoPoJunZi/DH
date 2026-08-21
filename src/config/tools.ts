import { lazy } from 'react';
import toolData from './tools.data.json';
import type { ToolDefinition, ToolMeta } from '../types/tool';

const toolLoaders = {
  'json-formatter': () => import('../tools/developer/json-formatter/JsonFormatterTool'),
  base64: () => import('../tools/developer/base64/Base64Tool'),
  'url-codec': () => import('../tools/developer/url-codec/UrlCodecTool'),
  timestamp: () => import('../tools/developer/timestamp/TimestampTool'),
  'uuid-generator': () => import('../tools/developer/uuid-generator/UuidGeneratorTool'),
  'word-counter': () => import('../tools/text/word-counter/WordCounterTool'),
  'text-deduplicator': () => import('../tools/text/text-deduplicator/TextDeduplicatorTool'),
  'radix-converter': () => import('../tools/converter/radix-converter/RadixConverterTool'),
} satisfies Record<string, () => Promise<{ default: React.ComponentType }>>;

const metadata = toolData as ToolMeta[];

export const tools: ToolDefinition[] = metadata.map((tool) => {
  const loader = toolLoaders[tool.id as keyof typeof toolLoaders];
  if (!loader) {
    throw new Error(`Missing component loader for tool: ${tool.id}`);
  }

  return { ...tool, component: lazy(loader) };
});

export const featuredTools = tools.filter((tool) => tool.featured);

export function getTool(toolId: string) {
  return tools.find((tool) => tool.id === toolId);
}

export function getToolsByCategory(categoryId: string) {
  return tools.filter((tool) => tool.category === categoryId);
}

export function getRelatedTools(tool: ToolDefinition, limit = 4) {
  return tools
    .filter((candidate) => candidate.id !== tool.id)
    .sort((left, right) => {
      const leftSameCategory = left.category === tool.category ? 1 : 0;
      const rightSameCategory = right.category === tool.category ? 1 : 0;
      return rightSameCategory - leftSameCategory;
    })
    .slice(0, limit);
}
