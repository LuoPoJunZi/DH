import { LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../../config/site';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <p className="site-footer__brand">{siteConfig.shortName}</p>
          <p>{siteConfig.footer}</p>
        </div>
        <div className="site-footer__privacy">
          <LockKeyhole size={16} aria-hidden="true" />
          数据仅在浏览器本地处理
        </div>
        <div className="site-footer__links">
          <Link to="/">首页</Link>
          <Link to="/navigation">网站导航</Link>
          {siteConfig.github ? (
            <a href={siteConfig.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
