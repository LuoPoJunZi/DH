import { useEffect } from 'react';
import { siteConfig } from '../../config/site/site';

interface SeoProps {
  title?: string;
  description?: string;
  keywords?: string[];
  path?: string;
  noindex?: boolean;
}

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
}

export function Seo({
  title,
  description = siteConfig.description,
  keywords = [],
  path,
  noindex = false,
}: SeoProps) {
  const keywordText = keywords.join(',');

  useEffect(() => {
    const fullTitle = title ? `${title} - ${siteConfig.shortName}` : siteConfig.name;
    const effectivePath = path ?? window.location.pathname;
    const canonical = new URL(effectivePath, siteConfig.url).href;
    document.title = fullTitle;
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[name="keywords"]', 'name', 'keywords', keywordText);
    setMeta(
      'meta[name="robots"]',
      'name',
      'robots',
      noindex ? 'noindex, nofollow' : 'index, follow',
    );
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);

    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.append(canonicalLink);
    }
    canonicalLink.href = canonical;
  }, [description, keywordText, noindex, path, title]);

  return null;
}
