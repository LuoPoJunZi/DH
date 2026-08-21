interface PrimaryNavigationItem {
  label: string;
  href: string;
  end: boolean;
  showToolDirectory?: boolean;
}

export const primaryNavigation: PrimaryNavigationItem[] = [
  { label: '首页', href: '/', end: true },
  { label: '在线工具', href: '/tools', end: false, showToolDirectory: true },
  { label: '开发', href: '/category/developer', end: false },
  { label: '文本', href: '/category/text', end: false },
];
