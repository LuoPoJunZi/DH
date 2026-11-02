import { Link } from 'react-router-dom';
import { Seo } from '../components/common/Seo';
import { ToolGrid } from '../components/common/ToolGrid';
import { categories } from '../config/categories';
import { featuredTools, getToolsByCategory } from '../config/tools';

export function HomePage() {
  const activeCategories = categories.filter(
    (category) => getToolsByCategory(category.id).length > 0,
  );

  return (
    <>
      <Seo
        title="在线工具"
        keywords={['在线工具', '开发工具', '文本工具', '本地处理']}
        path="/tools"
      />
      <div className="home-content container container--wide" id="tools">
        <section className="home-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">常用入口</p>
              <h1>热门工具</h1>
            </div>
            <p>最常用的转换与处理工具</p>
          </div>
          <ToolGrid tools={featuredTools} />
        </section>

        {activeCategories.map((category) => {
          const categoryTools = getToolsByCategory(category.id);
          return (
            <section className="home-section category-section" key={category.id}>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    {category.shortName} / {String(categoryTools.length).padStart(2, '0')}
                  </p>
                  <h2>{category.name}</h2>
                </div>
                <Link className="text-link" to={`/category/${category.id}`}>
                  查看分类 <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <ToolGrid tools={categoryTools} />
            </section>
          );
        })}
      </div>
    </>
  );
}
