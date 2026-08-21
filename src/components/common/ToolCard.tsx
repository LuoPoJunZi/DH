import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategory } from '../../config/categories';
import type { ToolDefinition } from '../../types/tool';
import { ToolIcon } from './ToolIcon';

export function ToolCard({ tool, compact = false }: { tool: ToolDefinition; compact?: boolean }) {
  const category = getCategory(tool.category);
  return (
    <Link className="tool-card" data-compact={compact} to={tool.path}>
      <span className="tool-card__icon">
        <ToolIcon name={tool.icon} size={compact ? 18 : 21} strokeWidth={1.8} />
      </span>
      <span className="tool-card__body">
        <span className="tool-card__eyebrow">{category?.name}</span>
        <strong>{tool.name}</strong>
        {!compact && <span className="tool-card__description">{tool.description}</span>}
      </span>
      <ArrowUpRight className="tool-card__arrow" size={17} aria-hidden="true" />
    </Link>
  );
}
