import { useState } from 'react';
import { imageConfig } from '../../config/images';

export function SiteBackground() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="site-background" aria-hidden="true">
      <picture>
        <source media="(max-width: 760px)" srcSet={imageConfig.backgroundMobile} />
        <img
          className="site-background__image"
          data-loaded={loaded}
          src={imageConfig.backgroundDesktop}
          alt=""
          width={1920}
          height={1080}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
        />
      </picture>
    </div>
  );
}
