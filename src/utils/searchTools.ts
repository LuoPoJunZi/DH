import { getCategory } from '../config/categories';
import type { ToolDefinition } from '../types/tool';

function normalize(value: string) {
  return value.trim().toLocaleLowerCase().replaceAll(/\s+/g, ' ');
}

export function searchTools(tools: ToolDefinition[], query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return tools;

  const terms = normalizedQuery.split(' ');

  return tools.filter((tool) => {
    const category = getCategory(tool.category);
    const haystack = normalize(
      [tool.name, tool.shortName, tool.description, category?.name ?? '', ...tool.keywords].join(
        ' ',
      ),
    );
    return terms.every((term) => haystack.includes(term));
  });
}
