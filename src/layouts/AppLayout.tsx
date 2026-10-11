import { useState } from 'react';
import { matchPath, Outlet, useLocation } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { ScrollToTop } from '../components/layout/ScrollToTop';
import { SiteBackground } from '../components/layout/SiteBackground';
import { WebNavigationSearch } from '../components/layout/WebNavigationSearch';

export interface NavigationOutletContext {
  query: string;
  setQuery: (query: string) => void;
}

export function AppLayout() {
  const [query, setQuery] = useState('');
  const { pathname } = useLocation();
  const isNavigationPage = pathname === '/';
  const isToolDirectoryPage = Boolean(
    matchPath('/tools', pathname) || matchPath('/category/:categoryId', pathname),
  );
  const shellClassName =
    'app-shell' +
    (isNavigationPage
      ? ' app-shell--navigation'
      : isToolDirectoryPage
        ? ' app-shell--directory'
        : '');

  return (
    <div className={shellClassName}>
      <SiteBackground />
      <ScrollToTop />
      <Header
        search={
          isNavigationPage ? (
            <WebNavigationSearch query={query} onQueryChange={setQuery} />
          ) : undefined
        }
      />
      <main>
        <Outlet context={{ query, setQuery } satisfies NavigationOutletContext} />
      </main>
      <Footer />
    </div>
  );
}
