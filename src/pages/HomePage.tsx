import { ArrowDown, Search, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/common/Seo';
import { ToolGrid } from '../components/common/ToolGrid';
import { categories } from '../config/categories';
import { siteConfig } from '../config/site';
import { featuredTools, getToolsByCategory, tools } from '../config/tools';
import { searchTools } from '../utils/searchTools';

export function HomePage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const searchRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchTools(tools, deferredQuery), [deferredQuery]);
  const activeCategories = categories.filter(
    (category) => getToolsByCategory(category.id).length > 0,
  );
  const isSearching = query.trim().length > 0;

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditing =
        target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if (event.key === '/' && !isEditing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  return (
    <>
      <Seo keywords={['在线工具', '开发工具', '文本工具', '本地处理']} />
      <section className="home-hero">
        <div className="home-hero__grid container">
          <div className="home-hero__copy">
            <p className="eyebrow hero-enter hero-enter--1">
              <Sparkles size={15} aria-hidden="true" /> {tools.length} 个工具 · 持续增加
            </p>
            <h1 className="hero-enter hero-enter--2">{siteConfig.tagline}</h1>
            <p className="home-hero__lead hero-enter hero-enter--3">{siteConfig.description}</p>
            <div className="tool-search hero-enter hero-enter--4">
              <Search size={20} aria-hidden="true" />
              <label className="sr-only" htmlFor="tool-search">
                搜索工具
              </label>
              <input
                ref={searchRef}
                id="tool-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索 JSON、Base64、字数统计…"
                autoComplete="off"
              />
              {query ? (
                <button type="button" aria-label="清空搜索" onClick={() => setQuery('')}>
                  <X size={17} />
                </button>
              ) : (
                <kbd>/</kbd>
              )}
            </div>
            <div className="hero-trust hero-enter hero-enter--5">
              <ShieldCheck size={17} aria-hidden="true" />
              无需登录 · 不保存输入 · 本地即时处理
            </div>
          </div>
          <div className="home-hero__index" aria-hidden="true">
            <span className="home-hero__index-k">K</span>
            <div>
              <span>LOCAL</span>
              <span>FAST</span>
              <span>USEFUL</span>
            </div>
          </div>
        </div>
        <a className="hero-scroll" href="#tools" aria-label="查看工具">
          <ArrowDown size={17} />
        </a>
      </section>

      <div className="category-rail" aria-label="工具分类">
        <div className="container category-rail__inner">
          <span className="category-rail__label">分类</span>
          {activeCategories.map((category) => (
            <Link key={category.id} to={`/category/${category.id}`}>
              {category.name}
              <sup>{getToolsByCategory(category.id).length}</sup>
            </Link>
          ))}
          <Link className="category-rail__directory-link" to="/navigation">
            网站导航 <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>

      <div className="home-content container" id="tools">
        {isSearching ? (
          <section className="home-section search-results" aria-live="polite">
            <div className="section-heading">
              <div>
                <p className="eyebrow">搜索结果</p>
                <h2>{results.length ? `找到 ${results.length} 个工具` : '没有找到匹配工具'}</h2>
              </div>
              <button className="text-button" type="button" onClick={() => setQuery('')}>
                清空搜索
              </button>
            </div>
            {results.length ? (
              <ToolGrid tools={results} />
            ) : (
              <div className="empty-state">
                <Search size={26} aria-hidden="true" />
                <p>试试更短的关键词，或按分类浏览全部工具。</p>
                <button
                  className="button button--primary"
                  type="button"
                  onClick={() => searchRef.current?.focus()}
                >
                  重新搜索
                </button>
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="home-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">常用入口</p>
                  <h2>热门工具</h2>
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
                  KANG Tools 是一个纯静态工具站。首批工具无需账户、没有上传步骤，也不依赖后台服务。
                  页面从 GitHub 持续部署到 Cloudflare Pages，保持简单、透明且足够快。
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
