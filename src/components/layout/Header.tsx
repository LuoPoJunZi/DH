import { Menu, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { primaryNavigation } from '../../config/site/navigation';
import { BrandMark } from '../common/BrandMark';
import { ThemeToggle } from '../common/ThemeToggle';

export function Header({ search }: { search?: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const selectedNavigation = primaryNavigation
    .filter(
      (item) =>
        location.pathname === item.href ||
        (!item.end && location.pathname.startsWith(item.href + '/')),
    )
    .sort((left, right) => right.href.length - left.href.length)[0];
  const navigationLinks = primaryNavigation.map((item) => {
    const selected = item === selectedNavigation;
    return (
      <NavLink
        key={item.href}
        to={item.href}
        end={item.end}
        className={() => (selected ? 'active' : '')}
        aria-current={selected ? 'page' : false}
      >
        {item.label}
      </NavLink>
    );
  });

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  return (
    <header className={search ? 'site-header site-header--with-search' : 'site-header'}>
      <div className="site-header__inner container container--wide">
        <BrandMark />
        {search && <div className="site-header__search">{search}</div>}
        <nav className="desktop-nav" aria-label="主导航">
          {navigationLinks}
        </nav>
        <div className="site-header__actions">
          <ThemeToggle />
          <button
            className="mobile-menu-button icon-button"
            type="button"
            aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="mobile-nav container container--wide"
          aria-label="移动端导航"
        >
          <div className="mobile-nav__primary">{navigationLinks}</div>
        </nav>
      )}
    </header>
  );
}
