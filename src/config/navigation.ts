interface PrimaryNavigationItem {
  label: string;
  href: string;
  end: boolean;
}

export const primaryNavigation: PrimaryNavigationItem[] = [
  { label: '首页', href: '/', end: true },
  { label: '在线工具', href: '/tools', end: false },
  { label: '地址生成', href: '/tools/address-generator', end: false },
];
