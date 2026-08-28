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
      <div className="category-rail" aria-label="工具分类">
        <div className="container container--wide category-rail__inner">
          <span className="category-rail__label">分类</span>
          {activeCategories.map((category) => (
            <Link key={category.id} to={`/category/${category.id}`}>
              {category.name}
              <sup>{getToolsByCategory(category.id).length}</sup>
            </Link>
          ))}
          <Link className="category-rail__directory-link" to="/">
            返回网站导航 <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>

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

        <section className="home-note">
          <p className="eyebrow">关于本站</p>
          <div className="home-note__grid">
            <h2>处理发生在你的浏览器里。</h2>
            <p>
              LUOPO Tools 是一个纯静态工具站。首批工具无需账户、没有上传步骤，也不依赖后台服务。
              页面从 GitHub 持续部署到 Cloudflare Pages，保持简单、透明且足够快。
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
