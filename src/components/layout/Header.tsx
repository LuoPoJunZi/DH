import { ChevronDown, Grid3X3, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { primaryNavigation } from '../../config/navigation';
import { tools } from '../../config/tools';
import { BrandMark } from '../common/BrandMark';
import { ThemeToggle } from '../common/ThemeToggle';
import { ToolDirectory } from './ToolDirectory';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const directoryButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setDirectoryOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!directoryOpen && !menuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setDirectoryOpen(false);
      setMenuOpen(false);
      directoryButtonRef.current?.focus();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [directoryOpen, menuOpen]);

  useEffect(() => {
    if (!directoryOpen && !menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [directoryOpen, menuOpen]);

  const closeNavigation = () => {
    setDirectoryOpen(false);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="site-header" data-directory-open={directoryOpen}>
        <div className="site-header__inner container">
          <BrandMark />
          <nav className="desktop-nav" aria-label="主导航">
            {primaryNavigation.map((item, index) => (
              <span className="desktop-nav__item" key={item.href}>
                <NavLink to={item.href} end={item.end}>
                  {item.label}
                </NavLink>
                {index === 0 && (
                  <button
                    ref={directoryButtonRef}
                    className="directory-trigger"
                    type="button"
                    aria-label={`${directoryOpen ? '关闭' : '打开'}工具目录，共 ${tools.length} 个工具`}
                    aria-expanded={directoryOpen}
                    aria-controls="desktop-tool-directory"
                    onClick={() => setDirectoryOpen((open) => !open)}
                  >
                    <Grid3X3 size={15} />
                    工具目录
                    <span>{tools.length}</span>
                    <ChevronDown className="directory-trigger__chevron" size={14} />
                  </button>
                )}
              </span>
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
              onClick={() => {
                setMenuOpen((open) => !open);
                setDirectoryOpen(false);
              }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {directoryOpen && (
          <div id="desktop-tool-directory">
            <ToolDirectory variant="desktop" onNavigate={closeNavigation} />
          </div>
        )}
        {menuOpen && (
          <nav id="mobile-navigation" className="mobile-nav container" aria-label="移动端导航">
            <div className="mobile-nav__primary">
              {primaryNavigation.map((item) => (
                <NavLink key={item.href} to={item.href} end={item.end}>
                  {item.label}
                </NavLink>
              ))}
            </div>
            <ToolDirectory variant="mobile" onNavigate={closeNavigation} />
          </nav>
        )}
      </header>
      {directoryOpen && (
        <button
          className="tool-directory-backdrop"
          type="button"
          aria-label="关闭工具目录"
          onClick={() => setDirectoryOpen(false)}
        />
      )}
    </>
  );
}
