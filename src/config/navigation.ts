interface PrimaryNavigationItem {
  label: string;
  href: string;
  end: boolean;
}

export const primaryNavigation: PrimaryNavigationItem[] = [
  { label: '首页', href: '/', end: true },
  { label: '在线工具', href: '/tools', end: false },
];
