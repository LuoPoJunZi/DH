import { useEffect } from 'react';
import { siteConfig } from '../config/site';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} - ${siteConfig.shortName}` : siteConfig.name;
  }, [title]);
}
