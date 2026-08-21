import { LockKeyhole } from 'lucide-react';
import type { ReactNode } from 'react';

export function ToolWorkspace({ children }: { children: ReactNode }) {
  return (
    <section className="tool-workspace" aria-label="工具操作区">
      <div className="tool-workspace__privacy">
        <LockKeyhole size={15} aria-hidden="true" />
        <span>本地处理</span>
        <span className="tool-workspace__privacy-detail">输入内容不会上传服务器</span>
      </div>
      {children}
    </section>
  );
}
