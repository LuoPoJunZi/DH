import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Seo } from '../components/common/Seo';
import { ToolGrid } from '../components/common/ToolGrid';
import { getCategory } from '../config/categories';
import { getToolsByCategory } from '../config/tools';
import { NotFoundPage } from './NotFoundPage';

export function CategoryPage() {
  const { categoryId = '' } = useParams();
  const category = getCategory(categoryId);
  if (!category) return <NotFoundPage />;
  const categoryTools = getToolsByCategory(category.id);

  return (
    <div className="page-container page-container--directory container container--wide">
      <Seo
        title={category.name}
        description={`${category.description}，在浏览器中即时完成。`}
        keywords={[category.name, category.shortName, '在线工具']}
        path={`/category/${category.id}`}
      />
      <Link className="back-link" to="/">
        <ArrowLeft size={16} /> 返回首页
      </Link>
      <header className="page-header">
        <p className="eyebrow">工具分类 / {String(categoryTools.length).padStart(2, '0')}</p>
        <h1>{category.name}</h1>
        <p>{category.description}</p>
      </header>
      {categoryTools.length ? (
        <ToolGrid tools={categoryTools} />
      ) : (
        <div className="empty-state">
          <p>这个分类的工具正在准备中。</p>
          <Link className="button button--primary" to="/">
            浏览现有工具
          </Link>
        </div>
      )}
    </div>
  );
}
