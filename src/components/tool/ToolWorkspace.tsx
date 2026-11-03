import { Globe2, LockKeyhole } from 'lucide-react';
import type { ReactNode } from 'react';

export function ToolWorkspace({
  children,
  mode = 'local',
}: {
  children: ReactNode;
  mode?: 'local' | 'online';
}) {
  const Icon = mode === 'online' ? Globe2 : LockKeyhole;
  return (
    <section className="tool-workspace" aria-label="工具操作区">
      <div className="tool-workspace__privacy">
        <Icon size={15} aria-hidden="true" />
        <span>{mode === 'online' ? '在线地图数据' : '本地处理'}</span>
        <span className="tool-workspace__privacy-detail">
          {mode === 'online' ? '仅查询所选地区；收藏保存在当前浏览器' : '输入内容不会上传服务器'}
        </span>
      </div>
      {children}
    </section>
  );
}
