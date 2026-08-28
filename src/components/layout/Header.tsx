import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { primaryNavigation } from '../../config/navigation';
import { BrandMark } from '../common/BrandMark';
import { ThemeToggle } from '../common/ThemeToggle';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

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
    <header className="site-header">
      <div className="site-header__inner container container--wide">
        <BrandMark />
        <nav className="desktop-nav" aria-label="主导航">
          {primaryNavigation.map((item) => (
            <NavLink key={item.href} to={item.href} end={item.end}>
              {item.label}
            </NavLink>
          ))}
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
          <div className="mobile-nav__primary">
            {primaryNavigation.map((item) => (
              <NavLink key={item.href} to={item.href} end={item.end}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
