import type {
  WebNavigationCategory,
  WebNavigationCategoryId,
  WebNavigationLink,
  WebNavigationSubcategory,
} from '../types/web-navigation';
import liumingyeNavigationData from './liumingye-navigation.data.json';

type WebNavigationLinkSource = Omit<WebNavigationLink, 'logoUrl'> & {
  logoUrl?: `https://${string}`;
};

type CoreNavigationCategorySource = Omit<WebNavigationCategory, 'links' | 'subcategories'> & {
  links: WebNavigationLinkSource[];
};

interface ImportedNavigationLink {
  name: string;
  description: string;
  url: string;
  logoUrl: string;
}

interface ImportedNavigationSubcategory {
  id: string;
  name: string;
  links: ImportedNavigationLink[];
}

interface ImportedNavigationCategory {
  id: string;
  name: string;
  description: string;
  sourceUrl: string;
  subcategories: ImportedNavigationSubcategory[];
}

const faviconEndpoint = 'https://www.google.com/s2/favicons';

function getWebsiteLogoUrl(url: `https://${string}`): `https://${string}` {
  const domain = encodeURIComponent(new URL(url).hostname);
  return `${faviconEndpoint}?domain=${domain}&sz=64`;
}

function asHttpsUrl(url: string): `https://${string}` {
  if (!url.startsWith('https://')) {
    throw new Error(`网站导航只允许 HTTPS URL：${url}`);
  }

  return url as `https://${string}`;
}

function uniqueLinks(links: WebNavigationLink[]) {
  return Array.from(new Map(links.map((link) => [link.url, link])).values());
}

const coreNavigationCategorySources: CoreNavigationCategorySource[] = [
  {
    id: 'ai',
    name: 'AI',
    description: '常用对话、代码与多模态 AI 助手',
    sourceUrl: 'https://dh.luopojunzi.com/',
    links: [
      {
        name: 'ChatGPT',
        description: '通用对话、写作与多模态 AI 助手',
        url: 'https://chatgpt.com/',
      },
      {
        name: 'Claude',
        description: '擅长代码与长文档处理的 AI 助手',
        url: 'https://claude.ai/',
      },
      {
        name: 'Gemini',
        description: 'Google 推出的多模态 AI 助手',
        url: 'https://gemini.google.com/',
      },
      {
        name: 'Grok',
        description: 'xAI 推出的对话与代码 AI 助手',
        url: 'https://grok.com/',
      },
    ],
  },
  {
    id: 'cloud',
    name: '云服务',
    description: '代码托管、域名与云端主机平台',
    sourceUrl: 'https://dh.luopojunzi.com/',
    links: [
      {
        name: 'Cloudflare',
        description: 'CDN、DNS 与安全服务控制台',
        url: 'https://dash.cloudflare.com/',
      },
      {
        name: 'GitHub',
        description: '代码托管与开源协作社区',
        url: 'https://github.com/',
      },
      {
        name: 'Porkbun',
        description: '域名注册与管理平台',
        url: 'https://porkbun.com/',
      },
      {
        name: 'Spaceship',
        description: '域名注册与云服务平台',
        url: 'https://www.spaceship.com/',
      },
      {
        name: 'CloudCone',
        description: '云服务器与实例管理平台',
        url: 'https://app.cloudcone.com/?ref=11880',
      },
      {
        name: 'RackNerd',
        description: 'VPS 与云端主机服务平台',
        url: 'https://my.racknerd.com/aff.php?aff=12190',
      },
      {
        name: 'RareCloud',
        description: '云端主机与网络服务平台',
        url: 'https://rarecloud.io/clients/aff.php?aff=585',
      },
      {
        name: 'Alice云',
        description: 'Alice 云服务控制台',
        url: 'https://console.alice.sh/dashboard',
      },
    ],
  },
  {
    id: 'network',
    name: '网络',
    description: '个人站点、网络检测与代理工具',
    sourceUrl: 'https://dh.luopojunzi.com/',
    links: [
      {
        name: '个人博客',
        description: '落魄君子的个人博客',
        url: 'https://blog.luopojunzi.com/',
      },
      {
        name: '落魄鸡窝',
        description: '落魄君子的社区站点',
        url: 'https://komari.luopojunzi.com/',
      },
      {
        name: 'IT-PING',
        description: '多节点网站 Ping 与网络质量测试',
        url: 'https://www.itdog.cn/ping/',
      },
      {
        name: 'Speedtest',
        description: '网络速度与延迟测试',
        url: 'https://www.speedtest.net/',
      },
      {
        name: 'v2rayN',
        description: 'Windows 网络代理客户端发布页',
        url: 'https://github.com/2dust/v2rayN/releases/',
      },
      {
        name: 'NekoBox',
        description: 'Android 网络代理客户端项目',
        url: 'https://github.com/MatsuriDayo/NekoBoxForAndroid',
      },
      {
        name: 'sing-box',
        description: '跨平台通用代理工具文档',
        url: 'https://sing-box.sagernet.org/',
      },
      {
        name: 'Shadowrocket',
        description: 'iOS 网络代理客户端 App Store 页面',
        url: 'https://apps.apple.com/app/shadowrocket/id932747118',
      },
    ],
  },
];

const coreNavigationCategories: WebNavigationCategory[] = coreNavigationCategorySources.map(
  (category) => ({
    ...category,
    links: category.links.map((link) => ({
      ...link,
      logoUrl: link.logoUrl ?? getWebsiteLogoUrl(link.url),
    })),
  }),
);

const importedNavigationCategories: WebNavigationCategory[] = (
  liumingyeNavigationData.categories as ImportedNavigationCategory[]
).map((category) => {
  const subcategories: WebNavigationSubcategory[] = category.subcategories.map((subcategory) => ({
    id: subcategory.id,
    name: subcategory.name,
    links: subcategory.links.map((link) => ({
      name: link.name,
      description: link.description,
      url: asHttpsUrl(link.url),
      logoUrl: asHttpsUrl(link.logoUrl),
    })),
  }));

  return {
    id: category.id as WebNavigationCategoryId,
    name: category.name,
    description: category.description,
    sourceUrl: asHttpsUrl(category.sourceUrl),
    links: uniqueLinks(subcategories.flatMap((subcategory) => subcategory.links)),
    subcategories,
  };
});

export const webNavigationCategories: WebNavigationCategory[] = [
  ...coreNavigationCategories,
  ...importedNavigationCategories,
];

export const webNavigationLinkCount = webNavigationCategories.reduce(
  (total, category) => total + category.links.length,
  0,
);
