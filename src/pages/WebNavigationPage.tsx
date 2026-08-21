import {
  ArrowUpRight,
  BookOpen,
  Bot,
  Cat,
  Clapperboard,
  Cloud,
  Compass,
  ExternalLink,
  Gamepad2,
  Music2,
  Network,
  PackageOpen,
  Palette,
  Search,
  ShieldCheck,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { ExternalImage } from '../components/common/ExternalImage';
import { Seo } from '../components/common/Seo';
import { webNavigationCategories, webNavigationLinkCount } from '../config/webNavigation';
import type { WebNavigationCategoryId } from '../types/web-navigation';

const categoryIcons = {
  ai: Bot,
  cloud: Cloud,
  network: Network,
  video: Clapperboard,
  anime: Cat,
  music: Music2,
  reading: BookOpen,
  game: Gamepad2,
  entertainment: Palette,
  toolbox: Wrench,
  software: PackageOpen,
} satisfies Record<WebNavigationCategoryId, LucideIcon>;

function getHostname(url: string) {
  return new URL(url).hostname.replace(/^www\./, '');
}

export function WebNavigationPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<WebNavigationCategoryId>('ai');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());

  const visibleGroups = useMemo(() => {
    if (!deferredQuery) {
      return webNavigationCategories.filter((category) => category.id === activeCategoryId);
    }

    return webNavigationCategories
      .map((category) => ({
        ...category,
        links: category.links.filter((link) =>
          `${link.name} ${link.description}`.toLocaleLowerCase().includes(deferredQuery),
        ),
      }))
      .filter((category) => category.links.length > 0);
  }, [activeCategoryId, deferredQuery]);

  const resultCount = visibleGroups.reduce((total, category) => total + category.links.length, 0);

  return (
    <>
      <Seo
        title="网站导航"
        description="按 AI、云服务、网络、影视、二次元、音乐、阅读、游戏、娱乐、工具箱和软件分类浏览常用网站。"
        keywords={['网站导航', 'AI 导航', '云服务', '影视导航', '在线工具', '软件官网']}
        path="/navigation"
      />

      <div className="web-navigation-page">
        <header className="web-navigation-hero container">
          <div>
            <p className="eyebrow">
              <Compass size={15} aria-hidden="true" /> 网站导航 · {webNavigationLinkCount} 个站点
            </p>
            <h1>常用网站，一个入口。</h1>
            <p>按内容类型快速浏览，所有外部链接均在新标签页打开。</p>
          </div>

          <div className="web-navigation-search">
            <Search size={19} aria-hidden="true" />
            <label className="sr-only" htmlFor="website-search">
              搜索网站
            </label>
            <input
              id="website-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索名称或用途…"
              autoComplete="off"
            />
            {query && (
              <button type="button" aria-label="清空网站搜索" onClick={() => setQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>
        </header>

        <div className="web-navigation-shell container">
          <aside className="web-navigation-sidebar" aria-label="网站分类">
            {webNavigationCategories.map((category) => {
              const Icon = categoryIcons[category.id];
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={!query && activeCategoryId === category.id}
                  onClick={() => {
                    setActiveCategoryId(category.id);
                    setQuery('');
                  }}
                >
                  <Icon size={19} aria-hidden="true" />
                  <span>{category.name}</span>
                  <small>{category.links.length}</small>
                </button>
              );
            })}
          </aside>

          <div className="web-navigation-content" aria-live="polite">
            {query && (
              <div className="web-navigation-results-summary">
                <span>全站搜索</span>
                <strong>{resultCount ? `找到 ${resultCount} 个站点` : '没有找到匹配站点'}</strong>
              </div>
            )}

            {visibleGroups.length ? (
              visibleGroups.map((category) => (
                <section className="web-navigation-group" key={category.id}>
                  <header className="web-navigation-group__header">
                    <div>
                      <p>{String(category.links.length).padStart(2, '0')} / DIRECTORY</p>
                      <h2>{category.name}</h2>
                      <span>{category.description}</span>
                    </div>
                    <a href={category.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">
                      查看来源分类 <ExternalLink size={14} />
                    </a>
                  </header>

                  <div className="web-navigation-links">
                    {category.links.map((link, index) => (
                      <a
                        className="web-navigation-link"
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        <span className="web-navigation-link__index">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="web-navigation-link__logo">
                          <ExternalImage
                            src={link.logoUrl}
                            alt=""
                            className="web-navigation-link__logo-image"
                            fallbackClassName="web-navigation-link__logo-fallback"
                            fallback={<span>{Array.from(link.name.trim())[0] ?? '?'}</span>}
                            width={48}
                            height={48}
                            decoding="async"
                            referrerPolicy="no-referrer"
                          />
                        </span>
                        <span className="web-navigation-link__body">
                          <strong>{link.name}</strong>
                          <span>{link.description}</span>
                        </span>
                        <small>{getHostname(link.url)}</small>
                        <ArrowUpRight size={17} aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="web-navigation-empty">
                <Search size={25} aria-hidden="true" />
                <p>换一个更短的关键词，或从左侧分类重新浏览。</p>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setQuery('')}
                >
                  清空搜索
                </button>
              </div>
            )}

            <footer className="web-navigation-notice">
              <ShieldCheck size={17} aria-hidden="true" />
              <p>
                本页仅提供外部网站入口，不托管其内容。第三方站点的可用性、内容与隐私政策由其运营方负责。
              </p>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
