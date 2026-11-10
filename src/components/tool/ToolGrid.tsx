import type { ToolDefinition } from '../../types/tool';
import { ToolCard } from './ToolCard';

export function ToolGrid({
  tools,
  compact = false,
}: {
  tools: ToolDefinition[];
  compact?: boolean;
}) {
  return (
    <div className="tool-grid" data-compact={compact}>
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} compact={compact} />
      ))}
    </div>
  );
}
