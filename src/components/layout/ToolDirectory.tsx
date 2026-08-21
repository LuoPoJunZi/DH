import { ArrowRight, CircleDashed, Compass, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { featuredTools, getToolsByCategory, tools } from '../../config/tools';
import { siteConfig } from '../../config/site';
import { ToolIcon } from '../common/ToolIcon';

interface ToolDirectoryProps {
  variant: 'desktop' | 'mobile';
  onNavigate: () => void;
}

const categoryGroups = siteConfig.categories.map((category) => ({
  category,
  tools: getToolsByCategory(category.id),
}));

const activeGroups = categoryGroups.filter((group) => group.tools.length > 0);
const plannedGroups = categoryGroups.filter((group) => group.tools.length === 0);
const directTools = featuredTools.slice(0, 5);

export function ToolDirectory({ variant, onNavigate }: ToolDirectoryProps) {
  return (
    <section className={`tool-directory tool-directory--${variant}`} aria-label="工具目录">
      <div
        className={
          variant === 'desktop' ? 'tool-directory__inner container' : 'tool-directory__inner'
        }
      >
        <header className="tool-directory__header">
          <div>
            <p className="tool-directory__eyebrow">
              <Compass size={14} />
              工具目录 · {tools.length} 个工具
            </p>
            <h2>按任务找到合适的工具</h2>
          </div>
          <Link className="tool-directory__all" to="/#tools" onClick={onNavigate}>
            <Search size={16} />
            搜索全部工具
            <ArrowRight size={15} />
          </Link>
        </header>

        <div className="tool-directory__direct" aria-label="常用工具直达">
          <span className="tool-directory__direct-label">工具直达</span>
          <div className="tool-directory__direct-links">
            {directTools.map((tool) => (
              <Link key={tool.id} to={tool.path} onClick={onNavigate}>
                <ToolIcon name={tool.icon} size={15} />
                {tool.shortName}
              </Link>
            ))}
          </div>
        </div>

        <div className="tool-directory__grid">
          {activeGroups.map(({ category, tools: categoryTools }) => (
            <section className="tool-directory__group" key={category.id}>
              <Link
                className="tool-directory__group-heading"
                to={`/category/${category.id}`}
                onClick={onNavigate}
              >
                <span>
                  <strong>{category.name}</strong>
                  <small>{categoryTools.length}</small>
                </span>
                <ArrowRight size={15} />
              </Link>
              <p>{category.description}</p>
              <div className="tool-directory__tool-links">
                {categoryTools.map((tool) => (
                  <Link key={tool.id} to={tool.path} onClick={onNavigate}>
                    <ToolIcon name={tool.icon} size={17} />
                    <span>{tool.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {plannedGroups.length > 0 && (
          <footer className="tool-directory__planned">
            <span>
              <CircleDashed size={14} />
              即将扩展
            </span>
            {plannedGroups.map(({ category }) => (
              <Link key={category.id} to={`/category/${category.id}`} onClick={onNavigate}>
                {category.name}
              </Link>
            ))}
          </footer>
        )}
      </div>
    </section>
  );
}
