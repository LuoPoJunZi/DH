import {
  ArrowUpRight,
  Blocks,
  BookOpen,
  Cat,
  Clapperboard,
  Gamepad2,
  Music2,
  PackageOpen,
  Palette,
  Search,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ExternalImage } from '../components/common/ExternalImage';
import { Seo } from '../components/common/Seo';
import { NavigationWidgets } from '../components/navigation/NavigationWidgets';
import { siteConfig } from '../config/site';
import { webNavigationCategories } from '../config/webNavigation';
import type { NavigationOutletContext } from '../layouts/AppLayout';
import type { WebNavigationCategoryId } from '../types/web-navigation';

const categoryIcons = {
  digital: Blocks,
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
  const [activeCategoryId, setActiveCategoryId] = useState<WebNavigationCategoryId>('digital');
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string | null>(null);
  const { query, setQuery } = useOutletContext<NavigationOutletContext>();
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const visibleGroups = useMemo(() => {
    if (!deferredQuery) {
      const category = webNavigationCategories.find((item) => item.id === activeCategoryId);
      if (!category) return [];

      const selectedSubcategory =
        category.subcategories?.find((item) => item.id === activeSubcategoryId) ??
        category.subcategories?.[0];

      return [
        {
          ...category,
          links: selectedSubcategory?.links ?? category.links,
        },
      ];
    }

    return webNavigationCategories
      .map((category) => ({
        ...category,
        links: category.links.filter((link) =>
          `${link.name} ${link.description}`.toLocaleLowerCase().includes(deferredQuery),
        ),
      }))
      .filter((category) => category.links.length > 0);
  }, [activeCategoryId, activeSubcategoryId, deferredQuery]);

  const resultCount = visibleGroups.reduce((total, category) => total + category.links.length, 0);

  return (
    <>
      <Seo
        title="网站导航"
        description={`按${webNavigationCategories.map((category) => category.name).join('、')}分类浏览常用网站。`}
        keywords={['网站导航', 'AI 导航', '云服务', '影视导航', '在线工具', '软件官网']}
        path="/"
      />

      <div className="web-navigation-page">
        <h1 className="sr-only">{siteConfig.name} 网站导航</h1>

        <NavigationWidgets />

        <div className="web-navigation-shell container container--wide">
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
                    setActiveSubcategoryId(category.subcategories?.[0]?.id ?? null);
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
                  <div className="web-navigation-group__toolbar">
                    <header className="web-navigation-group__header">
                      <div>
                        <h2>{category.name}</h2>
                        <span>{category.description}</span>
                      </div>
                    </header>

                    {!deferredQuery && category.subcategories?.length ? (
                      <nav
                        className="web-navigation-subcategories"
                        aria-label={`${category.name}子分类`}
                      >
                        {category.subcategories.map((subcategory) => {
                          const isActive =
                            subcategory.id ===
                            (activeSubcategoryId ?? category.subcategories?.[0]?.id);

                          return (
                            <button
                              key={subcategory.id}
                              type="button"
                              aria-pressed={isActive}
                              onClick={() => setActiveSubcategoryId(subcategory.id)}
                            >
                              <span>{subcategory.name}</span>
                              <small>{subcategory.links.length}</small>
                            </button>
                          );
                        })}
                      </nav>
                    ) : null}
                  </div>

                  {category.links.length ? (
                    <div
                      className="web-navigation-links"
                      key={deferredQuery || activeSubcategoryId || category.id}
                    >
                      {category.links.map((link) => (
                        <a
                          className="web-navigation-link"
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          title={`${link.name} · ${getHostname(link.url)} — ${link.description}`}
                        >
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
                          <ArrowUpRight size={17} aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="web-navigation-subcategory-empty">
                      参考站当前尚未在这个子分类中收录网站。
                    </div>
                  )}
                </section>
              ))
            ) : (
              <div className="web-navigation-empty">
                <Search size={25} aria-hidden="true" />
                <p>换一个更短的关键词，或从上方分类重新浏览。</p>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setQuery('')}
                >
                  清空搜索
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
