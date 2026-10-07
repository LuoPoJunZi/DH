import { LockKeyhole } from 'lucide-react';
import { siteConfig } from '../../config/site';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container container--wide site-footer__inner">
        <div className="site-footer__intro">
          <p className="site-footer__heading">
            <span className="site-footer__brand">{siteConfig.shortName}</span>
            <span>{siteConfig.footer}</span>
          </p>
          <nav className="site-footer__friends" aria-label="友情链接">
            <ul className="site-footer__friends-list">
              {siteConfig.friendLinks.map((link) => (
                <li key={link.url}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer nofollow">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="site-footer__privacy">
          <LockKeyhole size={16} aria-hidden="true" />
          数据仅在浏览器本地处理
        </div>
        <div className="site-footer__links">
          <a href={siteConfig.blog} target="_blank" rel="noopener noreferrer">
            个人博客
          </a>
          <a href={siteConfig.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
