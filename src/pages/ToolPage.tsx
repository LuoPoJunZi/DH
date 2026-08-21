import { ChevronRight } from 'lucide-react';
import { Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Seo } from '../components/common/Seo';
import { ToolGrid } from '../components/common/ToolGrid';
import { getCategory } from '../config/categories';
import { getRelatedTools, getTool } from '../config/tools';
import { NotFoundPage } from './NotFoundPage';

export function ToolPage() {
  const { toolId = '' } = useParams();
  const tool = getTool(toolId);
  if (!tool) return <NotFoundPage />;
  const category = getCategory(tool.category);
  const ToolComponent = tool.component;
  const relatedTools = getRelatedTools(tool);

  return (
    <div className="tool-page container">
      <Seo
        title={tool.seo.title}
        description={tool.seo.description}
        keywords={tool.keywords}
        path={tool.path}
      />
      <nav className="breadcrumbs" aria-label="面包屑">
        <Link to="/">首页</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <Link to={`/category/${tool.category}`}>{category?.name}</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{tool.name}</span>
      </nav>
      <header className="tool-page__header">
        <p className="eyebrow">{category?.name}</p>
        <h1>{tool.name}</h1>
        <p>{tool.description}。您的数据仅在浏览器本地处理，不会上传至服务器。</p>
      </header>

      <Suspense fallback={<div className="tool-loading">正在加载工具…</div>}>
        <ToolComponent />
      </Suspense>

      <div className="tool-details">
        <section>
          <p className="eyebrow">使用方法</p>
          <h2>三步完成</h2>
          <ol className="steps-list">
            {tool.usage.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <p className="eyebrow">功能说明</p>
          <h2>为实际工作准备</h2>
          <ul className="feature-list">
            {tool.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="related-tools">
        <div className="section-heading">
          <div>
            <p className="eyebrow">继续处理</p>
            <h2>相关工具</h2>
          </div>
        </div>
        <ToolGrid tools={relatedTools} compact />
      </section>
    </div>
  );
}
