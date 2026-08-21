import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/common/Seo';

export function NotFoundPage() {
  return (
    <div className="not-found container">
      <Seo title="页面未找到" description="请求的页面不存在。" />
      <p className="not-found__code">404</p>
      <h1>这个页面不在工具箱里。</h1>
      <p>地址可能已更改，或者你打开了一个不存在的工具。</p>
      <Link className="button button--primary" to="/">
        <ArrowLeft size={16} /> 返回首页
      </Link>
    </div>
  );
}
