import { useState } from 'react';
import { Link } from 'react-router-dom';
import { imageConfig } from '../../config/site/images';
import { siteConfig } from '../../config/site/site';

export function BrandMark() {
  const [useFallback, setUseFallback] = useState(!imageConfig.logo);
  const logoSrc = useFallback ? imageConfig.logoFallback : imageConfig.logo;

  return (
    <Link className="brand" to="/" aria-label={`${siteConfig.name}首页`}>
      <span className="brand__mark" aria-hidden="true">
        <img
          src={logoSrc}
          alt=""
          loading="eager"
          decoding="async"
          onError={() => {
            if (!useFallback) setUseFallback(true);
          }}
        />
      </span>
      <span className="brand__name">{siteConfig.shortName}</span>
    </Link>
  );
}
