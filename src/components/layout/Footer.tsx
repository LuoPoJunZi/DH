import { siteConfig } from '../../config/site';
import { BrandMark } from '../common/BrandMark';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container container--wide site-footer__inner">
        <div className="site-footer__identity">
          <BrandMark />
          <p className="site-footer__copyright">
            © {new Date().getFullYear()} {siteConfig.author} · {siteConfig.footer}
          </p>
        </div>
        <nav className="site-footer__links" aria-label="页脚链接">
          <a href={siteConfig.blog} target="_blank" rel="noopener noreferrer">
            个人博客
          </a>
          <a href={siteConfig.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
