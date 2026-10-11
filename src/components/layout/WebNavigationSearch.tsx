import { Search, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { webNavigationLinkCount } from '../../config/webNavigation';

interface WebNavigationSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export function WebNavigationSearch({ query, onQueryChange }: WebNavigationSearchProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditing =
        target instanceof HTMLElement &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable);
      const isSearchShortcut =
        (event.key === '/' && !isEditing && !event.metaKey && !event.ctrlKey) ||
        (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey));

      if (isSearchShortcut && !event.altKey) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  return (
    <div className="web-navigation-search" role="search" aria-label="网站搜索">
      <span className="web-navigation-search__icon">
        <Search size={18} aria-hidden="true" />
      </span>
      <label className="sr-only" htmlFor="website-search">
        搜索网站
      </label>
      <input
        ref={searchRef}
        id="website-search"
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={'搜索 ' + webNavigationLinkCount + ' 个网站、用途或关键词…'}
        autoComplete="off"
      />
      {query ? (
        <button type="button" aria-label="清空网站搜索" onClick={() => onQueryChange('')}>
          <X size={17} />
        </button>
      ) : (
        <kbd aria-hidden="true" title="按 / 或 Ctrl/⌘ K 搜索">
          /
        </kbd>
      )}
    </div>
  );
}
