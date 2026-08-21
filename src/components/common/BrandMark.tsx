import { Link } from 'react-router-dom';
import { imageConfig } from '../../config/images';
import { siteConfig } from '../../config/site';

export function BrandMark() {
  return (
    <Link className="brand" to="/" aria-label={`${siteConfig.name}首页`}>
      <span className="brand__mark" aria-hidden="true">
        <img
          src={imageConfig.logo}
          alt=""
          loading="eager"
          decoding="async"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = imageConfig.logoFallback;
          }}
        />
      </span>
      <span className="brand__name">{siteConfig.shortName}</span>
    </Link>
  );
}
